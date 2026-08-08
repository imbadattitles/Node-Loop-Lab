import { fork } from 'node:child_process';
import path from 'node:path';
import { labProfile } from './lab-profile.js';
import { isCpuBlockingDemo } from './demo-execution-policy.js';

const sourceRoot = path.resolve(
  process.env.NODE_LOOP_SOURCE_DIR ||
    path.join(/* turbopackIgnore: true */ process.cwd(), 'src'),
);
const childPath = path.join(sourceRoot, 'disposable-demo-child.js');
const activeChildrenKey = Symbol.for(
  'node-loop-lab.disposable-demo-active-children',
);
const exitHookKey = Symbol.for('node-loop-lab.disposable-demo-exit-hook');
const activeChildren =
  globalThis[activeChildrenKey] ??
  (globalThis[activeChildrenKey] = new Set());

if (!globalThis[exitHookKey]) {
  globalThis[exitHookKey] = true;
  process.once('exit', () => {
    for (const child of activeChildren) child.kill();
  });
}
const inheritedEnvironmentKeys = [
  'NODE_ENV',
  'TZ',
  'LANG',
  'LC_ALL',
  'TEMP',
  'TMP',
  'TMPDIR',
  'SystemRoot',
  'WINDIR',
];

export class DemoIsolationError extends Error {
  constructor(message, { code, statusCode = 500 } = {}) {
    super(message);
    this.name = 'DemoIsolationError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

function abortError() {
  const error = new DemoIsolationError('Запуск изолированного сценария отменён', {
    code: 'DEMO_CHILD_ABORTED',
    statusCode: 499,
  });
  error.name = 'AbortError';
  return error;
}

function isolatedEnvironment() {
  return {
    NODE_LOOP_SOURCE_DIR: sourceRoot,
    NODE_LOOP_LAB_DISPOSABLE_CHILD: '1',
    LAB_MODE: 'public',
    ...Object.fromEntries(
      inheritedEnvironmentKeys
        .filter((key) => process.env[key] !== undefined)
        .map((key) => [key, process.env[key]]),
    ),
  };
}

function validEvent(event) {
  return (
    event &&
    typeof event === 'object' &&
    typeof event.lane === 'string' &&
    typeof event.type === 'string' &&
    typeof event.message === 'string'
  );
}

export function executeDemoChild(
  demoId,
  emit,
  {
    signal,
    timeoutMs = 8_000,
    v8HeapLimitMb = 192,
    maxEvents = 512,
    maxIpcBytes = 512 * 1024,
    maxStdioBytes = 32 * 1024,
  } = {},
) {
  if (!isCpuBlockingDemo(demoId)) {
    return Promise.reject(
      new DemoIsolationError(
        `Сценарий ${demoId} не входит в список CPU-блокирующих сценариев`,
        { code: 'DEMO_CHILD_NOT_ALLOWED', statusCode: 400 },
      ),
    );
  }
  if (signal?.aborted) return Promise.reject(abortError());

  return new Promise((resolve, reject) => {
    const child = fork(/* turbopackIgnore: true */ childPath, [], {
      cwd: process.cwd(),
      env: isolatedEnvironment(),
      execArgv: [`--max-old-space-size=${v8HeapLimitMb}`],
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
      windowsHide: true,
    });
    activeChildren.add(child);

    let settled = false;
    let receivedDone = false;
    let eventCount = 0;
    let ipcBytes = 0;
    let stdioBytes = 0;
    let stderr = '';

    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      signal?.removeEventListener('abort', onAbort);
      if (child.connected) child.disconnect();
      if (child.exitCode === null && child.signalCode === null) child.kill();
      if (error) reject(error);
      else resolve();
    };

    const fail = (message, code, statusCode = 500) => {
      finish(new DemoIsolationError(message, { code, statusCode }));
    };

    const onAbort = () => finish(abortError());
    signal?.addEventListener('abort', onAbort, { once: true });

    const timeout = setTimeout(() => {
      fail(
        `Изолированный сценарий превысил лимит ${timeoutMs} мс и был остановлен`,
        'DEMO_CHILD_TIMEOUT',
        504,
      );
    }, timeoutMs);
    timeout.unref?.();

    const collectStdio = (chunk, isError) => {
      stdioBytes += chunk.length;
      if (isError && stderr.length < 4_096) stderr += chunk.toString('utf8');
      if (stdioBytes > maxStdioBytes) {
        fail(
          'Изолированный сценарий превысил лимит вывода',
          'DEMO_CHILD_OUTPUT_LIMIT',
          500,
        );
      }
    };

    child.stdout.on('data', (chunk) => collectStdio(chunk, false));
    child.stderr.on('data', (chunk) => collectStdio(chunk, true));

    child.on('message', (message) => {
      if (settled) return;

      let encoded;
      try {
        encoded = JSON.stringify(message);
      } catch {
        fail('Дочерний процесс отправил несериализуемое сообщение', 'DEMO_CHILD_PROTOCOL');
        return;
      }
      ipcBytes += Buffer.byteLength(encoded);
      if (ipcBytes > maxIpcBytes) {
        fail(
          'Изолированный сценарий превысил лимит IPC-данных',
          'DEMO_CHILD_OUTPUT_LIMIT',
        );
        return;
      }

      if (message?.type === 'ready') {
        emit('isolation', 'info', 'Дочерний процесс готов', {
          pid: message.pid,
          disposable: true,
        });
        return;
      }

      if (message?.type === 'event') {
        eventCount += 1;
        if (eventCount > maxEvents) {
          fail(
            'Изолированный сценарий превысил лимит событий',
            'DEMO_CHILD_OUTPUT_LIMIT',
          );
          return;
        }
        if (!validEvent(message.event)) {
          fail('Дочерний процесс отправил некорректное событие', 'DEMO_CHILD_PROTOCOL');
          return;
        }
        emit(
          message.event.lane,
          message.event.type,
          message.event.message,
          message.event.details ?? null,
        );
        return;
      }

      if (message?.type === 'done') {
        receivedDone = true;
        return;
      }

      if (message?.type === 'error') {
        fail(
          `Ошибка изолированного сценария: ${message.error || 'неизвестная ошибка'}`,
          'DEMO_CHILD_RUN_FAILED',
        );
        return;
      }

      fail('Дочерний процесс нарушил IPC-протокол', 'DEMO_CHILD_PROTOCOL');
    });

    child.once('error', (error) => {
      fail(`Не удалось запустить изолированный сценарий: ${error.message}`, 'DEMO_CHILD_SPAWN');
    });

    child.once('exit', (code, exitSignal) => {
      activeChildren.delete(child);
      if (settled) return;
      if (code === 0 && receivedDone) {
        finish();
        return;
      }
      const suffix = stderr.trim()
        ? `: ${stderr.trim().slice(0, 512)}`
        : '';
      fail(
        `Изолированный сценарий завершился неожиданно (code=${code ?? '—'}, signal=${exitSignal ?? '—'})${suffix}`,
        'DEMO_CHILD_EXIT',
      );
    });

    emit('isolation', 'schedule', 'Запускаем изолированный процесс…', {
      disposable: true,
      timeoutMs,
      v8HeapLimitMb,
    });
    child.send({ type: 'run', demoId });
  });
}

export class DisposableDemoExecutor {
  constructor(config = {}) {
    this.config = {
      maxConcurrent: 2,
      maxQueue: 1,
      ...config,
    };
    this.active = 0;
    this.queue = [];
  }

