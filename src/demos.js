import { pbkdf2, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs';
import { lookup } from 'node:dns';
import { performance } from 'node:perf_hooks';
import { setImmediate as waitForImmediate } from 'node:timers/promises';
import { Worker as ThreadWorker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { Queue, QueueEvents, Worker as BullWorker } from 'bullmq';

const packageJsonPath = fileURLToPath(new URL('../package.json', import.meta.url));
const workerPath = new URL('./cpu-worker.js', import.meta.url);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function blockMainThread(durationMs) {
  const startedAt = performance.now();
  let iterations = 0;

  // Намеренная блокировка для учебного сценария. В production так делать нельзя.
  while (performance.now() - startedAt < durationMs) {
    iterations += Math.sqrt((iterations % 10_000) + 1);
  }

  return Math.round(iterations);
}

async function eventLoopOrder(emit) {
  emit('call-stack', 'sync', 'Синхронный код начал выполняться');

  const outerCallbacks = [];
  const waitForOuter = new Promise((resolve) => {
    let completed = 0;
    const done = () => {
      completed += 1;
      if (completed === 4) resolve();
    };

    process.nextTick(() => {
      outerCallbacks.push('process.nextTick');
      emit('nextTick', 'callback', 'process.nextTick callback');
      done();
    });

    Promise.resolve().then(() => {
      outerCallbacks.push('Promise.then');
      emit('microtasks', 'callback', 'Promise.then microtask');
      done();
    });

    queueMicrotask(() => {
      outerCallbacks.push('queueMicrotask');
      emit('microtasks', 'callback', 'queueMicrotask callback');
      done();
    });

    setTimeout(() => {
      outerCallbacks.push('setTimeout(0)');
      emit('timers', 'callback', 'setTimeout(0) callback');
      done();
    }, 0);

    setImmediate(() => {
      outerCallbacks.push('setImmediate');
      emit('check', 'callback', 'setImmediate callback');
      done();
    });
  });

  emit(
    'call-stack',
    'schedule',
    'Callbacks зарегистрированы; синхронный стек сейчас освободится',
  );
  await waitForOuter;

  // Ждём обе макрозадачи. Эксперимент запускается из HTTP callback, поэтому
  // здесь важен runtime-контекст, а не только порядок строк в сниппете.
  while (
    !outerCallbacks.includes('setTimeout(0)') ||
    !outerCallbacks.includes('setImmediate')
  ) {
    await sleep(1);
  }

  emit('result', 'result', `Первый раунд: ${outerCallbacks.join(' → ')}`);

  emit('poll', 'schedule', 'Запускаем fs.readFile и переходим к I/O-раунду');
  await new Promise((resolve, reject) => {
    readFile(packageJsonPath, 'utf8', (error) => {
      if (error) {
        reject(error);
        return;
      }

      emit('poll', 'callback', 'Callback fs.readFile: сейчас мы внутри poll-фазы');
      const ioOrder = [];
      let completed = 0;

      const done = () => {
        completed += 1;
        if (completed === 4) {
          emit('result', 'result', `Внутри I/O: ${ioOrder.join(' → ')}`);
          resolve();
        }
      };

      process.nextTick(() => {
        ioOrder.push('nextTick');
        emit('nextTick', 'callback', 'nextTick, созданный внутри I/O');
        done();
      });

      Promise.resolve().then(() => {
        ioOrder.push('Promise');
        emit('microtasks', 'callback', 'Promise, созданный внутри I/O');
        done();
      });

      setImmediate(() => {
        ioOrder.push('setImmediate');
        emit('check', 'callback', 'setImmediate, созданный внутри I/O');
        done();
      });

      setTimeout(() => {
        ioOrder.push('setTimeout');
        emit('timers', 'callback', 'setTimeout(0), созданный внутри I/O');
        done();
      }, 0);
    });
  });
}

async function eventDemultiplexer(emit) {
  emit('call-stack', 'sync', 'Регистрируем три независимые операции');

  const timerTask = new Promise((resolve) => {
    emit('timers', 'schedule', 'Таймер 180 мс передан подсистеме таймеров');
    setTimeout(() => {
      emit('timers', 'callback', 'Таймер готов: callback вернулся в JavaScript');
      resolve('timer');
    }, 180);
  });

  const fileTask = new Promise((resolve, reject) => {
    emit('libuv', 'schedule', 'Чтение package.json делегировано libuv');
    readFile(packageJsonPath, 'utf8', (error, content) => {
      if (error) {
        reject(error);
        return;
      }
      emit(
        'poll',
        'callback',
        `Файл готов: получено ${Buffer.byteLength(content)} байт`,
      );
      resolve('file');
    });
  });

  const dnsTask = new Promise((resolve, reject) => {
    emit('libuv', 'schedule', 'DNS lookup localhost делегирован libuv');
    lookup('localhost', (error, address) => {
      if (error) {
        reject(error);
        return;
      }
      emit('poll', 'callback', `DNS готов: localhost → ${address}`);
      resolve('dns');
    });
  });

  emit(
    'demultiplexer',
    'info',
    'JS-стек свободен; Event Loop ожидает сигналы готовности, а не опрашивает каждую функцию вручную',
  );

  const completed = await Promise.all([timerTask, fileTask, dnsTask]);
  emit('result', 'result', `Все источники готовы: ${completed.join(', ')}`);
}

async function callbackQueue(emit) {
  const scheduledAt = performance.now();
  emit('call-stack', 'sync', 'Одновременно ставим пять setTimeout(0)');

  await new Promise((resolve) => {
    let completed = 0;

    for (let index = 1; index <= 5; index += 1) {
      emit('timers', 'schedule', `Таймер #${index} зарегистрирован`);

      setTimeout(() => {
        const lag = Math.round(performance.now() - scheduledAt);
        emit(
          'timers-queue',
          'callback',
          `Callback #${index} взят из очереди (через ${lag} мс)`,
        );

        if (index === 1) {
          emit(
            'call-stack',
            'warning',
            'Callback #1 занимает главный поток на 260 мс',
          );
          blockMainThread(260);
          emit('call-stack', 'sync', 'Callback #1 освободил стек');

          process.nextTick(() => {
            emit(
              'nextTick',
              'callback',
              'nextTick из callback #1 вклинился перед следующим таймером',
            );
          });

          Promise.resolve().then(() => {
            emit(
              'microtasks',
              'callback',
              'Promise из callback #1 тоже выполнен перед следующим таймером',
            );
          });
        }

        completed += 1;
        if (completed === 5) {
          // setImmediate даёт nextTick/Promise последнего callback'а выполниться
          // до завершения учебного сценария.
          setImmediate(resolve);
        }
      }, 0);
    }
  });

  emit(
    'result',
    'result',
    'Очередь не исполняет callbacks параллельно: каждый ждёт свободный стек',
  );
}

function startHeartbeat(emit, lane, label, durationMs) {
  const intervalMs = 70;
  const startedAt = performance.now();
  let expectedAt = startedAt + intervalMs;
  let number = 0;

  const interval = setInterval(() => {
    number += 1;
    const now = performance.now();
    const lag = Math.max(0, Math.round(now - expectedAt));
    emit(
      lane,
      lag > 80 ? 'warning' : 'heartbeat',
      `${label} #${number}; задержка ${lag} мс`,
    );
    expectedAt = now + intervalMs;
  }, intervalMs);

  return new Promise((resolve) => {
    setTimeout(() => {
      clearInterval(interval);
      resolve(Math.round(performance.now() - startedAt));
    }, durationMs);
  });
}

async function blockingComparison(emit) {
  emit('result', 'section', 'Часть A — CPU-работа в главном потоке');
  const mainHeartbeat = startHeartbeat(emit, 'main-thread', 'Пульс main', 650);

  await sleep(150);
  emit('call-stack', 'warning', 'Блокируем главный поток примерно на 360 мс');
  const iterations = blockMainThread(360);
  emit(
    'call-stack',
    'sync',
    `Главный поток снова свободен (${iterations.toLocaleString('ru-RU')} итераций)`,
  );
  await mainHeartbeat;

  emit('result', 'section', 'Часть B — та же работа в Worker Thread');
  const workerHeartbeat = startHeartbeat(emit, 'main-thread', 'Пульс main', 650);

  await sleep(150);
  emit('worker-thread', 'schedule', 'CPU-задача отправлена отдельному Worker');

  const workerResult = await new Promise((resolve, reject) => {
    const worker = new ThreadWorker(workerPath, {
      workerData: { durationMs: 360 },
    });

    worker.once('message', resolve);
    worker.once('error', reject);
    worker.once('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker завершился с кодом ${code}`));
    });
  });

  emit(
    'worker-thread',
    'callback',
    `Worker закончил за ${workerResult.durationMs} мс; main всё это время отправлял пульс`,
  );
  await workerHeartbeat;

  emit(
    'result',
    'result',
    'Сравните разрыв heartbeat в части A с равномерными событиями в части B',
  );
}

async function libuvThreadPool(emit) {
  const jobs = 6;
  const iterations = 120_000;
  const startedAt = performance.now();

  emit(
    'call-stack',
    'sync',
    `Синхронно запускаем ${jobs} вызовов crypto.pbkdf2`,
  );
  emit(
    'libuv',
    'info',
    `UV_THREADPOOL_SIZE=${process.env.UV_THREADPOOL_SIZE ?? '4 (по умолчанию)'}`,
  );

  const tasks = Array.from({ length: jobs }, (_, index) => {
    const job = index + 1;
    emit('libuv-queue', 'schedule', `PBKDF2 #${job} отправлен в пул`);

    return new Promise((resolve, reject) => {
      pbkdf2('node-loop-lab', `salt-${job}`, iterations, 32, 'sha256', (error) => {
        if (error) {
          reject(error);
          return;
        }

        emit(
          'poll',
          'callback',
          `PBKDF2 #${job} вернулся через ${Math.round(performance.now() - startedAt)} мс`,
        );
        resolve();
      });
    });
  });

  emit(
    'call-stack',
    'info',
    'Главный JS-поток сразу свободен; вычисления идут в пуле libuv',
  );
  await Promise.all(tasks);
  emit(
    'result',
    'result',
    `Все ${jobs} задач завершены за ${Math.round(performance.now() - startedAt)} мс`,
  );
}

function redisConnectionOptions(redisUrl) {
  const parsed = new URL(redisUrl);
  if (parsed.protocol !== 'redis:' && parsed.protocol !== 'rediss:') {
    throw new Error('REDIS_URL должен использовать redis:// или rediss://');
  }

  const database = Number.parseInt(parsed.pathname.slice(1) || '0', 10);
  return {
    host: parsed.hostname,
    port: Number.parseInt(parsed.port || '6379', 10),
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    db: Number.isFinite(database) ? database : 0,
    tls: parsed.protocol === 'rediss:' ? {} : undefined,
    connectTimeout: 1200,
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    retryStrategy: () => null,
  };
}

async function runBullMqRoundtrip(emit) {
  if (!process.env.REDIS_URL) {
    emit(
      'bullmq',
      'warning',
      'BullMQ-пример пропущен: задайте REDIS_URL или запустите проект через Docker Compose',
    );
    return;
  }

  const queueName = `node-loop-lab-${process.pid}-${randomUUID().slice(0, 8)}`;
  const connection = redisConnectionOptions(process.env.REDIS_URL);
  let queue;
  let worker;
  let queueEvents;
  const reportedConnectionErrors = new Set();
  const reportConnectionError = (source, error) => {
    const key = `${source}:${error.message}`;
    if (reportedConnectionErrors.has(key)) return;
    reportedConnectionErrors.add(key);
    emit(source, 'error', `${source} error: ${error.message}`);
  };

  try {
    queue = new Queue(queueName, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 100 },
        removeOnComplete: false,
        removeOnFail: false,
      },
    });
    queueEvents = new QueueEvents(queueName, { connection });
    worker = new BullWorker(
      queueName,
      async (job) => {
        emit(
          'bullmq-worker',
          'callback',
          `BullMQ Worker взял job ${job.id}: ${job.name}`,
        );
        await sleep(35);
        return {
          thumbnail: `${job.data.file}.webp`,
          processedBy: process.pid,
        };
      },
      { connection, concurrency: 1 },
    );

    queue.on('error', (error) => reportConnectionError('bullmq-queue', error));
    queueEvents.on('error', (error) =>
      reportConnectionError('bullmq-events', error),
    );
    worker.on('error', (error) =>
      reportConnectionError('bullmq-worker', error),
    );

    await Promise.all([
      queue.waitUntilReady(),
      queueEvents.waitUntilReady(),
      worker.waitUntilReady(),
    ]);

    emit(
      'bullmq-producer',
      'schedule',
      'Queue.add сохраняет job в Redis; HTTP-запрос не выполняет job сам',
    );
    const job = await queue.add('make-thumbnail', {
      file: 'avatar.png',
    });
    emit('redis', 'info', `Redis хранит job ${job.id} в состоянии waiting`);

    const result = await job.waitUntilFinished(queueEvents, 5000);
    emit(
      'bullmq-events',
      'result',
      `QueueEvents получил completed для job ${job.id}: ${result.thumbnail}`,
    );
  } catch (error) {
    emit(
      'bullmq',
      'warning',
      `BullMQ недоступен: ${error.message}. Promise-часть сценария уже выполнена.`,
    );
  } finally {
    await Promise.allSettled([worker?.close(), queueEvents?.close()]);
    if (queue) {
      try {
        await queue.obliterate({ force: true });
      } catch {
        // Redis мог стать недоступен во время очистки учебной очереди.
      }
      await queue.close().catch(() => {});
    }
  }
}

