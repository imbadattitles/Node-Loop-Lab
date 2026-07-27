import { monitorEventLoopDelay, performance } from 'node:perf_hooks';
import { labProfile } from './lab-profile.js';
import {
  createDemoConcurrencyGuard,
  createRateLimiter,
} from './request-guard.js';

const stateKey = Symbol.for('node-loop-lab.runtime');

function createRuntimeState() {
  const loopDelay = monitorEventLoopDelay({ resolution: 20 });
  loopDelay.enable();
  const enabled = labProfile.api.rateLimitsEnabled;

  return {
    loopDelay,
    demoConcurrency: createDemoConcurrencyGuard(labProfile),
    demoRateLimit: createRateLimiter({
      enabled,
      name: 'учебным сценариям',
      ...labProfile.api.demoRuns,
    }),
    memoryStartRateLimit: createRateLimiter({
      enabled,
      name: 'запуску memory-lab',
      ...labProfile.api.memoryStarts,
    }),
    memoryActionRateLimit: createRateLimiter({
      enabled,
      name: 'управлению memory-lab',
      ...labProfile.api.memoryActions,
    }),
  };
}

export const runtimeState =
  globalThis[stateKey] ?? (globalThis[stateKey] = createRuntimeState());

export function healthSnapshot() {
  const utilization = performance.eventLoopUtilization();
  const toMilliseconds = (value) =>
    Number.isFinite(value) ? Number((value / 1e6).toFixed(1)) : 0;

  return {
    ok: true,
    mode: labProfile.mode,
    pid: process.pid,
    uptimeSeconds: Math.round(process.uptime()),
    loop: {
      utilization: Number((utilization.utilization * 100).toFixed(1)),
      meanDelayMs: toMilliseconds(runtimeState.loopDelay.mean),
      maxDelayMs: toMilliseconds(runtimeState.loopDelay.max),
      p95DelayMs: toMilliseconds(runtimeState.loopDelay.percentile(95)),
    },
  };
}

export function limitedJson(result) {
  return Response.json(
    { error: result.error },
    { status: 429, headers: result.headers },
  );
}
