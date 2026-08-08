import test from 'node:test';
import assert from 'node:assert/strict';
import { runLoadComparison } from '../src/load-lab.js';

test('HTTP load lab reports throughput, latency tails, errors, loop delay, and queue depth', async () => {
  const events = [];
  const result = await runLoadComparison((lane, type, message, details) => {
    events.push({ lane, type, message, details });
  });

  for (const profile of [result.main, result.worker]) {
    assert.ok(profile.completed >= 10);
    assert.ok(profile.rps > 0);
    assert.equal(profile.errors, 0);
    assert.equal(profile.errorRate, 0);
    assert.ok(profile.latency.p50Ms >= 0);
    assert.ok(profile.latency.p95Ms >= profile.latency.p50Ms);
    assert.ok(profile.latency.p99Ms >= profile.latency.p95Ms);
    assert.ok(profile.fastLatency.p95Ms >= 0);
    assert.ok(profile.eventLoopDelayP95Ms >= 0);
  }

  assert.equal(result.main.mode, 'main');
  assert.equal(result.main.maxQueueDepth, 0);
  assert.equal(result.worker.mode, 'worker');
  assert.ok(result.worker.maxQueueDepth > 0);

  const mainEvent = events.find(
    (event) => event.lane === 'load-main' && event.type === 'result',
  );
  const workerEvent = events.find(
    (event) => event.lane === 'load-worker' && event.type === 'result',
  );
  assert.equal(mainEvent.details.mode, 'main');
  assert.equal(workerEvent.details.mode, 'worker');
  assert.match(mainEvent.message, /RPS .* p50=.* p95=.* p99=/);
  assert.ok(
    events.some(
      (event) =>
        event.lane === 'load-test' &&
        event.message.includes('fast p95'),
    ),
  );
});