async function promisesImmediateBullMq(emit) {
  emit(
    'call-stack',
    'sync',
    'Создаём Promise: executor выполняется синхронно прямо сейчас',
  );

  const basePromise = new Promise((resolve) => {
    emit('promise-executor', 'sync', 'executor вызвал resolve(2)');
    resolve(2);
    emit(
      'promise-executor',
      'sync',
      'Код после resolve ещё выполняется, но повторно изменить outcome уже нельзя',
    );
  });

  const chainedPromise = basePromise
    .then((value) => {
      emit('microtasks', 'callback', `Первый then получил ${value} и вернул ${value * 3}`);
      return value * 3;
    })
    .then(async (value) => {
      await sleep(25);
      emit(
        'timers',
        'callback',
        `Второй then дождался Promise и получил ${value}`,
      );
      return value + 1;
    })
    .finally(() => {
      emit(
        'microtasks',
        'callback',
        'finally выполнился без подмены успешного результата',
      );
    });

  const recoveredPromise = Promise.reject(new Error('учебная ошибка'))
    .catch((error) => {
      emit('microtasks', 'warning', `catch обработал: ${error.message}`);
      return 'fallback';
    });

  const immediatePromise = new Promise((resolve) => {
    setImmediate(() => {
      emit(
        'check',
        'callback',
        'setImmediate callback выполняется в check-фазе',
      );
      resolve('immediate');
    });
  });

  emit(
    'call-stack',
    'schedule',
    'then/catch/setImmediate зарегистрированы; текущий стек освобождается',
  );
  const [chainResult, recovered] = await Promise.all([
    chainedPromise,
    recoveredPromise,
    immediatePromise,
  ]);
  emit(
    'result',
    'result',
    `Цепочка завершилась значением ${chainResult}; catch вернул ${recovered}`,
  );

  const aggregateTasks = [
    sleep(45).then(() => 'slow'),
    sleep(10).then(() => 'fast'),
    sleep(25).then(() => 'middle'),
  ];
  const allResult = await Promise.all(aggregateTasks);
  emit(
    'promise-all',
    'result',
    `Promise.all сохранил входной порядок: ${allResult.join(', ')}`,
  );

  const settled = await Promise.allSettled([
    Promise.resolve('ok'),
    Promise.reject(new Error('expected failure')),
  ]);
  emit(
    'promise-all-settled',
    'result',
    `Promise.allSettled вернул статусы: ${settled.map((item) => item.status).join(', ')}`,
  );

  const raceWinner = await Promise.race([
    sleep(30).then(() => 'timer 30ms'),
    waitForImmediate().then(() => 'setImmediate'),
  ]);
  emit('check', 'result', `Promise.race: первым завершился ${raceWinner}`);

  await waitForImmediate();
  emit(
    'check',
    'callback',
    'await setImmediate() из node:timers/promises продолжил функцию в check-фазе',
  );

  await runBullMqRoundtrip(emit);
}

