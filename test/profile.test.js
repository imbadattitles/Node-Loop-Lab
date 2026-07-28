import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clientLabProfile,
  getLabProfile,
} from '../src/lab-profile.js';
import { MemoryLab, safeConfig } from '../src/memory-lab.js';
import {
  createDemoConcurrencyGuard,
  createRateLimit,
} from '../src/request-guard.js';

async function waitFor(check, timeoutMs = 3000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = check();
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error('Превышено время ожидания состояния профиля');
}

test('private и public используют разные безопасные диапазоны', () => {
  const privateProfile = getLabProfile('private');
  const publicProfile = getLabProfile('public');

  assert.equal(privateProfile.memory.retainedLimitMb, 512);
  assert.equal(privateProfile.memory.deadlineAction, 'pause');
  assert.equal(publicProfile.memory.retainedLimitMb, 256);
  assert.equal(publicProfile.memory.hardRssLimitMb, 512);
  assert.equal(publicProfile.memory.deadlineAction, 'stop');
  assert.equal(publicProfile.memory.snapshotMaxRetainedMb, 64);
  assert.ok(publicProfile.memory.kinds.includes('closure'));
  assert.ok(publicProfile.memory.kinds.includes('cache'));
  assert.equal(publicProfile.api.rateLimitsEnabled, true);

  assert.deepEqual(
    safeConfig(
      {
        kind: 'unknown',
        allocationMb: 8,
        intervalMs: 250,
        limitMb: 512,
      },
      publicProfile,
    ),
    publicProfile.memory.defaultConfig,
  );
  assert.equal(
    safeConfig({ limitMb: 512 }, privateProfile).limitMb,
    512,
  );
});

test('клиент получает настройки интерфейса, но не серверные rate limits', () => {
  const profile = clientLabProfile(getLabProfile('public'));

  assert.equal(profile.mode, 'public');
  assert.deepEqual(profile.memory.options.limitMb, [64, 128, 256]);
  assert.equal(profile.memory.snapshotMaxRetainedMb, 64);
  assert.equal('api' in profile, false);
});

test('public memory-lab принудительно завершает дочерний процесс', async () => {
  const profile = getLabProfile('public');
  profile.memory.maxDurationMs = 180;
  const lab = new MemoryLab(profile);

  try {
    lab.start(profile.memory.defaultConfig);
    const stopped = await waitFor(() => {
      const snapshot = lab.snapshot();
      return snapshot.status === 'stopped' && snapshot.pid === null
        ? snapshot
        : null;
    });
    assert.equal(stopped.pid, null);
  } finally {
    lab.stopForShutdown();
  }
});

test('public API ограничивает частоту и параллельные запуски', () => {
  const request = { ip: '203.0.113.7', socket: {} };
  const limiter = createRateLimit({
    enabled: true,
    name: 'тесту',
    windowMs: 60_000,
    max: 2,
  });

  function invoke() {
    const result = { next: false, status: null };
    const response = {
      set() {
        return this;
      },
      status(code) {
        result.status = code;
        return this;
      },
      json() {
        return this;
      },
    };
    limiter(request, response, () => {
      result.next = true;
    });
    return result;
  }

  assert.equal(invoke().next, true);
  assert.equal(invoke().next, true);
  assert.equal(invoke().status, 429);

  const profile = getLabProfile('public');
  profile.api.maxConcurrentDemos = 1;
  profile.api.maxConcurrentDemosPerIp = 1;
  const concurrency = createDemoConcurrencyGuard(profile);
  const first = concurrency.enter(request);
  const second = concurrency.enter(request);
  assert.equal(first.allowed, true);
  assert.equal(second.allowed, false);
  first.release();
  assert.equal(concurrency.enter(request).allowed, true);
});

test('ограничители принимают стандартный Web Request от Next.js', () => {
  const profile = getLabProfile('public');
  const guard = createDemoConcurrencyGuard(profile);
  const request = new Request('http://localhost/api/demo', { method: 'POST' });
  const permit = guard.enter(request);
  assert.equal(permit.allowed, true);
  permit.release();
});
