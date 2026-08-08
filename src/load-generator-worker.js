import { performance } from 'node:perf_hooks';
import { parentPort, workerData } from 'node:worker_threads';

function percentile(values, rank) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((rank / 100) * sorted.length) - 1),
  );
  return sorted[index];
}

function latencySummary(values) {
  return {
    p50Ms: Number(percentile(values, 50).toFixed(1)),
    p95Ms: Number(percentile(values, 95).toFixed(1)),
    p99Ms: Number(percentile(values, 99).toFixed(1)),
  };
}

async function generateLoad() {
  const { concurrency, cpuEvery, durationMs, origin } = workerData;
  const startedAt = performance.now();
  const deadline = startedAt + durationMs;
  const allLatencies = [];
  const fastLatencies = [];
  const cpuLatencies = [];
  let completed = 0;
  let errors = 0;

  async function virtualClient(clientIndex) {
    let sequence = clientIndex;

    while (performance.now() < deadline) {
      const kind = sequence % cpuEvery === 0 ? 'cpu' : 'fast';
      sequence += 1;
      const requestStartedAt = performance.now();

      try {
        const response = await fetch(`${origin}/${kind}`, {
          headers: { connection: 'keep-alive' },
        });
        await response.arrayBuffer();
        if (!response.ok) errors += 1;
      } catch {
        errors += 1;
      }

      const latencyMs = performance.now() - requestStartedAt;
      allLatencies.push(latencyMs);
      if (kind === 'fast') fastLatencies.push(latencyMs);
      else cpuLatencies.push(latencyMs);
      completed += 1;
    }
  }

  await Promise.all(
    Array.from({ length: concurrency }, (_, index) => virtualClient(index)),
  );

  const elapsedMs = performance.now() - startedAt;
  return {
    completed,
    elapsedMs: Number(elapsedMs.toFixed(1)),
    errors,
    errorRate: completed === 0 ? 0 : Number((errors / completed).toFixed(4)),
    rps: Number((completed / (elapsedMs / 1000)).toFixed(1)),
    latency: latencySummary(allLatencies),
    fastLatency: latencySummary(fastLatencies),
    cpuLatency: latencySummary(cpuLatencies),
  };
}

generateLoad().then(
  (result) => parentPort.postMessage({ kind: 'result', result }),
  (error) =>
    parentPort.postMessage({
      kind: 'error',
      error: error instanceof Error ? error.message : String(error),
    }),
);
