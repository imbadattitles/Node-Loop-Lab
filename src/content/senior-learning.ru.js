export const seniorLearningRu = {
  'runtime-models': {
    plain:
      'Node похож не на «одного медленного работника», а на диспетчера, который не стоит рядом с каждым ожидающим заказом. Пока база данных, сеть или диск выполняют работу, главный JavaScript-поток может обслуживать другие готовые события. Это экономит потоки именно на ожидании I/O, но не превращает тяжёлый JavaScript в параллельный.',
    foundation:
      'Один Node-процесс содержит V8 isolate с главным JavaScript Event Loop, служебные потоки V8 и возможности libuv. Сокеты обычно наблюдаются механизмами готовности ОС, часть fs/crypto/DNS выполняется в ограниченном libuv pool, а CPU-bound JavaScript можно вынести в Worker Threads или процессы. Поэтому фраза «Node однопоточный» описывает выполнение JavaScript в одном isolate, а не весь процесс.',
    why:
      'На senior-собеседовании важно не объявить один runtime победителем, а связать модель конкурентности с workload: временем ожидания I/O, CPU-стоимостью, памятью на конкурентную задачу, моделью отказов и удобством профилирования.',
    terms: [
      {
        name: 'Concurrency',
        description:
          'Несколько задач находятся в работе и продвигаются с перекрытием по времени; это ещё не означает одновременное выполнение инструкций.',
      },
      {
        name: 'Parallelism',
        description:
          'Инструкции действительно выполняются одновременно на нескольких ядрах или аппаратных потоках.',
      },
      {
        name: 'I/O-bound',
        description:
          'Нагрузка, где большая часть времени уходит на ожидание сети, диска, базы данных или другого внешнего ресурса.',
      },
      {
        name: 'CPU-bound',
        description:
          'Нагрузка, ограниченная вычислениями: сериализацией, компрессией, изображениями, криптографией или большими циклами.',
      },
      {
        name: 'V8 isolate',
        description:
          'Изолированная среда V8 со своим heap и JavaScript execution state. Worker Thread создаёт отдельный isolate.',
      },
      {
        name: 'Throughput',
        description:
          'Количество успешно обработанных операций за единицу времени; не то же самое, что latency одного запроса.',
      },
    ],
    steps: [
      {
        title: 'Классифицируйте работу',
        description:
          'Отделите короткий JavaScript от сетевого ожидания, нативной операции и тяжёлого CPU-кода.',
      },
      {
        title: 'Node регистрирует I/O',
        description:
          'Главный поток передаёт ожидание ОС/libuv и возвращается к готовым callbacks.',
      },
      {
        title: 'Готовность возвращает continuation',
        description:
          'Когда операция готова, callback или Promise continuation ждёт свободного JavaScript-стека.',
      },
      {
        title: 'CPU меняет картину',
        description:
          'Долгий синхронный JavaScript занимает isolate и задерживает все его соединения.',
      },
      {
        title: 'Выбирается граница параллелизма',
        description:
          'Worker Threads подходят для CPU и общей памяти, процессы — для изоляции, очередь jobs — для распределённой работы.',
      },
      {
        title: 'Модель проверяется метриками',
        description:
          'Сравнивайте throughput, p95/p99 latency, Event Loop delay, CPU, память и поведение под перегрузкой.',
      },
    ],
    nuances: [
      {
        title: 'Java — не только тяжёлый thread-per-request',
        description:
          'Java поддерживает platform threads, неблокирующий NIO/reactive-подход и virtual threads. Virtual thread при blocking I/O может освободить carrier OS thread; это масштабирует привычный синхронный стиль, но не ускоряет CPU-задачу.',
      },
      {
        title: 'Go — не «по ОС-потоку на goroutine»',
        description:
          'Лёгкие goroutines мультиплексируются scheduler-ом Go на набор OS threads. Параллелизм регулируется runtime и доступными ядрами, а блокирующие операции интегрируются с scheduler-ом.',
      },
      {
        title: 'Python зависит от реализации и сборки',
        description:
          'asyncio также использует Event Loop для I/O. Обычная CPython-сборка сериализует большую часть Python bytecode через GIL, но multiprocessing, native extensions и опциональная free-threaded сборка меняют границы параллелизма.',
      },
      {
        title: 'Node эффективен не для всего',
        description:
          'Много ожидающих сокетов — сильный сценарий. Большая синхронная JSON-сериализация или расчёт на каждом запросе может превратить один isolate в bottleneck.',
      },
      {
        title: 'Архитектура важнее языка в вакууме',
        description:
          'Connection pool, backpressure, алгоритм, batching, кэш, число процессов и лимиты часто сильнее влияют на результат, чем название runtime.',
      },
    ],
    pitfalls: [
      {
        myth: 'Node.js полностью однопоточный.',
        fact: 'Обычно один поток исполняет JavaScript конкретного isolate, но процесс использует служебные потоки, libuv pool и при необходимости Worker Threads.',
      },
      {
        myth: 'Асинхронность автоматически использует все CPU-ядра.',
        fact: 'Она позволяет не блокировать поток ожиданием. CPU-параллелизм требует нескольких isolates/процессов или нативного параллельного API.',
      },
      {
        myth: 'Java всегда создаёт дорогой OS thread на запрос.',
        fact: 'Это лишь одна модель. Есть NIO, reactive frameworks и virtual threads, которые мультиплексируются JVM.',
      },
      {
        myth: 'У Python всегда и при любых условиях нет параллельных threads.',
        fact: 'Это слишком широкое утверждение: важны CPython/GIL, free-threaded build, native code и выбранная модель multiprocessing/asyncio.',
      },
      {
        myth: 'Высокий throughput означает низкую latency.',
        fact: 'Система может обрабатывать много запросов в секунду и одновременно иметь плохие хвостовые p95/p99 задержки.',
      },
    ],
    codeIntro:
      'Сценарий сначала регистрирует множество ожиданий на одном Event Loop, а затем намеренно выполняет CPU-цикл. Первая часть показывает дешёвую concurrency, вторая — цену одного занятого JavaScript isolate.',
    codeNotes: [
      '`Promise.all` не создаёт потоки: таймеры уже зарегистрированы при создании Promises.',
      'Двадцать четыре ожидания не требуют двадцати четырёх JavaScript-потоков.',
      'Синхронный CPU-цикл задерживает даже таймер, deadline которого уже наступил.',
      'Для честного benchmark нужны одинаковая логика, прогрев, профиль нагрузки и percentile latency.',
    ],
    questions: [
      'Почему десять тысяч открытых сокетов и десять тысяч активных CPU-расчётов — принципиально разные нагрузки?',
      'Когда вы выберете Worker Thread, а когда отдельный процесс или BullMQ Worker?',
      'Какие метрики нужны, чтобы доказать преимущество модели, а не повторить рекламный тезис?',
    ],
  },
  'memory-diagnostics': {
    plain:
      'Замыкание — это функция с доступом к переменным места создания. Само по себе оно полезно и безопасно. Утечка появляется, когда долгоживущая ссылка на функцию случайно продлевает жизнь крупному payload. Heap snapshot позволяет пройти обратный путь: от объекта через retaining edges к GC root.',
    foundation:
      'V8 управляет JavaScript heap и начинает обход с GC roots: globals, активных стеков, closures и внутренних handles. Недостижимые объекты можно собрать; достижимые считаются живыми независимо от бизнес-смысла. Generational GC оптимизирует предположение, что большинство молодых объектов быстро умирает, а пережившие сборки продвигаются в старшее поколение.',
    why:
      'В production медленная утечка может неделями выглядеть как обычный кэш. Затем растут частота GC, pause time и RSS, контейнер получает OOMKill, а рестарт лишь временно скрывает причину. Нужны воспроизводимый workload, временной ряд и доказанный retainer path.',
    terms: [
      {
        name: 'Closure',
        description:
          'Функция вместе с доступом к lexical environment, в котором она была создана.',
      },
      {
        name: 'Shallow size',
        description:
          'Память самого объекта без всех объектов, доступных через его ссылки.',
      },
      {
        name: 'Retained size',
        description:
          'Оценка памяти, которая может стать недостижимой при удалении конкретного объекта и его удерживающих путей.',
      },
      {
        name: 'Retainer',
        description:
          'Объект или связь, из-за которой исследуемый объект остаётся достижимым от GC root.',
      },
      {
        name: 'Dominator',
        description:
          'Узел, через который проходят пути от GC roots к группе объектов; полезен для поиска владельца большого retained subtree.',
      },
      {
        name: 'Heap snapshot',
        description:
          'Сериализованный граф объектов одного V8 isolate и связей между ними в определённый момент.',
      },
    ],
    steps: [
      {
        title: 'Зафиксируйте симптом',
        description:
          'Ищите устойчивый рост heap/RSS после одинаковых циклов нагрузки, а не один случайный пик.',
      },
      {
        title: 'Сделайте baseline',
        description:
          'После прогрева и стабилизации нагрузки создайте первый snapshot безопасной реплики.',
      },
      {
        title: 'Воспроизведите рост',
        description:
          'Повторите одну операцию контролируемое число раз и дождитесь завершения временных задач.',
      },
      {
        title: 'Создайте второй snapshot',
        description:
          'Сравните количество объектов, shallow/retained size и constructor/group deltas.',
      },
      {
        title: 'Пройдите retaining path',
        description:
          'Найдите цепочку от выросших объектов до массива closures, глобального Map, listener или другого root.',
      },
      {
        title: 'Исправьте владение и перепроверьте',
        description:
          'Добавьте cleanup, TTL/LRU/size bound или удаление listener; затем повторите тот же workload и сравнение.',
      },
    ],
    nuances: [
      {
        title: 'Closure не копирует весь scope по простому правилу',
        description:
          'Думайте о доступном lexical environment, а не о буквальной полной копии каждой локальной переменной. В snapshot важна фактическая retaining edge текущей версии V8.',
      },
      {
        title: 'Snapshot принадлежит одному isolate',
        description:
          'Снимок основного Next.js-процесса не покажет heap дочерней memory-lab или Worker Thread. Поэтому кнопка запускает writeHeapSnapshot внутри child.',
      },
      {
        title: 'Buffer виден не так, как Array',
        description:
          'Heap snapshot показывает JS-обёртки и связи, но основная backing memory Buffer учитывается как external. Для неё сопоставляйте snapshot с external, arrayBuffers и RSS.',
      },
      {
        title: 'Снимок сам опасен',
        description:
          'Сериализация синхронно блокирует Event Loop снимаемого процесса и может потребовать около двух размеров heap. Делайте это на реплике, с лимитом памяти и планом на возможный restart.',
      },
      {
        title: 'Падение RSS не обязательно немедленно',
        description:
          'После удаления ссылок GC освобождает объекты для allocator, но тот может сохранить страницы для повторного использования. Проверяйте новый plateau и heap trend.',
      },
    ],
    pitfalls: [
      {
        myth: 'Любое замыкание является утечкой.',
        fact: 'Замыкание становится проблемой только когда ненужный payload остаётся достижимым дольше требуемого lifetime.',
      },
      {
        myth: 'Большой shallow size всегда указывает виновника.',
        fact: 'Небольшой Map или closure может доминировать над огромным подграфом и иметь большой retained size.',
      },
      {
        myth: 'Один snapshot доказывает утечку.',
        fact: 'Он показывает состояние. Причину обычно находят сравнением снимков под повторяемой нагрузкой и retaining paths.',
      },
      {
        myth: 'Вызов global.gc() лечит production leak.',
        fact: 'GC не удаляет достижимые объекты. Ручной вызов полезен лабораторно, но не исправляет ошибку владения.',
      },
      {
        myth: 'Неограниченный кэш — не утечка, потому что данные полезны.',
        fact: 'Если lifetime и верхняя граница не определены, кэш способен исчерпать память так же, как случайно удерживаемый массив.',
      },
    ],
    codeIntro:
      'В режиме Closure массив хранит функции, а каждая функция удерживает свой payload через lexical environment. В режиме Global Map cache долгоживущий Map растёт без TTL и size bound. Release удаляет обе root-ссылки.',
    codeNotes: [
      '`createRetainingClosure` завершилась, но сохранённая функция продолжает видеть `payload`.',
      'Ключи глобального Map никогда не удаляются до нажатия Release.',
      '`writeHeapSnapshot` вызывается в дочернем процессе и ставит allocation на паузу.',
      'Скачанный файл открывается в Chrome DevTools: Memory → Load.',
      'Сравнивайте Summary/Comparison, затем проверяйте Retainers и dominator tree.',
    ],
    questions: [
      'Какая именно ссылка соединяет payload с GC root в режиме Closure?',
      'Почему snapshot главного серверного процесса не диагностирует child?',
      'Чем TTL, LRU и жёсткий max size защищают кэш по-разному?',
      'Почему heapUsed может упасть, а RSS остаться выше исходного?',
    ],
  },
  'production-observability': {
    plain:
      'Метрика — это регулярно измеряемое число с метками и временем. Приложение публикует текущие значения, Prometheus периодически их забирает и хранит как временные ряды, а Grafana строит панели и помогает увидеть тренд. Ни Grafana, ни Prometheus сами по себе не исправляют утечку.',
    foundation:
      'Лаборатория отдаёт Prometheus text exposition на `/api/metrics`: память главного процесса и memory child, Event Loop utilization/delay, активные запуски и ошибки. В optional Docker Compose Prometheus scrape-ит endpoint каждые пять секунд, а Grafana автоматически получает datasource и готовый dashboard.',
    why:
      'Heap snapshot отвечает «что удерживает память сейчас», а мониторинг — «когда начался рост, при какой нагрузке и исчез ли он после релиза». Production-диагностика требует обоих уровней вместе с логами и traces.',
    terms: [
      {
        name: 'Metric',
        description:
          'Числовое измерение во времени; gauge меняется в обе стороны, counter обычно только растёт.',
      },
      {
        name: 'Time series',
        description:
          'Последовательность samples одного metric name и уникального набора labels.',
      },
      {
        name: 'Scrape',
        description:
          'HTTP-запрос Prometheus к metrics endpoint для получения текущих samples.',
      },
      {
        name: 'Cardinality',
        description:
          'Число уникальных label combinations. userId/requestId в labels способны взорвать стоимость хранения.',
      },
      {
        name: 'SLI',
        description:
          'Измеримый показатель качества сервиса, например доля успешных запросов или latency.',
      },
      {
        name: 'Alert',
        description:
          'Правило над временным рядом, которое срабатывает при устойчивом условии, а не обязательно на одиночном sample.',
      },
    ],
    steps: [
      {
        title: 'Приложение измеряет',
        description:
          'process.memoryUsage и perf_hooks дают runtime signals, а бизнес-код увеличивает counters.',
      },
      {
        title: 'Endpoint публикует',
        description:
          '`/api/metrics` возвращает HELP/TYPE и samples в Prometheus text format.',
      },
      {
        title: 'Prometheus scrape-ит',
        description:
          'Через равные интервалы он сохраняет значения с timestamp в локальную TSDB.',
      },
      {
        title: 'PromQL вычисляет',
        description:
          'rate(counter[window]), max_over_time и сравнения превращают samples в диагностические сигналы.',
      },
      {
        title: 'Grafana визуализирует',
        description:
          'Provisioned dashboard показывает память main/child, Event Loop delay, ELU и частоту запусков.',
      },
      {
        title: 'Alert ведёт к расследованию',
        description:
          'Устойчивый рост открывает runbook: workload, logs, snapshot безопасной реплики, retainer path, исправление.',
      },
    ],
    nuances: [
      {
        title: 'Heap slope важнее одного числа',
        description:
          'Высокий стабильный heap может быть нормой; подозрителен новый растущий baseline после сопоставимых циклов нагрузки и GC.',
      },
      {
        title: 'Event Loop delay и CPU не взаимозаменяемы',
        description:
          'Высокий delay может дать синхронный I/O или пауза GC, а CPU процесса включает работу вне главного Event Loop. Коррелируйте сигналы.',
      },
      {
        title: 'Counter читают через rate/increase',
        description:
          'Абсолютное число запусков растёт с uptime. Для текущей интенсивности используйте rate на окне; restart counter учитывается Prometheus.',
      },
      {
        title: 'Labels должны быть ограниченными',
        description:
          'mode или outcome имеют малую cardinality. URL с id, email, stack trace и requestId оставляйте логам/traces.',
      },
      {
        title: 'Локальный dashboard — не вся production-система',
        description:
          'Для реального сервиса добавьте HTTP RED metrics, DB/queue pool saturation, cgroup memory, restarts/OOMKill, alert routing и retention policy.',
      },
    ],
    pitfalls: [
      {
        myth: 'Grafana собирает метрики приложения.',
        fact: 'В этой схеме приложение публикует, Prometheus собирает и хранит, Grafana запрашивает и визуализирует.',
      },
      {
        myth: 'Alert должен сработать при первом высоком sample.',
        fact: 'Одиночный spike часто нормален; обычно задают окно, порог, duration и runbook.',
      },
      {
        myth: 'RSS можно сложить с heapUsed и external.',
        fact: 'RSS уже является общей резидентной картиной, а компоненты частично перекрываются.',
      },
      {
        myth: 'В label полезно положить как можно больше контекста.',
        fact: 'Неограниченные значения создают новые time series и могут перегрузить monitoring раньше приложения.',
      },
      {
        myth: 'Красивый dashboard доказывает отсутствие утечки.',
        fact: 'Он помогает заметить симптом. Причину подтверждают контролируемой нагрузкой, profiles/snapshots и retainer path.',
      },
    ],
    codeIntro:
      'Сценарий локально измеряет Event Loop delay и ELU вокруг контролируемой блокировки. Полная server-реализация рядом формирует `/api/metrics`, который optional Prometheus/Grafana stack наблюдает постоянно.',
    codeNotes: [
      '`monitorEventLoopDelay` возвращает значения в наносекундах; endpoint переводит их в секунды для Prometheus.',
      'ELU измеряет занятость Event Loop, а не общий процент CPU машины.',
      'Prometheus counters не уменьшаются внутри жизни процесса.',
      'Memory child metrics равны нулю, пока лаборатория не запущена.',
      'Все monitoring-порты по умолчанию опубликованы только на 127.0.0.1.',
    ],
    questions: [
      'Как отличить полезно выросший bounded cache от memory leak по временным рядам?',
      'Почему requestId нельзя использовать как Prometheus label?',
      'Какой runbook должен открываться при росте heap и Event Loop delay?',
      'Каких HTTP-метрик пока не хватает этой учебной лаборатории для настоящего SLO?',
    ],
  },
};
