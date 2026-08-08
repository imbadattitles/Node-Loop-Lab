export const cpuBlockingDemoIds = Object.freeze([
  'callback-queue',
  'blocking-vs-worker',
  'runtime-models',
  'production-observability',
]);

const cpuBlockingDemoIdSet = new Set(cpuBlockingDemoIds);

export function isCpuBlockingDemo(id) {
  return cpuBlockingDemoIdSet.has(id);
}
