import { createServer } from 'node:http';
import { monitorEventLoopDelay, performance } from 'node:perf_hooks';
import path from 'node:path';
import { Worker } from 'node:worker_threads';
import { pathToFileURL } from 'node:url';

const sourceRoot = path.resolve(
  process.env.NODE_LOOP_SOURCE_DIR || path.join(process.cwd(), 'src'),
);
const cpuWorkerUrl = pathToFileURL(path.join(sourceRoot, 'load-cpu-worker.js'));
const generatorWorkerUrl = pathToFileURL(
  path.join(sourceRoot, 'load-generator-worker.js'),
);

function burnCpu(durationMs) {
  const startedAt = performance.now();
  let checksum = 0;

  while (performance.now() - startedAt < durationMs) {
    checksum += Math.sqrt((checksum % 10_000) + 1);
  }

  return checksum;
}

class BoundedWorkerPool {
  constructor(size) {
    this.queue = [];
    this.slots = [];
    this.nextJobId = 0;
    this.maxQueueDepth = 0;
    this.closed = false;

    for (let index = 0; index < size; index += 1) {
      const worker = new Worker(cpuWorkerUrl);
      const slot = { worker, job: null, failed: false };

      worker.on('message', (result) => {
        const job = slot.job;
        slot.job = null;
        job?.resolve(result);
        this.dispatch();
      });
      worker.on('error', (error) => {
        slot.failed = true;
        const job = slot.job;
        slot.job = null;
        job?.reject(error);
        this.dispatch();
      });

      this.slots.push(slot);
    }
  }

  run(durationMs) {
    if (this.closed) return Promise.reject(new Error('Worker pool is closed'));

    return new Promise((resolve, reject) => {
      this.queue.push({
        jobId: ++this.nextJobId,
        durationMs,
        resolve,
        reject,
      });
      this.dispatch();
      this.maxQueueDepth = Math.max(this.maxQueueDepth, this.queue.length);
    });
  }

  dispatch() {
    for (const slot of this.slots) {
      if (slot.failed || slot.job || this.queue.length === 0) continue;
      slot.job = this.queue.shift();
      slot.worker.postMessage({
        jobId: slot.job.jobId,
        durationMs: slot.job.durationMs,
      });
    }
  }

  async close() {
    this.closed = true;
    const error = new Error('Worker pool closed before the queued job ran');
    for (const job of this.queue.splice(0)) job.reject(error);
    await Promise.allSettled(
      this.slots.map(({ worker }) => worker.terminate()),
    );
  }
}

function startGenerator(workerData) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(generatorWorkerUrl, { workerData });
    const timeout = setTimeout(() => {
      worker.terminate().catch(() => {});
      reject(new Error('Load generator exceeded its safety timeout'));
    }, workerData.durationMs + 5000);

    worker.once('message', (message) => {
      clearTimeout(timeout);
      worker.terminate().catch(() => {});
      if (message.kind === 'error') reject(new Error(message.error));
      else resolve(message.result);
    });
    worker.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

async function runProfile(mode) {
  const pool = mode === 'worker' ? new BoundedWorkerPool(2) : null;
  const delay = monitorEventLoopDelay({ resolution: 5 });
  let activeRequests = 0;
  let maxActiveRequests = 0;

  const server = createServer(async (request, response) => {
    activeRequests += 1;
    maxActiveRequests = Math.max(maxActiveRequests, activeRequests);

    try {
      if (request.url === '/cpu') {
        if (mode === 'main') burnCpu(24);
        else await pool.run(24);
      }

      response.writeHead(200, {
        'content-type': 'application/json',
        connection: 'keep-alive',
      });
      response.end('{"ok":true}');
    } catch (error) {
      response.writeHead(500, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ error: error.message }));
    } finally {
      activeRequests -= 1;
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  const origin = `http://127.0.0.1:${address.port}`;
  delay.enable();

  try {
    const warmup = await fetch(`${origin}/fast`);
    await warmup.arrayBuffer();
    const result = await startGenerator({
      origin,
      durationMs: 700,
      concurrency: 10,
      cpuEvery: 4,
    });

    return {
      ...result,
      mode,
      eventLoopDelayP95Ms: Number(
        (delay.percentile(95) / 1e6).toFixed(1),
      ),
      eventLoopDelayMaxMs: Number((delay.max / 1e6).toFixed(1)),
      maxActiveRequests,
      maxQueueDepth: pool?.maxQueueDepth ?? 0,
    };
  } finally {
    delay.disable();
    await closeServer(server);
    await pool?.close();
  }
}

function metricLine(label, result) {
  return `${label}: ${result.rps.toFixed(1)} RPS · p50=${result.latency.p50Ms.toFixed(
    1,
  )} ms · p95=${result.latency.p95Ms.toFixed(1)} ms · p99=${result.latency.p99Ms.toFixed(
    1,
  )} ms · fast p95=${result.fastLatency.p95Ms.toFixed(1)} ms · errors=${result.errors} · Event Loop p95=${result.eventLoopDelayP95Ms.toFixed(
    1,
  )} ms · max queue=${result.maxQueueDepth}`;
}

export async function runLoadComparison(emit) {
  emit(
    'load-test',
    'section',
    'Часть C — настоящий HTTP load test: одинаковый смешанный профиль /fast + /cpu',
  );
  emit(
    'load-test',
    'info',
    'Генератор работает в отдельном Worker: 10 клиентов, 700 мс, каждый четвёртый запрос выполняет 24 мс CPU-работы',
  );

  emit(
    'load-main',
    'schedule',
    'Профиль main: CPU-обработчик выполняется прямо в Event Loop временного HTTP-сервера',
  );
  const main = await runProfile('main');
  emit('load-main', 'result', metricLine('MAIN', main), main);

  emit(
    'load-worker',
    'schedule',
    'Профиль worker: тот же CPU-обработчик проходит через ограниченный пул из 2 Worker Threads',
  );
  const worker = await runProfile('worker');
  emit('load-worker', 'result', metricLine('WORKER', worker), worker);

  emit(
    'load-test',
    'result',
    'Сравнивайте не только RPS: fast p95 и Event Loop delay показывают, мог ли сервер отвечать на дешёвые запросы во время CPU-нагрузки',
    { main, worker },
  );

  return { main, worker };
}