const learningContent = {
  'event-loop-order': {
    plain:
      'Представьте одного повара и несколько полок с заказами разного приоритета. Записи в блокноте делаются сверху вниз, но это ещё не порядок приготовления: закончив текущее действие, повар выбирает следующую работу по полке и контексту. В обычном callback Node сначала проверяет nextTick, затем microtasks и после этого продолжает фазы Event Loop.',
    foundation:
      'JavaScript-код одного Node-процесса обычно исполняется в одном главном потоке по правилу run-to-completion: начатая функция не прерывается другим callback. Строки вызова выполняются сверху вниз, но nextTick, then, setTimeout и setImmediate на своих строках лишь регистрируют функции для будущего выполнения. Event Loop выбирает callback после освобождения стека; между разными очередями приоритет важнее визуального порядка строк.',
    why:
      'Порядок регистрации помогает предсказывать работу внутри одной очереди, а правила очередей и фаз — между разными типами задач. Смешивание этих уровней приводит к гонкам, starvation и тестам, которые проходят только в одном окружении.',
    terms: [
      {
        name: 'Call Stack',
        description:
          'Стек вызываемых сейчас функций. Пока он не пуст, другой callback не начнёт выполнять JavaScript.',
      },
      {
        name: 'Callback',
        description:
          'Функция, которую runtime вызовет позже после события: таймера, I/O, сообщения Worker и т. п.',
      },
      {
        name: 'Microtask',
        description:
          'Приоритетное продолжение Promise или queueMicrotask. Очередь очищается между callbacks и фазами.',
      },
      {
        name: 'Фаза',
        description:
          'Этап оборота libuv Event Loop. Для лаборатории важны timers, poll и check.',
      },
      {
        name: 'Регистрация',
        description:
          'Синхронный момент, когда runtime получает callback и условия его будущего запуска. Регистрация ещё не является выполнением callback.',
      },
    ],
    steps: [
      {
        title: 'Выполняется sync-код',
        description:
          'Строки читаются сверху вниз: console.log печатает сразу, а остальные вызовы регистрируют callbacks.',
      },
      {
        title: 'Стек освобождается',
        description:
          'Node получает возможность выбрать отложенную работу.',
      },
      {
        title: 'Очистка nextTick',
        description:
          'В контексте этого HTTP-эксперимента process.nextTick имеет специальную очередь Node и выполняется перед Promise.',
      },
      {
        title: 'Очистка microtasks',
        description:
          'Выполняются Promise.then и queueMicrotask, включая добавленные ими новые microtasks.',
      },
      {
        title: 'Продолжение фаз',
        description:
          'Event Loop переходит к готовым timers, I/O в poll и setImmediate в check.',
      },
    ],
    nuances: [
      {
        title: 'Порядок строк — это порядок регистрации',
        description:
          'Сначала действительно выполняется строка nextTick, затем строка Promise и так далее. Но тела стрелочных функций выполнятся позже. Поэтому порядок строк не равен итоговому порядку console.log.',
      },
      {
        title: 'Внутри одной очереди важен FIFO',
        description:
          'Два Promise.then, зарегистрированные подряд, обычно выполнятся в порядке регистрации. Но nextTick и Promise находятся в разных очередях, поэтому приоритет очереди может обойти более раннюю строку.',
      },
      {
        title: 'Timer против immediate зависит от места',
        description:
          'В main-модуле setTimeout(0) и setImmediate могут поменяться местами. Если оба созданы внутри одного I/O callback, setImmediate выполняется раньше. Начиная с Node 20 расположение timers относительно poll также изменилось.',
      },
      {
        title: 'У top-level ESM есть исключение',
        description:
          'ES-модуль сам вычисляется как microtask, поэтому в standalone ESM-файле Promise может оказаться раньше nextTick. Лаборатория регистрирует их из HTTP callback и показывает обычный порядок nextTick → Promise.',
      },
    ],
    pitfalls: [
      {
        myth: 'В Node существует одна общая очередь событий.',
        fact: 'Очередей и фаз несколько, между ними есть правила приоритета.',
      },
      {
        myth: 'setTimeout(fn, 0) выполняет fn немедленно.',
        fact: 'Ноль означает минимальную задержку; callback ещё должен дождаться подходящей фазы и свободного стека.',
      },
      {
        myth: 'Асинхронная функция может прервать текущий JavaScript.',
        fact: 'Нет: callback начнётся только после завершения текущего участка кода.',
      },
      {
        myth: 'Если строка записана выше, её callback обязательно сработает раньше.',
        fact: 'Это верно лишь при совместимых условиях, например внутри одной FIFO-очереди. Между очередями сначала применяются их приоритеты и правила фаз.',
      },
      {
        myth: 'process.nextTick всегда и везде раньше Promise.',
        fact: 'Так происходит в обычных callbacks и CommonJS. При вычислении top-level ESM Promise/microtask может получить преимущество.',
      },
    ],
    codeIntro:
      'Первая строка выполняет callback console.log прямо сейчас. Следующие четыре строки выполняются сверху вниз только как регистрации. Чтобы предсказать тела стрелочных функций, учитывайте очередь, фазу и место, из которого запущен фрагмент.',
    codeNotes: [
      '`console.log` выполняется прямо сейчас в call stack.',
      '`process.nextTick` и `Promise.then` регистрируются по порядку строк, но используют разные очереди.',
      '`Promise.then` становится microtask; в top-level ESM это меняет сравнение с nextTick.',
      '`setTimeout` и `setImmediate` относятся к разным фазам, поэтому более ранняя строка timer не гарантирует более ранний callback.',
    ],
    questions: [
      'Почему Promise не выполняется в момент вызова Promise.resolve()?',
      'Что произойдёт с таймером, если текущая функция работает пять секунд?',
      'Когда порядок строк снова становится порядком callbacks, а когда его переопределяет очередь?',
    ],
  },
  'event-demultiplexer': {
    plain:
      'Это похоже на диспетчера в гостинице. Он не стоит у каждой двери и не спрашивает каждую секунду, готов ли номер. Службы сообщают диспетчеру о готовности, а тот передаёт уведомления одному администратору — JavaScript-потоку.',
    foundation:
      'Node регистрирует асинхронную работу в libuv и возвращает управление приложению. Для сокетов libuv использует механизмы готовности ОС, обычные файлы и dns.lookup обычно передаёт нативному thread pool, а таймер хранит как временной порог. Это разные внутренние пути, которые сходятся при возврате callbacks в JavaScript.',
    why:
      'Именно эта модель позволяет одному процессу обслуживать множество соединений без отдельного JavaScript-потока на каждый запрос.',
    terms: [
      {
        name: 'Event source',
        description:
          'Источник готовности: сокет, таймер, файловая операция, DNS или сообщение другого потока.',
      },
      {
        name: 'Demultiplexer',
        description:
          'Механизм, который ждёт множество источников и возвращает список тех, которые готовы.',
      },
      {
        name: 'libuv',
        description:
          'Нативная библиотека Node, унифицирующая Event Loop и асинхронные операции на разных ОС.',
      },
      {
        name: 'Poll',
        description:
          'Фаза, где Node обрабатывает многие готовые I/O callbacks и при необходимости ожидает новые события.',
      },
    ],
    steps: [
      {
        title: 'Регистрация',
        description:
          'JS вызывает timer, readFile и DNS, но не ждёт их результат на месте.',
      },
      {
        title: 'Делегирование',
        description:
          'libuv использует таймерную структуру, ОС или свой пул потоков.',
      },
      {
        title: 'Свободный стек',
        description:
          'Между регистрацией и готовностью Node может выполнять другие запросы.',
      },
      {
        title: 'Сигнал готовности',
        description:
          'Demultiplexer/libuv узнаёт, какой источник закончил работу.',
      },
      {
        title: 'Callback',
        description:
          'Готовая функция ставится на обработку и входит в JS-стек, когда тот свободен.',
      },
    ],
    nuances: [
      {
        title: 'Не каждый источник проходит один путь',
        description:
          'Сетевой сокет обычно наблюдается через epoll, kqueue или IOCP; обычный файл часто обслуживает thread pool; таймер вообще является проверкой временного порога. «Демультиплексор» здесь — удобная общая модель, а не один универсальный объект для всех API.',
      },
      {
        title: 'dns.lookup и dns.resolve устроены по-разному',
        description:
          'dns.lookup использует системный resolver и обычно общий пул libuv. Методы dns.resolve* выполняют DNS-запросы другим путём. Слово DNS само по себе ещё не говорит, какой механизм задействован.',
      },
      {
        title: 'Promise.all ничего не запускает',
        description:
          'readFile, lookup и таймер стартуют при вычислении выражений выше. Promise.all получает уже созданные Promises, сохраняет порядок результатов и только координирует ожидание.',
      },
      {
        title: 'Быстрый reject не означает отмену',
        description:
          'В успешном сценарии Promise.all ждёт все три результата. Если один Promise отклонится, общий Promise отклонится сразу, но остальные операции не отменятся автоматически.',
      },
    ],
    pitfalls: [
      {
        myth: 'Node постоянно вызывает каждую функцию и спрашивает, готова ли она.',
        fact: 'Ожидание выполняется эффективными механизмами ОС и libuv.',
      },
      {
        myth: 'На каждую асинхронную операцию создаётся новый поток.',
        fact: 'Сокеты обычно используют готовность ОС; ограниченный thread pool нужен лишь части API.',
      },
      {
        myth: 'Если операции завершились параллельно, их JS-callbacks тоже работают параллельно.',
        fact: 'В одной JS-среде callbacks по-прежнему входят в главный стек по одному.',
      },
      {
        myth: 'Promise.all запускает операции и управляет их отменой.',
        fact: 'Операции обычно уже запущены при создании Promises. Для отмены нужен отдельный механизм, например AbortSignal, если конкретный API его поддерживает.',
      },
    ],
    codeIntro:
      'Три операции начинают регистрироваться во время вычисления правых частей первых строк. Promise.all не запускает их ни последовательно, ни параллельно: он получает уже созданные Promises и агрегирует их результат.',
    codeNotes: [
      '`readFile` и `lookup` делегируются Node/libuv.',
      '`setTimeout` регистрирует дедлайн, а не блокирует поток.',
      '`Promise.all` сохраняет порядок результатов, даже если готовность пришла в другом порядке.',
      'При reject Promise.all не отменяет остальные операции.',
    ],
    questions: [
      'Почему быстрый DNS не обязан ждать медленный таймер?',
      'Какая часть схемы отличается для сетевого сокета и обычного файла?',
    ],
  },
  'callback-queue': {
    plain:
      'Представьте очередь к одному окну. Даже если пять человек уже готовы обслуживаться, кассир работает только с одним. Если первый клиент занимает окно надолго, ожидание увеличивается у всех остальных.',
    foundation:
      'Очередь хранит готовую работу, но не исполняет её. Исполнителем остаётся JavaScript call stack. После каждого callback Node также даёт приоритет nextTick и microtasks, поэтому разные категории работы могут вклиниваться между соседними timer callbacks. Показатель лаборатории измеряется от момента регистрации таймера и включает не только чистое ожидание в очереди.',
    why:
      'Задержка очереди влияет на latency всего сервера. Один медленный callback может замедлить тысячи логически независимых соединений.',
    terms: [
      {
        name: 'Queue',
        description:
          'Структура ожидания. Наличие элемента в очереди ещё не означает, что он уже выполняется.',
      },
      {
        name: 'Lag',
        description:
          'Задержка относительно ожидаемого момента. В этой лаборатории показано полное время от регистрации, поэтому в него входит минимальный timer threshold и ожидание стека.',
      },
      {
        name: 'Run-to-completion',
        description:
          'Текущий callback выполняется до возврата; Event Loop не вытесняет его другим JavaScript-кодом.',
      },
      {
        name: 'Starvation',
        description:
          'Ситуация, когда одна приоритетная очередь постоянно пополняется и не даёт другим фазам получить время.',
      },
    ],
    steps: [
      {
        title: 'Пять регистраций',
        description:
          'Все setTimeout(0) создаются в одном коротком синхронном цикле.',
      },
      {
        title: 'Timers становятся готовы',
        description:
          'Их минимальный deadline проходит, но стек может быть занят.',
      },
      {
        title: 'Первый callback блокирует',
        description:
          'CPU-цикл удерживает единственный главный JS-стек примерно 260 мс.',
      },
      {
        title: 'Приоритетные очереди',
        description:
          'nextTick и Promise из первого callback выполняются перед вторым таймером.',
      },
      {
        title: 'Очередь разгружается',
        description:
          'Оставшиеся callbacks быстро выполняются один за другим.',
      },
    ],
    nuances: [
      {
        title: 'setTimeout(0) не готов в ту же наносекунду',
        description:
          'Ноль задаёт минимальный порог, а не немедленный вызов. Таймер должен стать готовым, Event Loop — дойти до timers, а стек — освободиться.',
      },
      {
        title: 'Число в trace — не чистое queue wait',
        description:
          'Эксперимент считает миллисекунды от общей регистрации. Это наглядная latency, но для точного времени ожидания именно в очереди понадобилось бы отдельно зафиксировать момент готовности каждого таймера.',
      },
      {
        title: 'FIFO здесь контролируемый, а не глобальный',
        description:
          'Пять одинаковых таймеров создаются одним циклом и обычно обрабатываются в порядке регистрации. Это нельзя переносить на callbacks из разных фаз, I/O-источников или потоков.',
      },
      {
        title: 'Microtasks могут вызвать starvation',
        description:
          'После callback #1 Node обработает созданные nextTick и Promise перед timer #2. Если nextTick бесконечно добавляет новый nextTick, Event Loop долго не доберётся до остальных фаз.',
      },
    ],
    pitfalls: [
      {
        myth: 'Готовые callbacks начинают работать одновременно.',
        fact: 'Готовность означает право ждать исполнения, а не параллельный JS.',
      },
      {
        myth: 'Все очереди строго глобально FIFO.',
        fact: 'FIFO применимо внутри конкретных структур, но категории работы имеют разные правила и приоритеты.',
      },
      {
        myth: 'Задержка таймера показывает неточность часов.',
        fact: 'Чаще она показывает занятый стек, насыщенную фазу или нагрузку процесса.',
      },
      {
        myth: 'Пять просроченных таймеров означают пять параллельных исполнителей.',
        fact: 'Они лишь становятся кандидатами на выполнение; один главный JavaScript-стек всё равно обрабатывает callbacks последовательно.',
      },
    ],
    codeIntro:
      'Первый callback намеренно выполняет тяжёлую синхронную функцию. Остальные четыре таймера не могут обойти его, хотя их delay тоже равен нулю.',
    codeNotes: [
      'Цикл регистрирует callbacks, но не выполняет их.',
      '`heavyCpuWork` занимает текущий стек.',
      'Лог следующего timer появится только после возврата из тяжёлой функции.',
      'Показанное время считается от регистрации, а не от внутреннего сигнала готовности таймера.',
    ],
    questions: [
      'Почему callback №2 получает задержку около 260 мс?',
      'Может ли Promise внутри callback №1 выполниться раньше callback №2?',
    ],
  },
  'blocking-vs-worker': {
    plain:
      'Главный поток — как единственный оператор экстренной линии. Если поручить ему на несколько минут считать огромную таблицу, он перестанет отвечать на звонки. Worker — второй оператор, которому можно передать вычисление, сохранив первую линию свободной.',
    foundation:
      'Event Loop хорошо масштабирует ожидание I/O, но не ускоряет CPU-bound JavaScript. Синхронный расчёт занимает main thread. Worker Thread создаёт отдельный V8 isolate, call stack и Event Loop внутри того же процесса; данные передаются клонированием, transfer list или через SharedArrayBuffer.',
    why:
      'На сервере блокировка main thread задерживает все маршруты, таймеры и клиентов процесса. Worker позволяет сохранить отзывчивость, но требует контролировать число потоков и стоимость передачи данных.',
    terms: [
      {
        name: 'Main Thread',
        description:
          'Поток, где работает Express, callbacks HTTP и основной JavaScript приложения.',
      },
      {
        name: 'CPU-bound',
        description:
          'Работа, скорость которой ограничена вычислениями CPU, а не ожиданием внешнего ресурса.',
      },
      {
        name: 'Worker Thread',
        description:
          'Отдельная JS-среда Node со своим V8 isolate. Может считать параллельно с main.',
      },
      {
        name: 'Message passing',
        description:
          'Обмен данными между потоками через postMessage; обычные значения клонируются или передаются.',
      },
    ],
    steps: [
      {
        title: 'Heartbeat main',
        description:
          'Таймер создаёт контрольные события примерно каждые 70 мс.',
      },
      {
        title: 'Блокировка',
        description:
          'Синхронный CPU-цикл не возвращает управление Event Loop.',
      },
      {
        title: 'Накопленная задержка',
        description:
          'Heartbeat не может прервать расчёт и приходит только после освобождения стека.',
      },
      {
        title: 'Создание Worker',
        description:
          'Та же вычислительная идея запускается в другом V8 isolate.',
      },
      {
        title: 'Сообщение результата',
        description:
          'Main продолжает heartbeat и позже получает асинхронный message callback.',
      },
    ],
    nuances: [
      {
        title: 'Отзывчивее не значит быстрее',
        description:
          'Опыт доказывает, что main thread остаётся доступным. Он не обещает меньшего времени вычисления: создание Worker, запуск isolate и передача данных имеют стоимость.',
      },
      {
        title: 'Потоки всё равно делят CPU',
        description:
          'Worker работает отдельно от Event Loop сервера, но конкурирует за ядра, память и cgroup-лимит того же процесса/контейнера. При насыщенном CPU heartbeat может слегка дрожать.',
      },
      {
        title: 'Worker — не дочерний процесс',
        description:
          'У Worker свой V8 isolate и JS heap, но тот же процесс ОС и возможность общей памяти. Изоляция слабее, чем у child_process, зато обмен обычно дешевле.',
      },
      {
        title: 'Большие сообщения имеют цену',
        description:
          'Обычные значения проходят structured clone. Для крупных ArrayBuffer полезна передача владения через transfer list; SharedArrayBuffer требует собственной синхронизации.',
      },
    ],
    pitfalls: [
      {
        myth: 'Если обернуть расчёт в async function, он уйдёт в другой поток.',
        fact: 'async меняет форму результата на Promise, но синхронное тело всё равно работает в текущем потоке.',
      },
      {
        myth: 'Promise сам по себе делает работу параллельной.',
        fact: 'Promise описывает будущее значение; место выполнения работы определяется используемым API.',
      },
      {
        myth: 'Нужно создавать новый Worker на каждый HTTP-запрос.',
        fact: 'Создание isolate дорого; в production обычно используют ограниченный worker pool и очередь.',
      },
      {
        myth: 'Worker гарантированно ускоряет любую задачу.',
        fact: 'Короткая задача может стать медленнее из-за старта и обмена данными. Главный выигрыш этого опыта — отзывчивость main thread.',
      },
    ],
    codeIntro:
      'Первая строка блокирует main. Во второй части Worker выполняет отдельный файл, а main подписывается на сообщение результата и остаётся доступным.',
    codeNotes: [
      'Worker не является callback в том же потоке — это отдельная JS-среда.',
      'Событие `message` уже обрабатывается главным Event Loop.',
      'Ошибки и завершение Worker нужно обрабатывать отдельно.',
      'Для production обычно переиспользуют Workers, а не создают isolate на каждую мелкую задачу.',
    ],
    questions: [
      'Почему setInterval не может прервать while-loop?',
      'Какие данные дорого пересылать Worker через структурное клонирование?',
    ],
  },
  'libuv-thread-pool': {
    plain:
      'Это небольшая кухня за залом. Официант — главный JavaScript-поток — быстро передаёт шесть заказов. На кухне только четыре повара, поэтому два заказа ждут, даже если официант свободен и продолжает принимать гостей.',
    foundation:
      'Thread pool libuv выполняет определённые нативные операции, для которых нет удобной неблокирующей готовности ОС или которые вычислительно дороги. JavaScript приложения не исполняется внутри этого пула. Пул общий для процесса, а после завершения нативной функции libuv возвращает callback в Event Loop.',
    why:
      'Общий ограниченный пул может стать скрытым bottleneck: тяжёлая crypto-задача способна увеличить задержку независимого fs или DNS-вызова.',
    terms: [
      {
        name: 'Native operation',
        description:
          'Код на C/C++ внутри Node или библиотеки, а не JavaScript приложения.',
      },
      {
        name: 'Thread pool',
        description:
          'Фиксированное число переиспользуемых потоков и очередь заданий перед ними.',
      },
      {
        name: 'UV_THREADPOOL_SIZE',
        description:
          'Переменная окружения, задающая размер общего пула при старте Node-процесса.',
      },
      {
        name: 'PBKDF2',
        description:
          'Вычислительно дорогая функция получения ключа; здесь она создаёт заметную работу для пула.',
      },
    ],
    steps: [
      {
        title: 'Шесть отправок',
        description:
          'JS быстро вызывает асинхронный pbkdf2 шесть раз.',
      },
      {
        title: 'Очередь пула',
        description:
          'Свободные native threads забирают задания, остальные ожидают.',
      },
      {
        title: 'Main свободен',
        description:
          'Event Loop может обслуживать HTTP, пока нативные потоки считают.',
      },
      {
        title: 'Первая волна',
        description:
          'При стандартном пуле близко завершаются примерно первые четыре задачи.',
      },
      {
        title: 'Callbacks результатов',
        description:
          'Завершение каждого native job возвращается в основной Event Loop.',
      },
    ],
    nuances: [
      {
        title: 'Размер пула — не число физических ядер',
        description:
          'UV_THREADPOOL_SIZE=4 разрешает до четырёх pool jobs, но ОС и CPU решают, сколько работы реально идёт одновременно. На загруженной или малоядерной машине красивых «волн» может не быть.',
      },
      {
        title: 'Переменную задают до запуска Node',
        description:
          'Пул инициализируется заранее, поэтому UV_THREADPOOL_SIZE следует передавать окружением процессу или контейнеру. Изменение process.env после начала работы не является надёжной перенастройкой.',
      },
      {
        title: 'Свободный Event Loop ещё может тормозить',
        description:
          'Main thread не выполняет PBKDF2, но native threads конкурируют за тот же CPU. Кроме того, занятый общий pool задерживает другие использующие его fs, crypto и некоторые DNS-операции.',
      },
      {
        title: 'Волны — наблюдение, а не контракт',
        description:
          'Одинаковое число итераций не гарантирует строгий порядок завершения. Планировщик ОС, частоты CPU и другая нагрузка могут смешать callbacks.',
      },
    ],
    pitfalls: [
      {
        myth: 'Пул libuv и Worker Threads — одно и то же.',
        fact: 'В libuv pool работает нативная функция API; Worker исполняет ваш JavaScript в отдельном isolate.',
      },
      {
        myth: 'Чем больше UV_THREADPOOL_SIZE, тем быстрее.',
        fact: 'После насыщения CPU дополнительные потоки увеличивают конкуренцию и переключения контекста.',
      },
      {
        myth: 'Любой асинхронный Node API использует pool.',
        fact: 'Сетевые сокеты обычно используют механизмы готовности ОС без потока на каждую операцию.',
      },
      {
        myth: 'Свободный main thread означает, что нагрузка не влияет на HTTP.',
        fact: 'CPU contention и общий pool всё равно способны увеличить latency, даже когда JavaScript не заблокирован.',
      },
    ],
    codeIntro:
      'Все шесть native jobs создаются синхронно. Асинхронная форма pbkdf2 передаёт вычисление пулу, а callback фиксирует момент возврата результата.',
    codeNotes: [
      'Количество вызовов может быть больше размера пула.',
      'Очередь пула находится не в JavaScript-коде примера.',
      'Порядок завершения задач не обязан совпадать с порядком запуска.',
      'UV_THREADPOOL_SIZE применяется ко всему процессу, а не только к этому циклу.',
    ],
    questions: [
      'Почему пятая задача может ждать, хотя Event Loop свободен?',
      'Что произойдёт с fs.readFile при полностью занятом общем пуле?',
    ],
  },
  'memory-leak': {
    plain:
      'Сборщик мусора похож на уборщика, который выбрасывает только вещи без владельца. Если ненужные коробки всё ещё записаны в глобальном списке, уборщик считает их нужными. Сначала надо удалить ссылки из списка — только потом память можно вернуть.',
    foundation:
      'GC начинает обход от корней: global-объектов, текущих стеков, активных замыканий и внутренних handles. Всё достижимое считается живым. Утечка — это не «GC сломан», а ситуация, когда программа по ошибке сохраняет путь от корня к уже ненужным данным. Метрики лаборатории описывают разные, частично пересекающиеся представления памяти.',
    why:
      'Длительный рост памяти приводит к более частым и длинным GC-паузам, свопингу, замедлению процесса и в конце к OOM. При этом разные типы памяти отражаются в разных метриках.',
    terms: [
      {
        name: 'Heap Used',
        description:
          'Часть управляемой V8-кучи, занятая JavaScript-объектами, массивами, строками и служебными структурами.',
      },
      {
        name: 'External',
        description:
          'Память, связанная с JS-объектами, но расположенная вне V8 heap — например backing store Buffer.',
      },
      {
        name: 'RSS',
        description:
          'Общая резидентная память процесса: heap, native code, stacks, buffers и другие отображённые страницы.',
      },
      {
        name: 'Retained',
        description:
          'Объём данных, который остаётся живым благодаря ссылкам. В лаборатории это контролируемая оценка блоков в массиве.',
      },
      {
        name: 'GC root',
        description:
          'Начальная точка обхода сборщика мусора, например global scope или активный стек.',
      },
      {
        name: 'Reachable',
        description:
          'Объект, до которого можно дойти по цепочке ссылок от GC root; такой объект удалять нельзя.',
      },
    ],
    steps: [
      {
        title: 'Ручной запуск',
        description:
          'Express создаёт отдельный дочерний Node-процесс с V8-лимитом и прикладными предохранителями.',
      },
      {
        title: 'Allocation',
        description:
          'По таймеру создаётся Buffer, Array или смешанный блок.',
      },
      {
        title: 'Retention',
        description:
          'Ссылка на блок добавляется в глобальный массив retainedBlocks.',
      },
      {
        title: 'Пауза',
        description:
          'Новые блоки не создаются, но старые остаются достижимыми и занимают память.',
      },
      {
        title: 'Release + GC',
        description:
          'Массив очищается, путь от GC root исчезает, после чего GC может удалить объекты.',
      },
      {
        title: 'Stop',
        description:
          'Завершение дочернего процесса гарантированно возвращает ОС всю принадлежащую ему память.',
      },
    ],
    nuances: [
      {
        title: 'Retained — счётчик лаборатории',
        description:
          'Он суммирует запрошенные размеры сохранённых блоков. Это не точный retained size из heap snapshot и не фактический RSS: у объектов есть служебные накладные расходы.',
      },
      {
        title: 'Метрики частично пересекаются',
        description:
          'arrayBuffers входит в external, а RSS охватывает heap, external, code, stacks и другие страницы. Складывать heapUsed + external + arrayBuffers + RSS нельзя — получится двойной счёт.',
      },
      {
        title: 'Release, GC и возврат ОС — три шага',
        description:
          'Удаление ссылок лишь делает объекты недостижимыми. GC позже освобождает их для allocator, а allocator может оставить страницы процессу для повторного использования, поэтому RSS не обязан сразу падать.',
      },
      {
        title: 'Предохранитель не всегда hard quota',
        description:
          'Лимиты retained, RSS и времени контролируются кодом, а --max-old-space-size ограничивает V8 heap, но не всю память процесса. Жёсткий общий предел даёт Docker cgroup из compose.yml — 2 GB на сервер и его child.',
      },
    ],
    pitfalls: [
      {
        myth: 'Любой рост RSS доказывает утечку.',
        fact: 'Allocator может сохранять свободные страницы для повторного использования. Нужен устойчивый тренд под одинаковой нагрузкой.',
      },
      {
        myth: 'global.gc() может удалить любой ненужный мне объект.',
        fact: 'GC не понимает бизнес-смысл. Пока ссылка достижима, объект считается живым.',
      },
      {
        myth: 'Если heapUsed стабилен, утечки точно нет.',
        fact: 'Могут расти Buffer/external, native allocations, handles или ресурсы вне V8 heap.',
      },
      {
        myth: 'const автоматически удерживает объект навсегда.',
        fact: 'Время жизни определяется достижимостью ссылки, а не ключевым словом let/const.',
      },
      {
        myth: 'Можно сложить все показанные числа и получить память процесса.',
        fact: 'Метрики имеют разные границы и пересечения. Для общего резидентного объёма смотрят RSS, а остальные показатели помогают объяснить его состав.',
      },
    ],
    codeIntro:
      'Критическая строка — push в массив, живущий дольше отдельных операций. Пока массив достижим из global scope, все добавленные Buffer также достижимы.',
    codeNotes: [
      '`Buffer.alloc` увеличивает прежде всего external/arrayBuffers.',
      '`leakedBlocks.push` создаёт долгоживущую удерживающую ссылку.',
      'Присваивание `[]` разрывает ссылки, но не обещает немедленное уменьшение RSS.',
      'Ручной GC нужен только для наблюдения; production-код не должен лечить им утечки.',
      'Retained в интерфейсе — контролируемая оценка размера блоков, а не результат heap profiler.',
    ],
    questions: [
      'Почему GC до очистки массива не уменьшает retained?',
      'Почему RSS способен остаться высоким даже после успешной очистки?',
      'Какая метрика лучше покажет утечку Buffer?',
    ],
  },
  'promises-immediate-bullmq': {
    plain:
      'Promise — это не «фоновый поток», а коробка для одного будущего результата. Коробка сначала pending, затем навсегда становится fulfilled со значением либо rejected с ошибкой. `then`, `catch` и `finally` не меняют исходную коробку: каждый вызов создаёт следующий Promise в цепочке. BullMQ решает уже другую задачу — сохраняет задания в Redis, чтобы отдельные Workers могли взять их сейчас, позже или после перезапуска процесса.',
    foundation:
      'Executor внутри `new Promise(executor)` вызывается синхронно, а реакции `then/catch/finally` планируются как microtasks. `async`-функция всегда возвращает Promise; `await` приостанавливает только эту функцию и продолжает её через microtask. `setImmediate` регистрирует callback check-фазы Node и не означает «выполнить немедленно». BullMQ находится уровнем выше Event Loop: Queue записывает job в Redis, Worker получает и обрабатывает его, а QueueEvents наблюдает глобальные события через Redis.',
    why:
      'Эти уровни часто смешивают: Promise координирует получение результата внутри программы, setImmediate переносит продолжение на следующую check-фазу, а BullMQ переживает HTTP-запросы и связывает несколько процессов или машин. Правильный выбор делает ошибки предсказуемыми и не теряет тяжёлую работу при рестарте.',
    terms: [
      {
        name: 'Promise',
        description:
          'Объект одного будущего outcome: fulfilled со значением или rejected с причиной. После settlement состояние уже не меняется.',
      },
      {
        name: 'Executor',
        description:
          'Функция, переданная в `new Promise`. Она вызывается синхронно и получает `resolve` и `reject`; помещать туда код без реальной callback-обёртки обычно не нужно.',
      },
      {
        name: 'Pending / fulfilled / rejected',
        description:
          'Три состояния Promise. Fulfilled и rejected вместе называют settled; переход из settled обратно в pending невозможен.',
      },
      {
        name: 'then chain',
        description:
          'Цепочка новых Promise. Возвращённое значение становится результатом следующего звена, возвращённый Promise ожидается, а throw превращается в rejection.',
      },
      {
        name: 'Microtask',
        description:
          'Высокоприоритетное продолжение Promise. Microtasks очищаются после текущего JavaScript callback до перехода к следующей фазе Event Loop.',
      },
      {
        name: 'async / await',
        description:
          '`async` оборачивает результат в Promise. `await` подписывается на Promise и приостанавливает только текущую async-функцию, не поток Node.',
      },
      {
        name: 'Promise.all',
        description:
          'Ждёт успеха всех входов и сохраняет порядок результатов. Первый rejection отклоняет общий Promise, но не отменяет оставшуюся работу.',
      },
      {
        name: 'Promise.allSettled',
        description:
          'Ждёт все входы и возвращает объекты со статусами fulfilled/rejected; удобно, когда ошибка одного задания не должна скрывать остальные результаты.',
      },
      {
        name: 'Promise.race / any',
        description:
          '`race` берёт первый settled outcome, включая ошибку. `any` берёт первый fulfilled, а если успехов нет — отклоняется с AggregateError.',
      },
      {
        name: 'setImmediate',
        description:
          'Node API для callback check-фазы. Это не microtask и не гарантия «раньше setTimeout» без знания контекста регистрации.',
      },
      {
        name: 'BullMQ',
        description:
          'Redis-backed очередь задач Node.js. Она хранит jobs вне памяти HTTP-процесса и координирует producers, workers, retries, delays и события.',
      },
      {
        name: 'Redis',
        description:
          'Внешнее хранилище состояний BullMQ: waiting, active, delayed, completed и failed. Без доступного Redis BullMQ не является долговечной очередью.',
      },
      {
        name: 'Job',
        description:
          'Именованное задание с сериализуемыми data и options: attempts, backoff, delay, priority и правила удаления результата.',
      },
      {
        name: 'BullMQ Worker',
        description:
          'Потребитель jobs. Processor может быть async, но обычный Worker не превращает CPU-тяжёлый JavaScript в безопасную фоновую работу автоматически.',
      },
      {
        name: 'Idempotency',
        description:
          'Свойство обработчика, при котором повторный запуск с тем же jobId не создаёт лишний платёж, письмо или запись. Важно для retries и восстановления stalled jobs.',
      },
    ],
    steps: [
      {
        title: 'Executor запускается сейчас',
        description:
          '`new Promise(executor)` синхронно вызывает executor. Он может вызвать resolve, но код после resolve внутри executor всё равно дойдёт до конца.',
      },
      {
        title: 'Outcome фиксируется один раз',
        description:
          'Первый resolve/reject побеждает. Если resolve получает другой Promise, новый Promise принимает его eventual outcome.',
      },
      {
        title: 'Реакции становятся microtasks',
        description:
          '`then`, `catch` и `finally` не входят в текущий стек. Они получат шанс после завершения синхронного callback.',
      },
      {
        title: 'Каждое звено возвращает новый Promise',
        description:
          'Следующий `then` ждёт именно return предыдущего. Забытый return часто запускает работу, но рвёт цепочку ожидания и обработки ошибок.',
      },
      {
        title: 'await разворачивает то же правило',
        description:
          'Код до await выполняется сейчас; продолжение после settlement планируется microtask. try/catch ловит rejection так же, как `.catch()`.',
      },
      {
        title: 'Комбинатор задаёт политику',
        description:
          'all, allSettled, race и any не запускают переданные операции — они получают уже созданные значения/Promise и по-разному агрегируют outcomes.',
      },
      {
        title: 'setImmediate переносит фазу',
        description:
          'Callback попадает в check. Promise из текущего callback обычно выполнится раньше, потому что microtasks очищаются до продолжения фаз.',
      },
      {
        title: 'Producer добавляет BullMQ job',
        description:
          '`queue.add()` возвращает Promise после записи данных job в Redis. Это подтверждение постановки в очередь, а не завершения бизнес-работы.',
      },
      {
        title: 'Worker переводит waiting → active',
        description:
          'Свободный Worker резервирует job, вызывает processor и завершает его return/throw состоянием completed/failed.',
      },
      {
        title: 'События, retries и cleanup',
        description:
          'QueueEvents сообщает глобальный lifecycle; attempts/backoff возвращают временно упавшие jobs; removeOnComplete/removeOnFail не дают Redis расти бесконечно.',
      },
    ],
    nuances: [
      {
        title: 'Promise не делает синхронный код асинхронным',
        description:
          '`new Promise(() => heavyCpu())` немедленно выполнит heavyCpu в текущем потоке. Для CPU-bound работы нужны Worker Threads или отдельный процесс.',
      },
      {
        title: 'resolve — не мгновенный вызов then',
        description:
          'resolve фиксирует outcome или начинает следовать другому Promise. Зарегистрированный then всё равно выполнится microtask после текущего стека.',
      },
      {
        title: 'finally прозрачен не всегда',
        description:
          'Обычный return из finally не заменяет исходное значение, но throw или rejected Promise из finally заменит outcome новой ошибкой.',
      },
      {
        title: 'catch ловит ошибки выше по цепочке',
        description:
          'Он получает rejection исходной операции, throw из then и rejected Promise, который вернул then. Ошибки в коде после отдельного, не возвращённого Promise могут уйти мимо.',
      },
      {
        title: 'Promise.all fail-fast, но не cancel-fast',
        description:
          'Общий Promise отклоняется при первой ошибке, однако сетевой запрос, таймер или job продолжаются, пока их API не получит собственный сигнал отмены.',
      },
      {
        title: 'Timeout через race сам ничего не отменяет',
        description:
          'Проигравший Promise продолжает работу. Для fetch нужен AbortController; для BullMQ — отдельная прикладная стратегия отмены job.',
      },
      {
        title: 'setImmediate зависит от места',
        description:
          'Внутри одного I/O callback check выполняется перед следующим timers-проходом, поэтому immediate раньше нулевого timer. В main-модуле универсального порядка нет.',
      },
      {
        title: 'BullMQ Worker — роль, а не Worker Thread',
        description:
          'BullMQ Worker может жить в том же или отдельном процессе/на другой машине. Его async processor хорош для I/O, но CPU-цикл всё равно блокирует Event Loop своего процесса.',
      },
      {
        title: 'Состояние находится в Redis',
        description:
          'Promise исчезает вместе с процессом. BullMQ job остаётся доступным Workers после завершения HTTP-запроса и может пережить рестарт producer-а.',
      },
      {
        title: 'Доставка не равна уникальному эффекту',
        description:
          'Retries и восстановление требуют идемпотентности: используйте стабильный jobId, уникальные ключи БД или таблицу обработанных операций.',
      },
    ],
    pitfalls: [
      {
        myth: '`new Promise(async (resolve) => ...)` — обычный способ использовать await.',
        fact: 'Promise-constructor ожидает синхронный executor; async executor создаёт второй Promise, ошибку которого внешний constructor не связывает автоматически. Обычно вынесите async-функцию отдельно.',
      },
      {
        myth: 'then изменяет исходный Promise.',
        fact: 'then всегда возвращает новый Promise. Исходный outcome остаётся прежним.',
      },
      {
        myth: 'Если не написать return внутри then, следующий then всё равно подождёт.',
        fact: 'Без return цепочка получает undefined и продолжает раньше запущенной внутри операции.',
      },
      {
        myth: 'await блокирует Event Loop до ответа.',
        fact: 'Он приостанавливает одну async-функцию. Event Loop продолжает обслуживать другие callbacks, пока awaited Promise pending.',
      },
      {
        myth: 'Promise.all запускает функции параллельно.',
        fact: 'Операции запускаются при вызове функций. Promise.all только агрегирует уже полученные Promise/значения.',
      },
      {
        myth: 'setImmediate означает выполнить прямо сейчас.',
        fact: 'Он только регистрирует callback check-фазы, который ждёт свободного стека и подходящего прохода Event Loop.',
      },
      {
        myth: 'BullMQ — это большая очередь callbacks Event Loop.',
        fact: 'BullMQ — распределённая прикладная очередь в Redis. Callback/microtask очереди принадлежат runtime конкретного Node-процесса.',
      },
      {
        myth: 'Успешный queue.add означает, что письмо уже отправлено.',
        fact: 'Он означает, что job сохранён. Завершение подтверждает Worker/состояние completed или соответствующее QueueEvents-событие.',
      },
    ],
    codeIntro:
      'Основной сниппет связывает три уровня. Promise строит локальную цепочку результата, setImmediate переносит continuation в check-фазу, а BullMQ сохраняет отдельный job в Redis и отдаёт его Worker. Эти механизмы дополняют друг друга, а не заменяют.',
    codeNotes: [
      'Возвращайте значение или Promise из каждого then, если следующее звено должно ждать.',
      'Один catch в конце обрабатывает rejection всех возвращённых звеньев выше.',
      'finally используйте для cleanup, не для преобразования обычного результата.',
      'Импорт из `node:timers/promises` позволяет писать `await setImmediate()` без ручного constructor.',
      '`queue.add` и processor Worker связаны через Redis, а не общей памятью.',
      'Закрывайте Queue/Worker/QueueEvents при завершении процесса и задавайте remove policies.',
      'Делайте бизнес-эффект Worker идемпотентным до включения retries.',
    ],
    examples: [
      {
        title: '01 · Оборачиваем callback в Promise',
        goal:
          'Используйте constructor на границе старого callback API; для уже promise-based API новый constructor не нужен.',
        code: `import { readFile } from 'node:fs';

function readText(path) {
  return new Promise((resolve, reject) => {
    readFile(path, 'utf8', (error, text) => {
      if (error) return reject(error);
      resolve(text);
    });
  });
}`,
        notes: [
          'Executor запускается синхронно.',
          'resolve/reject вызываются позже из callback.',
          'Для fs уже существует fs/promises — это учебная обёртка.',
        ],
      },
      {
        title: '02 · Цепочка then и обязательный return',
        goal:
          'Каждый return задаёт input следующего звена и связывает ошибки в одну цепочку.',
        code: `getUser(42)
  .then(user => {
    return getOrders(user.id);
  })
  .then(orders => orders.filter(order => order.paid))
  .then(paid => console.log(paid))
  .catch(error => console.error(error))
  .finally(() => console.log('finished'));`,
        notes: [
          'Можно сократить первый then до `.then(user => getOrders(user.id))`.',
          'throw внутри любого then попадёт в catch.',
          'finally не получает paid или error аргументом.',
        ],
      },
      {
        title: '03 · Тот же flow через async/await',
        goal:
          'async/await меняет синтаксис, но остаётся цепочкой Promise и microtasks.',
        code: `async function printPaidOrders(userId) {
  try {
    const user = await getUser(userId);
    const orders = await getOrders(user.id);
    const paid = orders.filter(order => order.paid);
    console.log(paid);
    return paid;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    console.log('finished');
  }
}`,
        notes: [
          'Возвращаемое paid станет fulfilled value.',
          'Повторный throw не скрывает ошибку от вызывающего кода.',
          'Последовательные await нужны только при реальной зависимости.',
        ],
      },
      {
        title: '04 · Выбираем Promise-комбинатор',
        goal:
          'Сначала запускаем операции, затем выбираем политику ожидания.',
        code: `const tasks = urls.map(url => fetch(url));

const everyResponse = await Promise.all(tasks);
const everyOutcome = await Promise.allSettled(tasks);
const firstSettled = await Promise.race(tasks);
const firstSuccess = await Promise.any(tasks);`,
        notes: [
          'all: все успехи или первая ошибка.',
          'allSettled: полный отчёт без раннего reject.',
          'race: первый success или error; any: первый success.',
        ],
      },
      {
        title: '05 · Timeout с настоящей отменой fetch',
        goal:
          'Promise.race недостаточно: AbortController сообщает проигравшей операции, что её надо остановить.',
        code: `async function fetchWithTimeout(url, timeoutMs = 2000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}`,
        notes: [
          'AbortError всё равно надо обработать вызывающему коду.',
          'Не каждое Promise API поддерживает отмену.',
          'finally гарантирует очистку timer.',
        ],
      },
      {
        title: '06 · setImmediate: callback и Promise API',
        goal:
          'Передаём управление check-фазе, не обещая задержку в миллисекундах.',
        code: `import { setImmediate as waitImmediate } from 'node:timers/promises';

setImmediate(() => {
  console.log('check phase callback');
});

await waitImmediate();
console.log('continued in check phase');`,
        notes: [
          'Promise.then текущего callback обычно выполнится раньше.',
          'Это Node API, не браузерный стандарт.',
          'Для разбивки CPU-цикла одного immediate недостаточно — лучше Worker.',
        ],
      },
      {
        title: '07 · BullMQ producer и Worker',
        goal:
          'Producer быстро сохраняет job в Redis, а Worker выполняет processor независимо от HTTP-контроллера.',
        code: `import { Queue, Worker } from 'bullmq';

const connection = { host: '127.0.0.1', port: 6379 };
const queue = new Queue('email', { connection });

await queue.add('welcome', { userId: 42 }, {
  jobId: 'welcome:42',
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: 1000,
  removeOnFail: 5000,
});

const worker = new Worker('email', async job => {
  return sendWelcomeEmail(job.data.userId);
}, { connection, concurrency: 10 });

worker.on('error', error => console.error(error));`,
        notes: [
          'Queue и Worker могут находиться в разных процессах или машинах.',
          'jobId помогает дедупликации постановки, но не заменяет идемпотентность эффекта.',
          'concurrency полезна для I/O; CPU-heavy processor выносите отдельно.',
        ],
      },
      {
        title: '08 · QueueEvents и ожидание конкретного job',
        goal:
          'Различаем локальные Worker events и глобальные события очереди.',
        code: `import { QueueEvents } from 'bullmq';

const queueEvents = new QueueEvents('email', { connection });
await queueEvents.waitUntilReady();

queueEvents.on('completed', ({ jobId, returnvalue }) => {
  console.log(jobId, returnvalue);
});

const job = await queue.add('welcome', { userId: 42 });
const result = await job.waitUntilFinished(queueEvents, 10_000);

await queueEvents.close();`,
        notes: [
          'QueueEvents использует отдельное Redis-соединение.',
          'Timeout ожидания не обязан отменять сам job.',
          'В долгоживущем сервисе QueueEvents обычно создают один раз, а не на каждый job.',
        ],
      },
    ],
    questions: [
      'Почему console.log внутри executor появляется раньше console.log из then?',
      'Что получит следующий then, если предыдущий ничего не вернул?',
      'Чем Promise.allSettled полезнее Promise.all для пакетной обработки независимых файлов?',
      'Почему setImmediate и BullMQ нельзя называть одной и той же очередью?',
      'Как сделать отправку письма безопасной при повторной попытке BullMQ job?',
    ],
  },
};

