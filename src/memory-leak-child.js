import { stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { writeHeapSnapshot } from 'node:v8';

// Этот файл запускается только как отдельный дочерний Node-процесс.
// Он намеренно удерживает ссылки на выделенные блоки в retainedBlocks.
// Главный Express-сервер при этом остаётся жив и может остановить эксперимент.

const MB = 1024 * 1024;
const DEFAULT_SAFETY = {
  retainedLimitMb: 512,
  hardRssLimitMb: 768,
  maxDurationMs: 2 * 60 * 1000,
  deadlineAction: 'pause',
};

let retainedBlocks = [];
let globalCache = new Map();
let retainedBytes = 0;
let allocationNumber = 0;
let allocationTimer = null;
let deadlineTimer = null;
let startedAt = null;
let status = 'starting';
let config = null;
let safety = DEFAULT_SAFETY;

function send(type, payload = {}) {
  if (process.connected) {
    process.send({ type, ...payload });
  }
}

function memorySnapshot(reason = null) {
  const memory = process.memoryUsage();

  return {
    status,
    reason,
    elapsedMs: startedAt ? Date.now() - startedAt : 0,
    retainedBytes,
    blocks: retainedBlocks.length,
    memory: {
      rss: memory.rss,
      heapTotal: memory.heapTotal,
      heapUsed: memory.heapUsed,
      external: memory.external,
      arrayBuffers: memory.arrayBuffers,
    },
  };
}

function emitSample(reason = null) {
  const snapshot = memorySnapshot(reason);
  send('sample', snapshot);
  return snapshot;
}

function createHeapBlock(bytes) {
  // Packed-массив чисел хранится в V8 heap. Оценка 8 байт на элемент нужна
  // только для контролируемого учебного лимита; реальные накладные расходы V8
  // видны отдельно в process.memoryUsage().heapUsed.
  const elementCount = Math.max(1, Math.floor(bytes / 8));
  const values = new Array(elementCount);
  const offset = allocationNumber * elementCount;

  for (let index = 0; index < elementCount; index += 1) {
    values[index] = (offset + index) % 1_000_000_007;
  }

  return values;
}

function createExternalBlock(bytes) {
  // Buffer хранится преимущественно вне V8 heap и растит метрику external.
  // fill заставляет ОС действительно закоммитить страницы памяти.
  return Buffer.alloc(bytes, allocationNumber % 251);
}

function createRetainingClosure(bytes) {
  const payload = createHeapBlock(bytes);

  // Даже когда createRetainingClosure завершилась, функция ниже сохраняет
  // скрытую ссылку на payload через lexical environment.
  return function readCapturedValue() {
    return payload[0];
  };
}

function allocationReason(kind) {
  if (kind === 'closure') {
    return 'Замыкание сохранено в долгоживущем массиве и удерживает payload';
  }
  if (kind === 'cache') {
    return 'Объект сохранён в глобальном Map без TTL и ограничения размера';
  }
  return 'Новый блок сохранён в глобальном массиве';
}

function allocateBlock() {
  if (status !== 'running') return;

  const requestedBytes = config.allocationMb * MB;
  const remainingBytes = config.limitMb * MB - retainedBytes;
  const bytes = Math.min(requestedBytes, remainingBytes);

  if (bytes <= 0) {
    pauseAtLimit('Достигнут выбранный лимит удерживаемой памяти');
    return;
  }

  allocationNumber += 1;
  let value;

  if (config.kind === 'heap') {
    value = createHeapBlock(bytes);
  } else if (config.kind === 'closure') {
    value = createRetainingClosure(bytes);
  } else if (config.kind === 'cache') {
    const key = `request:${allocationNumber}`;
    globalCache.set(key, {
      createdAt: Date.now(),
      payload: createHeapBlock(bytes),
    });
    value = key;
  } else if (config.kind === 'mixed') {
    const heapBytes = Math.floor(bytes / 2);
    value = {
      heap: createHeapBlock(heapBytes),
      external: createExternalBlock(bytes - heapBytes),
    };
  } else {
    value = createExternalBlock(bytes);
  }

  retainedBlocks.push({
    value,
    estimatedBytes: bytes,
    allocationNumber,
  });
  retainedBytes += bytes;

  const snapshot = emitSample(allocationReason(config.kind));

  if (
    retainedBytes >= config.limitMb * MB ||
    retainedBytes >= safety.retainedLimitMb * MB
  ) {
    pauseAtLimit('Достигнут лимит удерживаемой памяти');
  } else if (snapshot.memory.rss >= safety.hardRssLimitMb * MB) {
    pauseAtLimit(
      `Аварийная пауза: RSS достиг ${safety.hardRssLimitMb} MB`,
    );
  }
}

function startAllocationTimer() {
  clearInterval(allocationTimer);
  allocationTimer = setInterval(allocateBlock, config.intervalMs);
}

function pauseAtLimit(reason) {
  clearInterval(allocationTimer);
  allocationTimer = null;
  status = 'limit';
  emitSample(reason);
  send('log', {
    level: 'warning',
    message: `${reason}. Новые блоки больше не создаются.`,
  });
}

function startExperiment(nextConfig) {
  safety = { ...DEFAULT_SAFETY, ...nextConfig.safety };
  config = {
    kind: nextConfig.kind,
    allocationMb: nextConfig.allocationMb,
    intervalMs: nextConfig.intervalMs,
    limitMb: nextConfig.limitMb,
  };
  startedAt = Date.now();
  status = 'running';
  send('log', {
    level: 'info',
    message: `Эксперимент запущен: ${config.allocationMb} MB каждые ${config.intervalMs} мс, лимит ${config.limitMb} MB`,
  });
  emitSample('Дочерний процесс готов');
  startAllocationTimer();

  deadlineTimer = setTimeout(() => {
    if (safety.deadlineAction === 'stop' && status !== 'stopped') {
      clearInterval(allocationTimer);
      allocationTimer = null;
      status = 'stopped';
      emitSample('Автоостановка по лимиту времени');
      send('log', {
        level: 'warning',
        message:
          'Сработал публичный лимит времени: эксперимент автоматически остановлен.',
      });
      setTimeout(() => process.exit(0), 20);
      return;
    }

    if (status === 'running') {
      clearInterval(allocationTimer);
      allocationTimer = null;
      status = 'paused';
      emitSample('Автопауза через две минуты');
      send('log', {
        level: 'warning',
        message: 'Сработал лимит времени: эксперимент автоматически приостановлен.',
      });
    }
  }, safety.maxDurationMs);
}

async function createHeapSnapshot() {
  if (status === 'running') {
    clearInterval(allocationTimer);
    allocationTimer = null;
    status = 'paused';
    emitSample('Перед heap snapshot выделение памяти поставлено на паузу');
  }

  send('snapshot', { status: 'creating' });
  send('log', {
    level: 'warning',
    message:
      'Создаём heap snapshot: дочерний Event Loop временно заблокирован синхронной сериализацией V8 heap.',
  });

  try {
    const requestedPath = path.join(
      os.tmpdir(),
      `node-loop-lab-${process.pid}-${Date.now()}.heapsnapshot`,
    );
    const snapshotPath = writeHeapSnapshot(requestedPath);
    const file = await stat(snapshotPath);
    send('snapshot', {
      status: 'ready',
      path: snapshotPath,
      fileName: path.basename(snapshotPath),
      size: file.size,
      createdAt: new Date().toISOString(),
    });
    send('log', {
      level: 'info',
      message:
        'Heap snapshot готов. Скачайте его и откройте в Chrome DevTools → Memory → Load.',
    });
  } catch (error) {
    send('snapshot', {
      status: 'error',
      error: error.message,
    });
    send('log', {
      level: 'error',
      message: `Не удалось создать heap snapshot: ${error.message}`,
    });
  }
}

function handleAction(action) {
  if (action === 'pause' && status === 'running') {
    clearInterval(allocationTimer);
    allocationTimer = null;
    status = 'paused';
    emitSample('Добавление блоков поставлено на паузу');
    return;
  }

  if (action === 'resume' && status !== 'running') {
    if (retainedBytes >= config.limitMb * MB) {
      pauseAtLimit('Сначала освободите ссылки или увеличьте лимит новым запуском');
      return;
    }
    status = 'running';
    startAllocationTimer();
    emitSample('Добавление блоков продолжено');
    return;
  }

  if (action === 'release') {
    clearInterval(allocationTimer);
    allocationTimer = null;
    retainedBlocks = [];
    globalCache.clear();
    retainedBytes = 0;
    status = 'paused';
    emitSample('Ссылки удалены; объекты теперь доступны сборщику мусора');
    send('log', {
      level: 'info',
      message:
        'Хранилища ссылок очищены. Нажмите GC и сравните heapUsed/external.',
    });
    return;
  }

  if (action === 'snapshot') {
    void createHeapSnapshot();
    return;
  }

  if (action === 'gc') {
    if (typeof global.gc === 'function') {
      global.gc();
      // У Buffer финализация backing store может потребовать следующего
      // event-loop turn. Второй проход делает учебный эффект заметнее.
      setImmediate(() => {
        global.gc();
        emitSample('Выполнены два явных прохода global.gc()');
        send('log', {
          level: 'info',
          message:
            'GC завершён. RSS может не вернуться к исходному значению: allocator иногда сохраняет свободные страницы для повторного использования.',
        });
      });
    }
    return;
  }

  if (action === 'stop') {
    clearInterval(allocationTimer);
    clearTimeout(deadlineTimer);
    status = 'stopped';
    emitSample('Эксперимент остановлен');
    setTimeout(() => process.exit(0), 20);
  }
}

process.on('message', (message) => {
  if (message.type === 'start' && !config) {
    startExperiment(message.config);
  } else if (message.type === 'action') {
    handleAction(message.action);
  }
});

process.on('disconnect', () => process.exit(0));
