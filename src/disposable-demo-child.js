import { demos } from './demos.js';
import { isCpuBlockingDemo } from './demo-execution-policy.js';

let running = false;

function send(message) {
  if (process.connected) process.send(message);
}

async function runDemo(id) {
  if (running) throw new Error('Disposable demo child already has an active run');
  if (!isCpuBlockingDemo(id)) {
    throw new Error(`Demo is not allowed in the disposable executor: ${id}`);
  }

  const demo = demos.find((candidate) => candidate.id === id);
  if (!demo?.run || demo.interactive) {
    throw new Error(`Unknown or non-runnable demo: ${id}`);
  }

  running = true;
  send({ type: 'ready', demoId: id, pid: process.pid });

  await demo.run((lane, type, message, details = null) => {
    send({
      type: 'event',
      event: { lane, type, message, details },
    });
  });

  send({ type: 'done', demoId: id });
}

process.once('message', (message) => {
  if (message?.type !== 'run') {
    send({ type: 'error', error: 'Expected a run command' });
    process.disconnect();
    return;
  }

  runDemo(message.demoId)
    .catch((error) => {
      send({
        type: 'error',
        error: error instanceof Error ? error.message : String(error),
      });
      process.exitCode = 1;
    })
    .finally(() => {
      if (process.connected) process.disconnect();
    });
});

process.once('disconnect', () => {
  if (!running) process.exitCode ||= 1;
});