export const demos = [
  {
    id: 'event-loop-order',
    number: '01',
    title: 'Порядок Event Loop',
    eyebrow: 'Стек → очереди → фазы',
    summary:
      'Сравните sync-код, nextTick, microtasks, timers, poll и check в одном живом запуске.',
    theory:
      'Строки выполняются сверху вниз, но асинхронные вызовы на этих строках только регистрируют callbacks. После освобождения стека Node выбирает работу по очереди и фазе: в контексте этого HTTP-запуска nextTick идёт перед Promise, setTimeout относится к timers, а setImmediate — к check. Для top-level ESM и timer/immediate действуют отдельные контекстные оговорки.',
    watchFor:
      'В запуске из HTTP callback setImmediate может оказаться раньше записанного выше timer. Внутри одного fs.readFile callback setImmediate гарантированно раньше setTimeout(0); в standalone main-модуле последние два могут поменяться местами.',
    expected: [
      'Синхронные сообщения всегда первые.',
      'В этом callback-контексте process.nextTick выполняется раньше Promise/queueMicrotask.',
      'Microtasks выполняются до перехода к следующей фазе.',
      'Порядок строк определяет регистрацию, но не всегда порядок callbacks из разных очередей.',
      'Порядок setTimeout(0) и setImmediate нельзя заучивать без контекста.',
    ],
    code: `console.log('sync'); // Выполняется сейчас

// Эти строки регистрируют callbacks сверху вниз:
process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('Promise'));
setTimeout(() => console.log('timer'), 0);
setImmediate(() => console.log('immediate'));

// Их тела выполнятся позже по правилам очередей и фаз.`,
    learning: learningContent['event-loop-order'],
    run: eventLoopOrder,
  },
  {
    id: 'event-demultiplexer',
    number: '02',
    title: 'Демультиплексор событий',
    eyebrow: 'Много источников → один поток',
    summary:
      'Одновременно запустите таймер, чтение файла и DNS, а затем наблюдайте возврат готовых callbacks.',
    theory:
      'Event demultiplexer — механизм платформы, через который libuv узнаёт, какие I/O-источники готовы. В Linux это обычно epoll, в macOS kqueue, в Windows IOCP. Часть операций, включая обычные файлы и некоторые DNS-вызовы, libuv делегирует своему пулу потоков.',
    watchFor:
      'Регистрация всех операций заканчивается почти мгновенно. Готовность приходит в произвольном порядке, но JavaScript callbacks всё равно входят в главный стек по одному.',
    expected: [
      'Три операции регистрируются без ожидания результата.',
      'JS-поток остаётся свободным между регистрацией и callbacks.',
      'Быстрая операция не обязана ждать медленную.',
      'В успешном запуске Promise.all завершится после всех источников и вернёт результаты в исходном порядке.',
    ],
    code: `const file = fs.promises.readFile('package.json');
const dns = dns.promises.lookup('localhost');
const timer = new Promise(r => setTimeout(r, 180));

await Promise.all([file, dns, timer]);`,
    learning: learningContent['event-demultiplexer'],
    run: eventDemultiplexer,
  },
  {
    id: 'callback-queue',
    number: '03',
    title: 'Очередь callbacks',
    eyebrow: 'Один стек, много готовых задач',
    summary:
      'Пять нулевых таймеров показывают, как один тяжёлый callback задерживает всю очередь.',
    theory:
      'Готовность callback не означает немедленное или параллельное выполнение. Callback ждёт, пока освободится JavaScript-стек. После каждого callback Node также обрабатывает nextTick и microtasks, и только затем берёт следующую задачу фазы.',
    watchFor:
      'Callbacks #2–#5 получили большую latency из-за блокирующего callback #1. Число в trace считается от регистрации таймеров, а не от точного внутреннего момента готовности. nextTick и Promise из #1 выполнятся перед #2.',
    expected: [
      'Все таймеры регистрируются в одном синхронном проходе.',
      'Callback #1 блокирует главный поток примерно на 260 мс.',
      'Остальные callbacks не могут обойти блокировку.',
      'nextTick/microtask имеют приоритет перед следующим timer callback.',
      'Показанная задержка включает timer threshold и ожидание свободного стека.',
    ],
    code: `for (let i = 1; i <= 5; i++) {
  setTimeout(() => {
    if (i === 1) heavyCpuWork(260);
    console.log('timer', i);
  }, 0);
}`,
    learning: learningContent['callback-queue'],
    run: callbackQueue,
  },
  {
    id: 'blocking-vs-worker',
    number: '04',
    title: 'Блокировка vs Worker',
    eyebrow: 'CPU-bound работа',
    summary:
      'Сравните паузу heartbeat при блокировке main thread с вычислением в Worker Thread.',
    theory:
      'Асинхронный Node не делает JavaScript многопоточным автоматически. Длинный синхронный расчёт блокирует HTTP, таймеры и все callbacks процесса. Worker Threads дают отдельный JS-поток и Event Loop для CPU-bound работы, но остаются в том же процессе и конкурируют за его CPU и память.',
    watchFor:
      'В части A между heartbeat появится большой разрыв. В части B Worker занят вычислением, но heartbeat главного потока продолжает приходить.',
    expected: [
      'Синхронный CPU-цикл замораживает Event Loop.',
      'Просроченные таймеры не прерывают выполняющийся JavaScript.',
      'Worker Thread не исполняет расчёт в Event Loop сервера, хотя может конкурировать за CPU.',
      'Сообщение Worker → main само становится асинхронным callback.',
      'Опыт сравнивает отзывчивость, а не обещает ускорение короткой задачи.',
    ],
    code: `// Плохо для main thread:
heavyCpuWork(360);

// CPU-bound работу можно вынести:
const worker = new Worker('./cpu-worker.js');
worker.on('message', result => {
  console.log(result);
});`,
    learning: learningContent['blocking-vs-worker'],
    run: blockingComparison,
  },
  {
    id: 'libuv-thread-pool',
    number: '05',
    title: 'Пул потоков libuv',
    eyebrow: 'Скрытый параллелизм',
    summary:
      'Шесть PBKDF2-задач показывают очередь нативного thread pool и возврат результатов в Event Loop.',
    theory:
      'Некоторые Node API используют общий пул потоков libuv: crypto, zlib, часть fs и DNS. По умолчанию в нём четыре потока, если UV_THREADPOOL_SIZE не задан до старта Node. Это не Worker Threads: JavaScript приложения не исполняется в пуле, там работает нативная операция, а её callback возвращается в Event Loop.',
    watchFor:
      'При стандартном размере пула первые четыре задачи могут завершиться близко друг к другу, а оставшиеся — второй волной. Реальная картина зависит от CPU и нагрузки.',
    expected: [
      'Шесть задач отправляются почти мгновенно.',
      'Главный JS-поток не считает PBKDF2 самостоятельно.',
      'Размер пула ограничивает число одновременно обслуживаемых jobs, но не гарантирует столько же физических CPU-ядер.',
      'Callbacks результатов снова выполняются в основном Event Loop.',
    ],
    code: `for (let i = 0; i < 6; i++) {
  crypto.pbkdf2('secret', 'salt', 120_000, 32, 'sha256',
    () => console.log('ready', i)
  );
}`,
    learning: learningContent['libuv-thread-pool'],
    run: libuvThreadPool,
  },
  {
    id: 'memory-leak',
    number: '06',
    title: 'Утечка памяти',
    eyebrow: 'Retained references → рост RSS',
    summary:
      'Управляемая утечка в изолированном процессе: наблюдайте heap, external и RSS, затем освободите ссылки и запустите GC.',
    theory:
      'Память утекает, когда приложение продолжает хранить ссылки на уже ненужные объекты. Сборщик мусора видит такие объекты достижимыми и не имеет права удалить их. Buffer преимущественно растит external, массивы — V8 heap, а RSS показывает общую резидентную память процесса.',
    watchFor:
      'Пока блоки лежат в глобальном массиве, даже ручной GC не уменьшает retained memory. После «Освободить ссылки» объекты становятся кандидатами на удаление; затем сравните показатели после GC.',
    expected: [
      'Эксперимент ничего не выделяет до ручного запуска.',
      'Retained и одна из метрик heapUsed/external растут ступенями.',
      'Пауза прекращает рост, но не освобождает удерживаемые объекты.',
      'Release удаляет ссылки, а GC получает возможность очистить память.',
      'Retained является оценкой блоков; heap, external и RSS описывают память с разных сторон.',
      'Прикладные лимиты автоматически ставят рост на паузу, а Docker дополнительно задаёт hard limit 2 GB всему контейнеру.',
    ],
    code: `let leakedBlocks = [];

setInterval(() => {
  // Ссылка остаётся достижимой из global scope:
  leakedBlocks.push(Buffer.alloc(4 * 1024 * 1024));
  console.log(process.memoryUsage());
}, 500);

// Сначала удаляем ссылки:
leakedBlocks = [];
// Только теперь GC может освободить объекты.`,
    learning: learningContent['memory-leak'],
    interactive: 'memory',
  },
  {
    id: 'promises-immediate-bullmq',
    number: '07',
    title: 'Promises, setImmediate и BullMQ',
    eyebrow: 'Microtasks → check → Redis jobs',
    summary:
      'Закрепите Promise-цепочки, async/await, комбинаторы и setImmediate, затем проследите реальный lifecycle BullMQ job через Redis.',
    theory:
      'Promise представляет один будущий outcome внутри JavaScript-процесса: executor запускается синхронно, а then/catch/finally продолжают цепочку через microtasks. setImmediate переносит callback в check-фазу Node. BullMQ работает уровнем выше: producer сохраняет job в Redis, а один из Workers обрабатывает его независимо от исходного HTTP-запроса.',
    watchFor:
      'Сначала executor печатает синхронные события, затем идут Promise microtasks и setImmediate. Promise.all возвращает результаты во входном порядке, а не по скорости. В Docker-режиме Queue.add запишет настоящий job в Redis, Worker переведёт его в active/completed, и QueueEvents вернёт результат.',
    expected: [
      'Executor Promise выполняется до освобождения текущего стека.',
      'Каждый then создаёт новый Promise и получает return предыдущего звена.',
      'catch может восстановить цепочку обычным значением, а finally не подменяет его без throw/rejection.',
      'Promise.all сохраняет входной порядок, allSettled показывает оба статуса.',
      'setImmediate и await timers/promises продолжаются в check-фазе.',
      'BullMQ job существует в Redis отдельно от Promise, возвращённого HTTP-контроллеру.',
      'Без REDIS_URL BullMQ-часть явно пропускается, но остальные примеры остаются запускаемыми.',
    ],
    code: `import { setImmediate as waitImmediate } from 'node:timers/promises';
import { Queue, QueueEvents, Worker } from 'bullmq';

const value = await Promise.resolve(2)
  .then(number => number * 3)
  .then(async number => {
    await waitImmediate(); // check phase
    return number + 1;
  })
  .catch(error => {
    console.error(error);
    return 0;
  })
  .finally(() => console.log('cleanup'));

const connection = { host: 'redis', port: 6379 };
const queue = new Queue('examples', { connection });
const events = new QueueEvents('examples', { connection });
const worker = new Worker('examples', async job => {
  return { doubled: job.data.value * 2 };
}, { connection });

await events.waitUntilReady();
const job = await queue.add('double', { value });
console.log(await job.waitUntilFinished(events, 5000));`,
    learning: learningContent['promises-immediate-bullmq'],
    run: promisesImmediateBullMq,
  },
];

export function publicDemo(demo) {
  const { run, ...metadata } = demo;
  return metadata;
}
