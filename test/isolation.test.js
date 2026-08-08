import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DemoIsolationError,
  executeDemoChild,
  runDemoWithIsolation,
} from '../src/disposable-demo-executor.js';
import {
  cpuBlockingDemoIds,
  isCpuBlockingDemo,
} from '../src/demo-execution-policy.js';
import { getLabProfile } from '../src/lab-profile.js';

test('policy enumerates every scenario that intentionally blocks JavaScript', () => {
  assert.deepEqual(cpuBlockingDemoIds, [
    'callback-queue',
    'blocking-vs-worker',
    'runtime-models',
    'production-observability',
  ]);
  assert.ok(cpuBlockingDemoIds.every(isCpuBlockingDemo));
  assert.equal(isCpuBlockingDemo('event-loop-order'), false);
});

test('public profile isolates CPU-blocking demos while private profile preserves the lesson', () => {
  const publicProfile = getLabProfile('public');
  const privateProfile = getLabProfile('private');

  assert.equal(publicProfile.api.demoIsolation.enabled, true);
  assert.equal(privateProfile.api.demoIsolation.enabled, false);
  assert.ok(publicProfile.api.demoIsolation.timeoutMs <= 8_000);
  assert.ok(publicProfile.api.demoIsolation.v8HeapLimitMb <= 192);
  assert.equal(
    publicProfile.api.demoIsolation.maxConcurrent +
      publicProfile.api.demoIsolation.maxQueue,
    publicProfile.api.maxConcurrentDemos,
  );
});

test('router policy delegates a blocking public demo to the disposable executor', async () => {
  let directRuns = 0;
  let isolatedId = null;
  const demo = {
    id: 'callback-queue',
    async run() {
      directRuns += 1;
    },
  };
  const executor = {
    async run(id) {
      isolatedId = id;
    },
  };

  await runDemoWithIsolation(demo, () => {}, {
    profile: getLabProfile('public'),
    executor,
  });

  assert.equal(isolatedId, demo.id);
  assert.equal(directRuns, 0);
});

test('private mode still runs the main-thread blocking lesson in its host process', async () => {
  let directRuns = 0;
  const demo = {
    id: 'callback-queue',
    async run() {
      directRuns += 1;
    },
  };
  const executor = {
    async run() {
      throw new Error('private mode must not use the child executor');
    },
  };

  await runDemoWithIsolation(demo, () => {}, {
    profile: getLabProfile('private'),
    executor,
  });

  assert.equal(directRuns, 1);
});

test('CPU work in the disposable child does not stop the parent Event Loop', async () => {
  let ticks = 0;
  let ticksBeforeBlock = null;
  let ticksAfterBlock = null;
  const interval = setInterval(() => {
    ticks += 1;
  }, 20);

  try {
    await executeDemoChild('callback-queue', (lane, type, message) => {
      if (lane === 'call-stack' && type === 'warning') {
        ticksBeforeBlock = ticks;
      }
      if (
        lane === 'call-stack' &&
        type === 'sync' &&
        message.includes('освободил стек')
      ) {
        ticksAfterBlock = ticks;
      }
    });
  } finally {
    clearInterval(interval);
  }

  assert.equal(typeof ticksBeforeBlock, 'number');
  assert.equal(typeof ticksAfterBlock, 'number');
  assert.ok(
    ticksAfterBlock - ticksBeforeBlock >= 3,
    `parent timer advanced only ${ticksAfterBlock - ticksBeforeBlock} ticks`,
  );
});

test('disposable executor rejects scenarios outside its explicit allowlist', async () => {
  await assert.rejects(
    executeDemoChild('event-loop-order', () => {}),
    (error) =>
      error instanceof DemoIsolationError &&
      error.code === 'DEMO_CHILD_NOT_ALLOWED' &&
      error.statusCode === 400,
  );
});
