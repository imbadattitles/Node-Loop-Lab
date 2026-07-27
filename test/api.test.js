import test from 'node:test';
import assert from 'node:assert/strict';
import { GET as getDemos } from '../app/api/demos/route.js';
import { POST as runDemo } from '../app/api/demos/[id]/run/route.js';
import { GET as getHealth } from '../app/api/health/route.js';
import { GET as getMemory } from '../app/api/memory/route.js';
import { POST as startMemory } from '../app/api/memory/start/route.js';
import { POST as memoryAction } from '../app/api/memory/action/[action]/route.js';
import { memoryLab } from '../src/memory-lab.js';
import { runtimeState } from '../src/runtime-state.js';

const baseUrl = 'http://localhost:3000';

async function waitFor(check, timeoutMs = 3000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const value = await check();
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('Превышено время ожидания состояния');
}

function post(path, body) {
  return new Request(`${baseUrl}${path}`, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function snapshot() {
  return (await getMemory()).json();
}

test.after(() => {
  memoryLab.stopForShutdown();
  runtimeState.loopDelay.disable();
});

test('GET /api/demos возвращает каталог сценариев', async () => {
  const response = getDemos();
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.demos.length, 7);
  assert.ok(body.demos.every((demo) => !('run' in demo)));
  assert.ok(
    body.demos.every(
      (demo) =>
        demo.runtimeFiles.length >= 1 &&
        demo.runtimeFiles.every(
          (file) => file.path.startsWith('src/') && file.code.length > 200,
        ),
    ),
  );

  const eventLoop = body.demos.find((demo) => demo.id === 'event-loop-order');
  assert.match(
    eventLoop.runtimeFiles[0].code,
    /async function eventLoopOrder\(emit\)/,
  );
  assert.match(eventLoop.runtimeFiles[0].code, /emit\('nextTick'/);

  const worker = body.demos.find(
    (demo) => demo.id === 'blocking-vs-worker',
  );
  assert.deepEqual(
    worker.runtimeFiles.map((file) => file.path),
    ['src/demos.js', 'src/cpu-worker.js'],
  );

  const memory = body.demos.find((demo) => demo.id === 'memory-leak');
  assert.deepEqual(
    memory.runtimeFiles.map((file) => file.path),
    ['src/memory-lab.js', 'src/memory-leak-child.js'],
  );
});

test('GET /api/health возвращает метрики Event Loop', async () => {
  const response = getHealth();
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(typeof body.loop.p95DelayMs, 'number');
});

test('Route Handler стримит события сценария в NDJSON', async () => {
  const response = await runDemo(post('/api/demos/event-loop-order/run'), {
    params: Promise.resolve({ id: 'event-loop-order' }),
  });
  const events = (await response.text())
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));

  assert.equal(response.status, 200);
  assert.equal(events[0].type, 'start');
  assert.equal(events.at(-1).type, 'done');
  assert.ok(events.some((event) => event.lane === 'nextTick'));
  assert.ok(events.some((event) => event.lane === 'microtasks'));
  assert.ok(events.some((event) => event.lane === 'poll'));
});

test('седьмой сценарий показывает Promise и явно сообщает о Redis', async () => {
  const previousRedisUrl = process.env.REDIS_URL;
  delete process.env.REDIS_URL;

  try {
    const response = await runDemo(
      post('/api/demos/promises-immediate-bullmq/run'),
      {
        params: Promise.resolve({ id: 'promises-immediate-bullmq' }),
      },
    );
    const events = (await response.text())
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));

    assert.equal(response.status, 200);
    assert.equal(events.at(-1).type, 'done');
    assert.ok(events.some((event) => event.lane === 'promise-all'));
    assert.ok(events.some((event) => event.lane === 'check'));
    assert.ok(
      events.some(
        (event) =>
          event.lane === 'bullmq' && event.message.includes('REDIS_URL'),
      ),
    );
  } finally {
    if (previousRedisUrl === undefined) delete process.env.REDIS_URL;
    else process.env.REDIS_URL = previousRedisUrl;
  }
});

test('утечка стартует вручную и поддерживает полный lifecycle', async () => {
  const before = await snapshot();
  assert.equal(before.status, 'idle');
  assert.equal(before.pid, null);

  const startedResponse = await startMemory(
    post('/api/memory/start', {
      kind: 'external',
      allocationMb: 1,
      intervalMs: 250,
      limitMb: 64,
    }),
  );
  const started = await startedResponse.json();
  assert.equal(startedResponse.status, 202);
  assert.equal(started.status, 'starting');
  assert.equal(typeof started.pid, 'number');

  const leaking = await waitFor(async () => {
    const state = await snapshot();
    return state.latest?.retainedBytes > 0 ? state : null;
  });
  assert.equal(leaking.config.limitMb, 64);
  assert.ok(leaking.latest.memory.external > 0);

  await memoryAction(post('/api/memory/action/pause'), {
    params: Promise.resolve({ action: 'pause' }),
  });
  await waitFor(async () => (await snapshot()).status === 'paused');

  await memoryAction(post('/api/memory/action/release'), {
    params: Promise.resolve({ action: 'release' }),
  });
  const released = await waitFor(async () => {
    const state = await snapshot();
    return state.latest?.retainedBytes === 0 ? state : null;
  });
  assert.equal(released.latest.blocks, 0);

  await memoryAction(post('/api/memory/action/gc'), {
    params: Promise.resolve({ action: 'gc' }),
  });
  await memoryAction(post('/api/memory/action/stop'), {
    params: Promise.resolve({ action: 'stop' }),
  });
  const stopped = await waitFor(async () => {
    const state = await snapshot();
    return state.status === 'stopped' ? state : null;
  });
  assert.equal(stopped.pid, null);
});
