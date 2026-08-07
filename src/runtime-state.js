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
    metrics: {
      demoRunsTotal: 0,
      demoRunErrorsTotal: 0,
      demoRunDurationSecondsSum: 0,
      demoRunsActive: 0,
    },
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

export function beginDemoMeasurement() {
  const metrics = runtimeState.metrics;
  metrics.demoRunsTotal += 1;
  metrics.demoRunsActive += 1;
  const startedAt = performance.now();
  let finished = false;

  return {
    finish({ error = false } = {}) {
      if (finished) return;
      finished = true;
      metrics.demoRunsActive = Math.max(0, metrics.demoRunsActive - 1);
      metrics.demoRunDurationSecondsSum +=
        (performance.now() - startedAt) / 1000;
      if (error) metrics.demoRunErrorsTotal += 1;
    },
  };
}

function finite(value) {
  return Number.isFinite(value) ? value : 0;
}

function metric(lines, name, help, type, value, labels = '') {
  lines.push(`# HELP ${name} ${help}`);
  lines.push(`# TYPE ${name} ${type}`);
  lines.push(`${name}${labels} ${finite(value)}`);
}

export function prometheusSnapshot(memoryState) {
  const lines = [];
  const processMemory = process.memoryUsage();
  const cpu = process.cpuUsage();
  const utilization = performance.eventLoopUtilization();
  const delay = runtimeState.loopDelay;
  const child = memoryState?.latest;
  const childActive = memoryState?.pid ? 1 : 0;
  const snapshotReady = memoryState?.snapshot?.status === 'ready' ? 1 : 0;

  metric(
    lines,
    'node_loop_lab_info',
    'Static information about this Runtime Lab process.',
    'gauge',
    1,
    `{mode="${labProfile.mode}"}`,
  );
  metric(
    lines,
    'node_loop_lab_process_resident_memory_bytes',
    'Resident set size of the main Node.js process.',
    'gauge',
    processMemory.rss,
  );
  metric(
    lines,
    'node_loop_lab_process_heap_used_bytes',
    'V8 heap currently used by the main Node.js process.',
    'gauge',
    processMemory.heapUsed,
  );
  metric(
    lines,
    'node_loop_lab_process_external_memory_bytes',
    'External memory tracked by the main Node.js process.',
    'gauge',
    processMemory.external,
  );
  metric(
    lines,
    'node_loop_lab_process_cpu_seconds_total',
    'CPU time consumed by the main Node.js process.',
    'counter',
    (cpu.user + cpu.system) / 1e6,
  );
  metric(
    lines,
    'node_loop_lab_event_loop_utilization_ratio',
    'Fraction of time the main Event Loop was active.',
    'gauge',
    utilization.utilization,
  );
  metric(
    lines,
    'node_loop_lab_event_loop_delay_p95_seconds',
    '95th percentile main Event Loop delay.',
    'gauge',
    finite(delay.percentile(95)) / 1e9,
  );
  metric(
    lines,
    'node_loop_lab_event_loop_delay_max_seconds',
    'Maximum observed main Event Loop delay.',
    'gauge',
    finite(delay.max) / 1e9,
  );
  metric(
    lines,
    'node_loop_lab_demo_runs_total',
    'Number of runtime demo executions started.',
    'counter',
    runtimeState.metrics.demoRunsTotal,
  );
  metric(
    lines,
    'node_loop_lab_demo_run_errors_total',
    'Number of runtime demo executions that failed or were cancelled.',
    'counter',
    runtimeState.metrics.demoRunErrorsTotal,
  );
  metric(
    lines,
    'node_loop_lab_demo_run_duration_seconds_sum',
    'Cumulative wall-clock duration of completed runtime demos.',
    'counter',
    runtimeState.metrics.demoRunDurationSecondsSum,
  );
  metric(
    lines,
    'node_loop_lab_demo_runs_active',
    'Runtime demos currently executing.',
    'gauge',
    runtimeState.metrics.demoRunsActive,
  );
  metric(
    lines,
    'node_loop_lab_memory_child_up',
    'Whether the isolated memory-lab child process exists.',
    'gauge',
    childActive,
  );
  metric(
    lines,
    'node_loop_lab_memory_child_retained_bytes',
    'Controlled estimate of bytes retained by the memory-lab scenario.',
    'gauge',
    child?.retainedBytes ?? 0,
  );
  metric(
    lines,
    'node_loop_lab_memory_child_resident_memory_bytes',
    'Resident set size of the isolated memory-lab child process.',
    'gauge',
    child?.memory?.rss ?? 0,
  );
  metric(
    lines,
    'node_loop_lab_memory_child_heap_used_bytes',
    'V8 heap used by the isolated memory-lab child process.',
    'gauge',
    child?.memory?.heapUsed ?? 0,
  );
  metric(
    lines,
    'node_loop_lab_memory_child_external_memory_bytes',
    'External memory tracked by the isolated memory-lab child process.',
    'gauge',
    child?.memory?.external ?? 0,
  );
  metric(
    lines,
    'node_loop_lab_memory_heap_snapshot_ready',
    'Whether a downloadable memory-lab heap snapshot is ready.',
    'gauge',
    snapshotReady,
  );

  return `${lines.join('\n')}\n`;
}

export function limitedJson(result) {
  return Response.json(
    { error: result.error },
    { status: 429, headers: result.headers },
  );
}
