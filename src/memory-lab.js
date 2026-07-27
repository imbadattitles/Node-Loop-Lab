import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { labProfile } from './lab-profile.js';

const childPath = fileURLToPath(
  new URL('./memory-leak-child.js', import.meta.url),
);

const MB = 1024 * 1024;

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
    this.state = {
      status: 'idle',
      pid: null,
      config: null,
      latest: null,
      lastLog: 'Эксперимент ещё не запускался',
    };
  }

  snapshot() {
    return structuredClone(this.state);
  }

  broadcast(event, data) {
    const frame = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    for (const client of this.clients) {
      if (!client.writableEnded && !client.destroyed) {
        client.write(frame);
      }
    }
  }

  addClient(request, response) {
    if (this.clients.size >= this.profile.api.maxSseClients) {
      response.status(503).json({
        error: 'Достигнут лимит подключений к потоку memory-lab',
      });
      return;
    }

    response.status(200);
    response.set({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    response.flushHeaders();
    this.clients.add(response);
    response.write(`event: state\ndata: ${JSON.stringify(this.snapshot())}\n\n`);

    const heartbeat = setInterval(() => {
      if (!response.writableEnded) response.write(': keep-alive\n\n');
    }, 15_000);

    request.on('close', () => {
      clearInterval(heartbeat);
      this.clients.delete(response);
    });
  }

  start(input) {
    if (this.child) {
      const error = new Error('Эксперимент уже запущен');
      error.statusCode = 409;
      throw error;
    }

    const config = safeConfig(input, this.profile);
    const safety = {
      retainedLimitMb: this.profile.memory.retainedLimitMb,
      hardRssLimitMb: this.profile.memory.hardRssLimitMb,
      maxDurationMs: this.profile.memory.maxDurationMs,
      deadlineAction: this.profile.memory.deadlineAction,
    };
    const child = fork(childPath, [], {
      execArgv: [
        '--expose-gc',
        `--max-old-space-size=${this.profile.memory.v8HeapLimitMb}`,
      ],
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
      windowsHide: true,
    });

    this.child = child;
    this.state = {
      status: 'starting',
      pid: child.pid,
      config,
      latest: null,
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
    const allowed = new Set(['pause', 'resume', 'release', 'gc', 'stop']);
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

  stopForShutdown() {
    if (this.child) {
      this.child.kill();
      this.child = null;
    }
  }
}

export const memoryLab = new MemoryLab();
export { MemoryLab, safeConfig };
