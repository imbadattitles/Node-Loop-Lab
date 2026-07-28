import test from 'node:test';
import assert from 'node:assert/strict';
import { GET as getDemos } from '../app/api/demos/route.js';
import { POST as runDemo } from '../app/api/demos/[id]/run/route.js';
import { GET as getHealth } from '../app/api/health/route.js';
import { GET as getMetrics } from '../app/api/metrics/route.js';
import { GET as getMemory } from '../app/api/memory/route.js';
import { GET as downloadSnapshot } from '../app/api/memory/snapshot/route.js';
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
  assert.equal(body.demos.length, 16);
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
  assert.ok(eventLoop.runtimeFiles[0].code.split('\n').length > 80);
  assert.doesNotMatch(
    eventLoop.runtimeFiles[0].code,
    /async function [a-z]\(a\)\{/,
  );

  const worker = body.demos.find(
    (demo) => demo.id === 'blocking-vs-worker',
  );
  assert.deepEqual(
    worker.runtimeFiles.map((file) => file.path),
    ['src/demos.js', 'src/cpu-worker.js'],
  );
  assert.match(
    worker.runtimeFiles[0].code,
    /async function blockingComparison\(emit\)/,
  );

  const memory = body.demos.find((demo) => demo.id === 'memory-leak');
  assert.deepEqual(
    memory.runtimeFiles.map((file) => file.path),
    ['src/memory-lab.js', 'src/memory-leak-child.js'],
  );

  const promises = body.demos.find(
    (demo) => demo.id === 'promises-immediate-bullmq',
  );
  assert.match(
    promises.runtimeFiles[0].code,
    /async function promisesImmediateBullMq\(emit\)/,
  );
  assert.ok(promises.runtimeFiles[0].code.split('\n').length > 180);

  const runtimeModels = body.demos.find(
    (demo) => demo.id === 'runtime-models',
  );
  assert.match(
    runtimeModels.runtimeFiles[0].code,
    /async function runtimeModelsComparison\(emit\)/,
  );

  const diagnostics = body.demos.find(
    (demo) => demo.id === 'memory-diagnostics',
  );
  assert.deepEqual(
    diagnostics.runtimeFiles.map((file) => file.path),
    ['src/memory-lab.js', 'src/memory-leak-child.js'],
  );
  assert.match(
    diagnostics.runtimeFiles[1].code,
    /function createRetainingClosure\(bytes\)/,
  );

  const observability = body.demos.find(
    (demo) => demo.id === 'production-observability',
  );
  assert.deepEqual(
    observability.runtimeFiles.map((file) => file.path),
    ['src/demos.js', 'src/runtime-state.js'],
  );

  const nestDi = body.demos.find(
    (demo) => demo.id === 'nest-dependency-injection',
  );
  const nestLifecycle = body.demos.find(
    (demo) => demo.id === 'nest-request-lifecycle',
  );
  assert.equal(nestDi.category, 'nestjs');
  assert.equal(nestLifecycle.category, 'nestjs');
  assert.deepEqual(
    nestDi.runtimeFiles.map((file) => file.path),
    ['src/nest-lab.js'],
  );
  assert.match(
    nestDi.runtimeFiles[0].code,
    /async function nestDependencyInjection\(emit\)/,
  );
  assert.match(
    nestLifecycle.runtimeFiles[0].code,
    /async function nestRequestLifecycle\(emit\)/,
  );

  const databaseDemos = body.demos.filter(
    (demo) => demo.category === 'databases',
  );
  assert.equal(databaseDemos.length, 4);
  assert.ok(
    databaseDemos.every(
      (demo) =>
        demo.runtimeFiles.length === 1 &&
        demo.runtimeFiles[0].path === 'src/database-lab.js' &&
        demo.runtimeFiles[0].role === 'database',
    ),
  );
  assert.match(
    databaseDemos[0].runtimeFiles[0].code,
    /async function databaseConstraintsAndAcid\(emit\)/,
  );
  assert.match(
    databaseDemos[0].runtimeFiles[0].code,
    /async function databaseIndexesAndExplain\(emit\)/,
  );
  assert.match(
    databaseDemos[0].runtimeFiles[0].code,
    /async function databaseTransactionsAndLocks\(emit\)/,
  );
  assert.match(
    databaseDemos[0].runtimeFiles[0].code,
    /async function databaseJoinsAndMaterializedViews\(emit\)/,
  );
});

test('GET /api/health возвращает метрики Event Loop', async () => {
  const response = getHealth();
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(typeof body.loop.p95DelayMs, 'number');
});