  snapshot() {
    return { active: this.active, queued: this.queue.length };
  }

  run(demoId, emit, { signal } = {}) {
    if (signal?.aborted) return Promise.reject(abortError());
    if (
      this.active >= this.config.maxConcurrent &&
      this.queue.length >= this.config.maxQueue
    ) {
      return Promise.reject(
        new DemoIsolationError(
          'Очередь изолированных CPU-сценариев заполнена. Повторите немного позже.',
          { code: 'DEMO_CHILD_QUEUE_FULL', statusCode: 503 },
        ),
      );
    }

    return new Promise((resolve, reject) => {
      const job = { demoId, emit, signal, resolve, reject, onAbort: null };
      if (signal) {
        job.onAbort = () => {
          const index = this.queue.indexOf(job);
          if (index === -1) return;
          this.queue.splice(index, 1);
          reject(abortError());
        };
        signal.addEventListener('abort', job.onAbort, { once: true });
      }
      this.queue.push(job);
      this.drain();
    });
  }

  drain() {
    while (
      this.active < this.config.maxConcurrent &&
      this.queue.length > 0
    ) {
      const job = this.queue.shift();
      job.signal?.removeEventListener('abort', job.onAbort);
      if (job.signal?.aborted) {
        job.reject(abortError());
        continue;
      }

      this.active += 1;
      executeDemoChild(job.demoId, job.emit, {
        ...this.config,
        signal: job.signal,
      })
        .then(job.resolve, job.reject)
        .finally(() => {
          this.active = Math.max(0, this.active - 1);
          this.drain();
        });
    }
  }
}

function executorConfig(profile = labProfile) {
  return profile.api.demoIsolation;
}

const executorKey = Symbol.for('node-loop-lab.disposable-demo-executor');
export const disposableDemoExecutor =
  globalThis[executorKey] ??
  (globalThis[executorKey] = new DisposableDemoExecutor(executorConfig()));

export async function runDemoWithIsolation(
  demo,
  emit,
  {
    profile = labProfile,
    executor = disposableDemoExecutor,
    signal,
  } = {},
) {
  if (
    profile.api.demoIsolation.enabled &&
    isCpuBlockingDemo(demo.id)
  ) {
    return executor.run(demo.id, emit, { signal });
  }
  return demo.run(emit);
}
