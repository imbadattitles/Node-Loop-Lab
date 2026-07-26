import { app } from './app.js';
import { memoryLab } from './memory-lab.js';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const server = app.listen(port, () => {
  console.log('');
  console.log('  NODE LOOP LAB');
  console.log(`  API http://localhost:${port}`);
  if (port === 3001) {
    console.log('  WEB http://localhost:3000 (Vite)');
  }
  console.log(`  Node ${process.version} · PID ${process.pid}`);
  console.log('');
});

function shutdown(signal) {
  console.log(`\n${signal}: аккуратно останавливаем сервер...`);
  memoryLab.stopForShutdown();
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
