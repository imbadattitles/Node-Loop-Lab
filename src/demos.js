import { pbkdf2 } from 'node:crypto';
import { readFile } from 'node:fs';
import { lookup } from 'node:dns';
import { performance } from 'node:perf_hooks';
import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';

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

  // Ждём обе макрозадачи: порядок timer/immediate снаружи I/O не гарантирован.
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
    const worker = new Worker(workerPath, {
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

const learningContent = {
  'event-loop-order': {
    plain:
      'Представьте одного повара и несколько полок с заказами разного приоритета. Повар не готовит два блюда одновременно: он заканчивает текущее действие, затем сначала проверяет полку nextTick, потом microtasks и только после этого переходит между полками timers, poll и check.',
    foundation:
      'JavaScript-код одного Node-процесса обычно исполняется в одном главном потоке по правилу run-to-completion: начатая функция не прерывается другим callback. Event Loop нужен не для параллельного выполнения JavaScript, а для выбора следующего callback, когда текущий стек освободился.',
    why:
      'Порядок очередей определяет, когда отправится HTTP-ответ, сработает таймер или продолжится Promise. Ошибка в ментальной модели приводит к гонкам, starvation и неожиданным задержкам.',
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
    ],
    steps: [
      {
        title: 'Выполняется sync-код',
        description:
          'console.log и регистрация callbacks происходят в текущем стеке.',
      },
      {
        title: 'Стек освобождается',
        description:
          'Node получает возможность выбрать отложенную работу.',
      },
      {
        title: 'Очистка nextTick',
        description:
          'process.nextTick имеет специальную очередь Node и высокий приоритет.',
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
    ],
    codeIntro:
      'Этот фрагмент регистрирует работу в четырёх разных механизмах. Смотрите не только на порядок строк, но и на то, в какую очередь попадает каждая функция.',
    codeNotes: [
      '`console.log` выполняется прямо сейчас в call stack.',
      '`process.nextTick` использует специальную очередь Node.',
      '`Promise.then` становится microtask.',
      '`setTimeout` и `setImmediate` относятся к разным фазам.',
    ],
    questions: [
      'Почему Promise не выполняется в момент вызова Promise.resolve()?',
      'Что произойдёт с таймером, если текущая функция работает пять секунд?',
    ],
  },
  'event-demultiplexer': {
    plain:
      'Это похоже на диспетчера в гостинице. Он не стоит у каждой двери и не спрашивает каждую секунду, готов ли номер. Службы сообщают диспетчеру о готовности, а тот передаёт уведомления одному администратору — JavaScript-потоку.',
    foundation:
      'Node регистрирует I/O-интерес в libuv и возвращает управление приложению. Для сокетов libuv использует механизмы готовности ОС, а операции, которые нельзя удобно наблюдать таким способом, может передать нативному thread pool. Готовые события собираются и превращаются в callbacks.',
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
    ],
    codeIntro:
      'Три Promise здесь лишь представляют три независимо запущенных источника. Promise.all не запускает операции последовательно — он только ждёт их общий результат.',
    codeNotes: [
      '`readFile` и `lookup` делегируются Node/libuv.',
      '`setTimeout` регистрирует дедлайн, а не блокирует поток.',
      '`Promise.all` сохраняет порядок результатов, даже если готовность пришла в другом порядке.',
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
      'Очередь хранит готовую работу, но не исполняет её. Исполнителем остаётся JavaScript call stack. После каждого callback Node также даёт приоритет nextTick и microtasks, поэтому разные категории работы могут вклиниваться между соседними timer callbacks.',
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
          'Разница между временем, когда callback мог быть готов, и фактическим началом выполнения.',
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
    ],
    codeIntro:
      'Первый callback намеренно выполняет тяжёлую синхронную функцию. Остальные четыре таймера не могут обойти его, хотя их delay тоже равен нулю.',
    codeNotes: [
      'Цикл регистрирует callbacks, но не выполняет их.',
      '`heavyCpuWork` занимает текущий стек.',
      'Лог следующего timer появится только после возврата из тяжёлой функции.',
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
      'Event Loop хорошо масштабирует ожидание I/O, но не ускоряет CPU-bound JavaScript. Синхронный расчёт занимает main thread. Worker Thread создаёт отдельный V8 isolate, отдельный call stack и Event Loop; данные передаются сообщениями или через SharedArrayBuffer.',
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
    ],
    codeIntro:
      'Первая строка блокирует main. Во второй части Worker выполняет отдельный файл, а main подписывается на сообщение результата и остаётся доступным.',
    codeNotes: [
      'Worker не является callback в том же потоке — это отдельная JS-среда.',
      'Событие `message` уже обрабатывается главным Event Loop.',
      'Ошибки и завершение Worker нужно обрабатывать отдельно.',
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
      'Thread pool libuv выполняет определённые нативные операции, для которых нет удобной неблокирующей готовности ОС или которые вычислительно дороги. JavaScript не исполняется внутри этого пула. После завершения нативной функции libuv возвращает callback в Event Loop.',
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
    ],
    codeIntro:
      'Все шесть native jobs создаются синхронно. Асинхронная форма pbkdf2 передаёт вычисление пулу, а callback фиксирует момент возврата результата.',
    codeNotes: [
      'Количество вызовов может быть больше размера пула.',
      'Очередь пула находится не в JavaScript-коде примера.',
      'Порядок завершения задач не обязан совпадать с порядком запуска.',
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
      'GC начинает обход от корней: global-объектов, текущих стеков, активных замыканий и внутренних handles. Всё достижимое считается живым. Утечка — это не «GC сломан», а ситуация, когда программа по ошибке сохраняет путь от корня к уже ненужным данным.',
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
          'Express создаёт отдельный дочерний Node-процесс с жёсткими лимитами.',
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
    ],
    codeIntro:
      'Критическая строка — push в массив, живущий дольше отдельных операций. Пока массив достижим из global scope, все добавленные Buffer также достижимы.',
    codeNotes: [
      '`Buffer.alloc` увеличивает прежде всего external/arrayBuffers.',
      '`leakedBlocks.push` создаёт долгоживущую удерживающую ссылку.',
      'Присваивание `[]` разрывает ссылки, но не обещает немедленное уменьшение RSS.',
      'Ручной GC нужен только для наблюдения; production-код не должен лечить им утечки.',
    ],
    questions: [
      'Почему GC до очистки массива не уменьшает retained?',
      'Почему RSS способен остаться высоким даже после успешной очистки?',
      'Какая метрика лучше покажет утечку Buffer?',
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
      'Event Loop — это не одна очередь. После текущего JavaScript-стека Node сначала опустошает очередь process.nextTick, затем очередь microtasks. setTimeout относится к timers, setImmediate — к check. Их порядок зависит от контекста регистрации.',
    watchFor:
      'В первом раунде timer и immediate могут соревноваться. Внутри fs.readFile setImmediate обычно оказывается раньше setTimeout(0).',
    expected: [
      'Синхронные сообщения всегда первые.',
      'process.nextTick выполняется раньше Promise/queueMicrotask.',
      'Microtasks выполняются до перехода к следующей фазе.',
      'Порядок setTimeout(0) и setImmediate нельзя заучивать без контекста.',
    ],
    code: `console.log('sync');

process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('Promise'));
setTimeout(() => console.log('timer'), 0);
setImmediate(() => console.log('immediate'));`,
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
      'Promise.all завершится только после всех источников.',
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
      'Callbacks #2–#5 были готовы почти сразу, но получили большую задержку из-за блокирующего callback #1. nextTick и Promise из #1 выполнятся перед #2.',
    expected: [
      'Все таймеры регистрируются в одном синхронном проходе.',
      'Callback #1 блокирует главный поток примерно на 260 мс.',
      'Остальные callbacks не могут обойти блокировку.',
      'nextTick/microtask имеют приоритет перед следующим timer callback.',
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
      'Асинхронный Node не делает JavaScript многопоточным автоматически. Длинный синхронный расчёт блокирует HTTP, таймеры и все callbacks процесса. Worker Threads дают отдельный JS-поток и отдельный Event Loop для CPU-bound работы.',
    watchFor:
      'В части A между heartbeat появится большой разрыв. В части B Worker занят вычислением, но heartbeat главного потока продолжает приходить.',
    expected: [
      'Синхронный CPU-цикл замораживает Event Loop.',
      'Просроченные таймеры не прерывают выполняющийся JavaScript.',
      'Worker Thread не блокирует Event Loop сервера.',
      'Сообщение Worker → main само становится асинхронным callback.',
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
      'Некоторые Node API используют пул потоков libuv: crypto, zlib, часть fs и DNS. По умолчанию размер пула обычно равен четырём. Это не Worker Threads: JavaScript не исполняется в пуле, там работает нативная операция, а её callback возвращается в Event Loop.',
    watchFor:
      'При стандартном размере пула первые четыре задачи могут завершиться близко друг к другу, а оставшиеся — второй волной. Реальная картина зависит от CPU и нагрузки.',
    expected: [
      'Шесть задач отправляются почти мгновенно.',
      'Главный JS-поток не считает PBKDF2 самостоятельно.',
      'Размер пула ограничивает число параллельных нативных задач.',
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
      'Изолированный процесс автоматически ограничен и может быть остановлен целиком.',
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
];

export function publicDemo(demo) {
  const { run, ...metadata } = demo;
  return metadata;
}
