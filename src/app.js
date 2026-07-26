import express from 'express';
import { monitorEventLoopDelay, performance } from 'node:perf_hooks';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { demos, publicDemo } from './demos.js';
import { memoryLab } from './memory-lab.js';

const frontendDirectory = fileURLToPath(new URL('../dist', import.meta.url));
const loopDelay = monitorEventLoopDelay({ resolution: 20 });
loopDelay.enable();

const app = express();
app.disable('x-powered-by');
app.use(express.json());

app.get('/api/demos', (_request, response) => {
  response.json({
    node: process.version,
    platform: `${process.platform}/${process.arch}`,
    demos: demos.map(publicDemo),
  });
});

app.get('/api/health', (_request, response) => {
  const utilization = performance.eventLoopUtilization();
  const nanosecondsToMilliseconds = (value) =>
    Number.isFinite(value) ? Number((value / 1e6).toFixed(1)) : 0;

  response.set('Cache-Control', 'no-store').json({
    ok: true,
    pid: process.pid,
    uptimeSeconds: Math.round(process.uptime()),
    loop: {
      utilization: Number((utilization.utilization * 100).toFixed(1)),
      meanDelayMs: nanosecondsToMilliseconds(loopDelay.mean),
      maxDelayMs: nanosecondsToMilliseconds(loopDelay.max),
      p95DelayMs: nanosecondsToMilliseconds(loopDelay.percentile(95)),
    },
  });
});

app.get('/api/memory', (_request, response) => {
  response.set('Cache-Control', 'no-store').json(memoryLab.snapshot());
});

app.get('/api/memory/events', (request, response) => {
  memoryLab.addClient(request, response);
});

app.post('/api/memory/start', (request, response) => {
  try {
    response.status(202).json(memoryLab.start(request.body));
  } catch (error) {
    response.status(error.statusCode ?? 500).json({ error: error.message });
  }
});

app.post('/api/memory/action/:action', (request, response) => {
  try {
    response.json(memoryLab.action(request.params.action));
  } catch (error) {
    response.status(error.statusCode ?? 500).json({ error: error.message });
  }
});

app.post('/api/demos/:id/run', async (request, response) => {
  const demo = demos.find((candidate) => candidate.id === request.params.id);

  if (!demo) {
    response.status(404).json({ error: 'Неизвестный учебный сценарий' });
    return;
  }

  if (demo.interactive) {
    response.status(400).json({
      error: 'Этот сценарий управляется через интерактивную панель',
    });
    return;
  }

  const runId = randomUUID().slice(0, 8);
  const startedAt = performance.now();
  let sequence = 0;

  response.status(200);
  response.set({
    'Content-Type': 'application/x-ndjson; charset=utf-8',
    'Cache-Control': 'no-store, no-transform',
    'X-Content-Type-Options': 'nosniff',
  });
  response.flushHeaders();

  const emit = (lane, type, message, details = null) => {
    sequence += 1;
    const event = {
      runId,
      demoId: demo.id,
      sequence,
      at: Number((performance.now() - startedAt).toFixed(1)),
      lane,
      type,
      message,
      details,
    };

    // Те же события видны и в терминале — удобно сравнивать UI с сервером.
    console.log(
      `[${runId}] +${String(event.at).padStart(6)}ms [${lane}] ${message}`,
    );

    if (!response.writableEnded && !response.destroyed) {
      response.write(`${JSON.stringify(event)}\n`);
    }
  };

  emit('system', 'start', `Запуск «${demo.title}»`);

  try {
    await demo.run(emit);
    emit(
      'system',
      'done',
      `Сценарий завершён за ${Math.round(performance.now() - startedAt)} мс`,
    );
  } catch (error) {
    emit('system', 'error', error.message);
  } finally {
    if (!response.writableEnded) response.end();
  }
});

app.use(express.static(frontendDirectory));

app.get('/{*splat}', (_request, response) => {
  response.sendFile(path.join(frontendDirectory, 'index.html'));
});

export { app, loopDelay };
