import { fork } from 'node:child_process';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { labProfile } from './lab-profile.js';

const childPath = path.resolve(
  process.env.NODE_LOOP_SOURCE_DIR ||
    path.join(/* turbopackIgnore: true */ process.cwd(), 'src'),
  'memory-leak-child.js',
);

const MB = 1024 * 1024;
const childEnvironmentKeys = [
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

function isolatedChildEnvironment() {
  return {
    NODE_LOOP_LAB_MEMORY_CHILD: '1',
    ...Object.fromEntries(
      childEnvironmentKeys
        .filter((key) => process.env[key] !== undefined)
        .map((key) => [key, process.env[key]]),
    ),
  };
}

function safeConfig(input = {}, profile = labProfile) {
  const memory = profile.memory;
  const defaultConfig = memory.defaultConfig;
  return {
    kind: memory.kinds.includes(input.kind) ? input.kind : defaultConfig.kind,
    allocationMb: memory.allocationMb.includes(Number(input.allocationMb))
      ? Number(input.allocationMb)
      : defaultConfig.allocationMb,
    intervalMs: memory.intervalMs.includes(Number(input.intervalMs))
      ? Number(input.intervalMs)
      : defaultConfig.intervalMs,
    limitMb: memory.limitMb.includes(Number(input.limitMb))
      ? Number(input.limitMb)
      : defaultConfig.limitMb,
  };
}

class MemoryLab {
  constructor(profile = labProfile) {
    this.profile = profile;
    this.child = null;
    this.clients = new Set();
    this.stopTimer = null;
    this.snapshotPath = null;
    this.state = {
      status: 'idle',
      pid: null,
      config: null,
      latest: null,
      snapshot: { status: 'idle' },
      lastLog: 'Эксперимент ещё не запускался',
    };
  }

  cleanupSnapshot() {
    const previousPath = this.snapshotPath;
    this.snapshotPath = null;
    if (previousPath) void unlink(previousPath).catch(() => {});
  }

  snapshot() {
    return structuredClone(this.state);
  }

  broadcast(event, data) {
    const frame = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    for (const client of this.clients) {
      try {
        client.controller.enqueue(client.encoder.encode(frame));
      } catch {
        client.close();
      }
    }
  }

  createEventStream(signal) {
    if (this.clients.size >= this.profile.api.maxSseClients) {
      const error = new Error(
        'Достигнут лимит подключений к потоку memory-lab',
      );
      error.statusCode = 503;
      throw error;
    }

    const lab = this;
    let client;
    return new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        let closed = false;
        const close = () => {
          if (closed) return;
          closed = true;
          clearInterval(client.heartbeat);
          lab.clients.delete(client);
          try {
            controller.close();
          } catch {
            // Поток уже закрыт браузером.
          }
        };

        client = { controller, encoder, close, heartbeat: null };
        lab.clients.add(client);
        controller.enqueue(
          encoder.encode(
            `event: state\ndata: ${JSON.stringify(lab.snapshot())}\n\n`,
          ),
        );
        client.heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': keep-alive\n\n'));
          } catch {
            close();
          }
        }, 15_000);
        client.heartbeat.unref?.();
        signal?.addEventListener('abort', close, { once: true });
      },
      cancel() {
        client?.close();
      },
    });
  }

  start(input) {
    if (this.child) {
      const error = new Error('Эксперимент уже запущен');
      error.statusCode = 409;
      throw error;
    }

    this.cleanupSnapshot();
    const config = safeConfig(input, this.profile);
    const safety = {
      retainedLimitMb: this.profile.memory.retainedLimitMb,
      hardRssLimitMb: this.profile.memory.hardRssLimitMb,
      maxDurationMs: this.profile.memory.maxDurationMs,
      deadlineAction: this.profile.memory.deadlineAction,
    };
    const child = fork(/* turbopackIgnore: true */ childPath, [], {
      execArgv: [
        '--expose-gc',
        `--max-old-space-size=${this.profile.memory.v8HeapLimitMb}`,
      ],
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
      // Heap snapshots can contain strings reachable in the target isolate.
      // Do not let the synthetic lab child inherit application secrets.
      env: isolatedChildEnvironment(),
      windowsHide: true,
    });

    this.child = child;
    this.state = {
      status: 'starting',
      pid: child.pid,
      config,
      latest: null,
      snapshot: { status: 'idle' },
      lastLog: 'Запускаем изолированный процесс…',
    };
    this.broadcast('state', this.snapshot());

    child.on('message', (message) => {
      if (message.type === 'sample') {
        this.state.status = message.status;
        this.state.latest = {
          elapsedMs: message.elapsedMs,
          retainedBytes: message.retainedBytes,
          blocks: message.blocks,
          memory: message.memory,
          reason: message.reason,
        };
        this.broadcast('sample', this.snapshot());

        // Дочерний процесс также проверяет этот предел сам. Дублирование в
        // supervisor защищает лабораторию при ошибке учебного сценария.
        if (
          message.memory.rss >
          this.profile.memory.hardRssLimitMb * MB
        ) {
          this.state.lastLog =
            'Supervisor остановил процесс: превышен аварийный предел RSS';
          this.broadcast('log', {
            level: 'error',
            message: this.state.lastLog,
          });
          child.kill();
        }
      } else if (message.type === 'log') {
        this.state.lastLog = message.message;
        this.broadcast('log', message);
      } else if (message.type === 'snapshot') {
        if (message.status === 'ready') {
          this.cleanupSnapshot();
          this.snapshotPath = message.path;
          this.state.snapshot = {
            status: 'ready',
            fileName: message.fileName,
            size: message.size,
            createdAt: message.createdAt,
          };
        } else if (message.status === 'error') {
          this.state.snapshot = {
            status: 'error',
            error: message.error,
          };
        } else {
          this.state.snapshot = { status: 'creating' };
        }
        this.broadcast('state', this.snapshot());
      }
    });

    child.stderr.on('data', (chunk) => {
      const message = chunk.toString().trim();
      if (!message) return;
      this.state.lastLog = message;
      this.broadcast('log', { level: 'error', message });
    });

    child.on('error', (error) => {
      this.state.lastLog = error.message;
      this.broadcast('log', { level: 'error', message: error.message });
    });

    child.on('exit', (code, signal) => {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
      this.child = null;
      this.state.status = 'stopped';
      this.state.pid = null;
      this.state.lastLog =
        code === 0
          ? 'Изолированный процесс остановлен'
          : `Процесс завершился: code=${code ?? '—'}, signal=${signal ?? '—'}`;
      this.broadcast('state', this.snapshot());
      this.broadcast('log', {
        level: code === 0 ? 'info' : 'error',
        message: this.state.lastLog,
      });
    });

    child.send({ type: 'start', config: { ...config, safety } });
    return this.snapshot();
  }

  action(action) {
    const allowed = new Set([
      'pause',
      'resume',
      'release',
      'gc',
      'snapshot',
      'stop',
    ]);
    if (!allowed.has(action)) {
      const error = new Error('Неизвестное действие');
      error.statusCode = 400;
      throw error;
    }

    if (!this.child?.connected) {
      const error = new Error('Сначала запустите эксперимент');
      error.statusCode = 409;
      throw error;
    }

    if (action === 'snapshot') {
      if (this.state.snapshot?.status === 'creating') {
        const error = new Error('Heap snapshot уже создаётся');
        error.statusCode = 409;
        throw error;
      }
      const retainedMb = (this.state.latest?.retainedBytes ?? 0) / MB;
      const snapshotLimit = this.profile.memory.snapshotMaxRetainedMb;
      if (retainedMb > snapshotLimit) {
        const error = new Error(
          `Сначала уменьшите retained до ${snapshotLimit} MB или ниже: heap snapshot может временно удвоить потребление V8 heap`,
        );
        error.statusCode = 413;
        throw error;
      }
      this.state.snapshot = { status: 'creating' };
      this.broadcast('state', this.snapshot());
    }

    this.child.send({ type: 'action', action });

    if (action === 'stop') {
      clearTimeout(this.stopTimer);
      this.stopTimer = setTimeout(() => {
        if (this.child) this.child.kill();
      }, 1000);
      this.stopTimer.unref();
    }

    return this.snapshot();
  }

  snapshotDownload() {
    if (
      !this.snapshotPath ||
      this.state.snapshot?.status !== 'ready'
    ) {
      const error = new Error('Сначала создайте heap snapshot');
      error.statusCode = 404;
      throw error;
    }

    return {
      path: this.snapshotPath,
      ...this.state.snapshot,
    };
  }

  stopForShutdown() {
    if (this.child) {
      this.child.kill();
      this.child = null;
    }
    this.cleanupSnapshot();
  }
}

const memoryLabKey = Symbol.for('node-loop-lab.memory');
export const memoryLab =
  globalThis[memoryLabKey] ?? (globalThis[memoryLabKey] = new MemoryLab());
export { MemoryLab, safeConfig };