test('GET /api/metrics публикует Prometheus text exposition', async () => {
  const response = getMetrics();
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get('content-type'),
    /^text\/plain; version=0\.0\.4/,
  );
  assert.match(body, /# TYPE node_loop_lab_process_resident_memory_bytes gauge/);
  assert.match(body, /node_loop_lab_event_loop_delay_p95_seconds /);
  assert.match(body, /node_loop_lab_memory_child_retained_bytes /);
  assert.ok(body.endsWith('\n'));
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

test('runtime comparison и observability сценарии исполняют реальные сигналы', async () => {
  const comparisonResponse = await runDemo(
    post('/api/demos/runtime-models/run'),
    {
      params: Promise.resolve({ id: 'runtime-models' }),
    },
  );
  const comparisonEvents = (await comparisonResponse.text())
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  assert.equal(comparisonEvents.at(-1).type, 'done');
  assert.ok(
    comparisonEvents.some((event) => event.lane === 'architecture'),
  );

  const monitoringResponse = await runDemo(
    post('/api/demos/production-observability/run'),
    {
      params: Promise.resolve({ id: 'production-observability' }),
    },
  );
  const monitoringEvents = (await monitoringResponse.text())
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  assert.equal(monitoringEvents.at(-1).type, 'done');
  assert.ok(
    monitoringEvents.some(
      (event) =>
        event.lane === 'metrics' && event.message.includes('p95 delay'),
    ),
  );
  assert.ok(monitoringEvents.some((event) => event.lane === 'grafana'));
});

test('NestJS сценарии используют настоящий IoC container и HTTP lifecycle', async () => {
  const diResponse = await runDemo(
    post('/api/demos/nest-dependency-injection/run'),
    {
      params: Promise.resolve({ id: 'nest-dependency-injection' }),
    },
  );
  const diEvents = (await diResponse.text())
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  assert.equal(diEvents.at(-1).type, 'done');
  assert.ok(
    diEvents.some(
      (event) =>
        event.lane === 'custom-provider' &&
        event.message.includes('true'),
    ),
  );
  assert.ok(
    diEvents.some(
      (event) =>
        event.lane === 'scope' &&
        event.message.includes('ContextId'),
    ),
  );

  const lifecycleResponse = await runDemo(
    post('/api/demos/nest-request-lifecycle/run'),
    {
      params: Promise.resolve({ id: 'nest-request-lifecycle' }),
    },
  );
  const lifecycleEvents = (await lifecycleResponse.text())
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  assert.equal(lifecycleEvents.at(-1).type, 'done');
  const success = lifecycleEvents.find(
    (event) => event.lane === 'success-path',
  );
  const invalid = lifecycleEvents.find(
    (event) => event.lane === 'error-path',
  );
  const denied = lifecycleEvents.find(
    (event) => event.lane === 'guard-path',
  );
  assert.match(
    success.message,
    /middleware → guard → interceptor:before → pipe → controller → service → interceptor:after/,
  );
  assert.match(
    invalid.message,
    /pipe → exception-filter:400/,
  );
  assert.doesNotMatch(invalid.message, /controller/);
  assert.match(
    denied.message,
    /middleware → guard:deny → exception-filter:403/,
  );
  assert.doesNotMatch(denied.message, /interceptor/);
});

test('PostgreSQL сценарии безопасно пропускаются без DATABASE_URL', async () => {
  const previous = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    for (const id of [
      'database-sql-foundations',
      'database-indexes-explain',
      'database-transactions-locks',
      'database-joins-materialized-views',
    ]) {
      const response = await runDemo(post(`/api/demos/${id}/run`), {
        params: Promise.resolve({ id }),
      });
      const events = (await response.text())
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line));
      assert.equal(events.at(-1).type, 'done');
      assert.ok(
        events.some(
          (event) =>
            event.lane === 'postgres' &&
            event.type === 'skip' &&
            event.message.includes('DATABASE_URL'),
        ),
      );
    }
  } finally {
    if (previous === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previous;
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

test('closure leak создаёт скачиваемый snapshot без раскрытия server path', async () => {
  const inheritedSecret = 'must-not-reach-memory-child-7f42';
  process.env.NODE_LOOP_LAB_TEST_SECRET = inheritedSecret;
  const startedResponse = await startMemory(
    post('/api/memory/start', {
      kind: 'closure',
      allocationMb: 1,
      intervalMs: 250,
      limitMb: 64,
    }),
  );
  assert.equal(startedResponse.status, 202);

  const retaining = await waitFor(async () => {
    const state = await snapshot();
    return state.latest?.retainedBytes > 0 ? state : null;
  });
  assert.equal(retaining.config.kind, 'closure');

  await memoryAction(post('/api/memory/action/pause'), {
    params: Promise.resolve({ action: 'pause' }),
  });
  await waitFor(async () => (await snapshot()).status === 'paused');

  const snapshotResponse = await memoryAction(
    post('/api/memory/action/snapshot'),
    {
      params: Promise.resolve({ action: 'snapshot' }),
    },
  );
  assert.equal(snapshotResponse.status, 200);

  const ready = await waitFor(async () => {
    const state = await snapshot();
    return state.snapshot?.status === 'ready' ? state : null;
  }, 10_000);
  assert.equal('path' in ready.snapshot, false);
  assert.match(ready.snapshot.fileName, /\.heapsnapshot$/);
  assert.ok(ready.snapshot.size > 1000);

  const download = downloadSnapshot();
  assert.equal(download.status, 200);
  assert.match(
    download.headers.get('content-disposition'),
    /\.heapsnapshot"/,
  );
  const snapshotBytes = await download.arrayBuffer();
  const prefix = new TextDecoder().decode(
    new Uint8Array(snapshotBytes.slice(0, 32)),
  );
  assert.match(prefix, /^\{"snapshot"/);
  assert.equal(
    new TextDecoder().decode(snapshotBytes).includes(inheritedSecret),
    false,
  );
  delete process.env.NODE_LOOP_LAB_TEST_SECRET;

  await memoryAction(post('/api/memory/action/stop'), {
    params: Promise.resolve({ action: 'stop' }),
  });
  await waitFor(async () => (await snapshot()).pid === null);
});
