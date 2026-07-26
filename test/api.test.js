import test from 'node:test';
import assert from 'node:assert/strict';
import { app, loopDelay } from '../src/app.js';
import { memoryLab } from '../src/memory-lab.js';

async function withServer(run) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();

  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function waitFor(check, timeoutMs = 3000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const value = await check();
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error('Превышено время ожидания состояния');
}

test.after(() => {
  memoryLab.stopForShutdown();
  loopDelay.disable();
});

test('GET /api/demos возвращает каталог сценариев', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/demos`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.demos.length, 6);
    assert.ok(body.demos.every((demo) => !('run' in demo)));
  });
});

test('GET /api/health возвращает метрики Event Loop', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`);
    const body = await response.json();

    assert.equal(body.ok, true);
    assert.equal(typeof body.loop.p95DelayMs, 'number');
  });
});

test('POST /api/demos/event-loop-order стримит события NDJSON', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/demos/event-loop-order/run`, {
      method: 'POST',
    });
    const lines = (await response.text()).trim().split('\n');
    const events = lines.map((line) => JSON.parse(line));

    assert.equal(response.status, 200);
    assert.equal(events[0].type, 'start');
    assert.equal(events.at(-1).type, 'done');
    assert.ok(events.some((event) => event.lane === 'nextTick'));
    assert.ok(events.some((event) => event.lane === 'microtasks'));
    assert.ok(events.some((event) => event.lane === 'poll'));
  });
});

test('утечка стартует только вручную и поддерживает полный lifecycle', async () => {
  await withServer(async (baseUrl) => {
    const before = await (await fetch(`${baseUrl}/api/memory`)).json();
    assert.equal(before.status, 'idle');
    assert.equal(before.pid, null);

    const startedResponse = await fetch(`${baseUrl}/api/memory/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'external',
        allocationMb: 1,
        intervalMs: 250,
        limitMb: 64,
      }),
    });
    const started = await startedResponse.json();
    assert.equal(startedResponse.status, 202);
    assert.equal(started.status, 'starting');
    assert.equal(typeof started.pid, 'number');

    const leaking = await waitFor(async () => {
      const snapshot = await (await fetch(`${baseUrl}/api/memory`)).json();
      return snapshot.latest?.retainedBytes > 0 ? snapshot : null;
    });
    assert.equal(leaking.config.limitMb, 64);
    assert.ok(leaking.latest.memory.external > 0);

    await fetch(`${baseUrl}/api/memory/action/pause`, { method: 'POST' });
    await waitFor(async () => {
      const snapshot = await (await fetch(`${baseUrl}/api/memory`)).json();
      return snapshot.status === 'paused';
    });

    await fetch(`${baseUrl}/api/memory/action/release`, { method: 'POST' });
    const released = await waitFor(async () => {
      const snapshot = await (await fetch(`${baseUrl}/api/memory`)).json();
      return snapshot.latest?.retainedBytes === 0 ? snapshot : null;
    });
    assert.equal(released.latest.blocks, 0);

    await fetch(`${baseUrl}/api/memory/action/gc`, { method: 'POST' });
    await fetch(`${baseUrl}/api/memory/action/stop`, { method: 'POST' });
    const stopped = await waitFor(async () => {
      const snapshot = await (await fetch(`${baseUrl}/api/memory`)).json();
      return snapshot.status === 'stopped' ? snapshot : null;
    });
    assert.equal(stopped.pid, null);
  });
});
