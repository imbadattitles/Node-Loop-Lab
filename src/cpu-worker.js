import { parentPort, workerData } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';

// Этот цикл намеренно нагружает CPU. Важно: он выполняется НЕ в главном
// JavaScript-потоке, поэтому Event Loop сервера продолжает принимать события.
const startedAt = performance.now();
let iterations = 0;

while (performance.now() - startedAt < workerData.durationMs) {
  // Небольшая арифметическая работа не даёт движку просто выбросить цикл.
  iterations += Math.sqrt((iterations % 10_000) + 1);
}

parentPort.postMessage({
  durationMs: Math.round(performance.now() - startedAt),
  iterations: Math.round(iterations),
});
