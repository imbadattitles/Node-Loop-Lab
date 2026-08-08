import { performance } from 'node:perf_hooks';
import { parentPort } from 'node:worker_threads';

function burnCpu(durationMs) {
  const startedAt = performance.now();
  let checksum = 0;

  while (performance.now() - startedAt < durationMs) {
    checksum += Math.sqrt((checksum % 10_000) + 1);
  }

  return {
    durationMs: performance.now() - startedAt,
    checksum: Math.round(checksum),
  };
}

parentPort.on('message', ({ jobId, durationMs }) => {
  parentPort.postMessage({ jobId, ...burnCpu(durationMs) });
});
