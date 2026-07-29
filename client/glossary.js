const baseTerms = [
  {
    id: 'io',
    aliases: ['io', 'i/o', 'input output', 'ввод вывод', 'ввод-вывод'],
    related: ['synchronous', 'asynchronous', 'io-bound', 'non-blocking'],
    ru: {
      term: 'I/O',
      expansion: 'Input/Output · ввод-вывод',
      category: 'ОСНОВЫ',
      definition:
        'Обмен программы с внешним миром: чтение файла, запрос к базе, сетевой ответ, ввод с клавиатуры или запись в stdout.',
      context:
        'Node особенно эффективен, когда приложение много ждёт I/O. Пока ОС, сеть или диск выполняют операцию, главный JavaScript-поток может заниматься другой работой.',
      example: 'fs.readFile(), fetch(), socket.write(), process.stdin',
    },
    en: {
      term: 'I/O',
      expansion: 'Input/Output',
      category: 'FOUNDATIONS',
      definition:
        'Data exchange between a program and the outside world: reading a file, querying a database, receiving network data, keyboard input, or writing to stdout.',
      context:
        'Node is especially effective when an application spends time waiting for I/O. While the OS, network, or disk performs an operation, the main JavaScript thread can handle other work.',
      example: 'fs.readFile(), fetch(), socket.write(), process.stdin',
    },
  },
  {
    id: 'api',
    aliases: ['api', 'application programming interface', 'апи', 'интерфейс программирования'],
    related: ['runtime', 'http', 'io'],
    ru: {
      term: 'API',
      expansion: 'Application Programming Interface · программный интерфейс',
      category: 'ОСНОВЫ',
      definition:
        'Набор правил и доступных операций, через которые один код обращается к другому коду или сервису.',
      context:
        'В лаборатории есть Node API вроде fs и crypto, а также HTTP API сервера: например GET /api/health.',
      example: 'fs.readFile(path, callback) · GET /api/demos',
    },
    en: {
      term: 'API',
      expansion: 'Application Programming Interface',
      category: 'FOUNDATIONS',
      definition:
        'A defined set of operations and rules through which one piece of software talks to another.',
      context:
        'The lab uses Node APIs such as fs and crypto, plus its own HTTP server API, for example GET /api/health.',
      example: 'fs.readFile(path, callback) · GET /api/demos',
    },
  },
  {
    id: 'runtime',
    aliases: ['runtime', 'run time', 'среда выполнения', 'рантайм'],
    related: ['nodejs', 'v8', 'operating-system'],
    ru: {
      term: 'Runtime',
      expansion: 'Среда выполнения',
      category: 'ОСНОВЫ',
      definition:
        'Программа и инфраструктура, которые исполняют ваш код и предоставляют ему встроенные возможности.',
      context:
        'Node.js runtime объединяет V8, JavaScript API, libuv и нативные модули. Это больше, чем один движок JavaScript.',
      example: 'Node.js запускает файл: node src/server.js',
    },
    en: {
      term: 'Runtime',
      expansion: 'Execution environment',
      category: 'FOUNDATIONS',
      definition:
        'The program and supporting infrastructure that execute your code and provide built-in capabilities.',
      context:
        'The Node.js runtime combines V8, JavaScript APIs, libuv, and native modules. It is more than a JavaScript engine.',
      example: 'Node.js runs a file: node src/server.js',
    },
  },
  {
    id: 'nodejs',
    aliases: ['node', 'nodejs', 'node.js', 'нода'],
    related: ['runtime', 'v8', 'io'],
    ru: {
      term: 'Node.js',
      expansion: 'JavaScript runtime вне браузера',
      category: 'ОСНОВЫ',
      definition:
        'Среда выполнения JavaScript, ориентированная на серверы, инструменты командной строки, сетевые приложения и автоматизацию.',
      context:
        'Node предоставляет файловую систему, сеть, процессы, Workers и Event Loop — возможностей, которых нет у обычного JavaScript как языка.',
      example: 'node --version · node app.js',
    },
    en: {
      term: 'Node.js',
      expansion: 'JavaScript runtime outside the browser',
      category: 'FOUNDATIONS',
      definition:
        'A JavaScript runtime used for servers, command-line tools, network applications, and automation.',
      context:
        'Node provides file-system, networking, process, Worker, and Event Loop facilities that are not part of the JavaScript language itself.',
      example: 'node --version · node app.js',
    },
  },
  {
    id: 'v8',
    aliases: ['v8', 'javascript engine', 'js engine', 'движок javascript'],
    related: ['nodejs', 'runtime', 'gc'],
    ru: {
      term: 'V8',
      expansion: 'JavaScript-движок',
      category: 'RUNTIME',
      definition:
        'Движок, который разбирает и исполняет JavaScript, компилирует его в машинный код и управляет JavaScript-кучей.',
      context:
        'Node использует V8 для вашего JS, но Event Loop, файловые и сетевые операции предоставляет не V8, а Node и libuv.',
      example: 'Promise и JavaScript heap связаны с V8',
    },
    en: {
      term: 'V8',
      expansion: 'JavaScript engine',
      category: 'RUNTIME',
      definition:
        'The engine that parses and executes JavaScript, compiles it to machine code, and manages the JavaScript heap.',
      context:
        'Node uses V8 for your JavaScript, while the Event Loop, file system, and networking facilities come from Node and libuv.',
      example: 'Promises and the JavaScript heap are tied to V8',
    },
  },
  {
    id: 'operating-system',
    aliases: ['os', 'operating system', 'операционная система', 'ос'],
    related: ['kernel', 'io', 'process'],
    ru: {
      term: 'OS',
      expansion: 'Operating System · операционная система',
      category: 'СИСТЕМА',
      definition:
        'Системное ПО, которое управляет процессами, памятью, файлами, сетью и доступом программ к оборудованию.',
      context:
        'Node делегирует ОС ожидание многих сетевых событий. Linux, macOS и Windows используют разные механизмы, скрытые за libuv.',
      example: 'Linux · macOS · Windows',
    },
    en: {
      term: 'OS',
      expansion: 'Operating System',
      category: 'SYSTEM',
      definition:
        'System software that manages processes, memory, files, networking, and application access to hardware.',
      context:
        'Node delegates waiting for many network events to the OS. Linux, macOS, and Windows expose different mechanisms that libuv abstracts.',
      example: 'Linux · macOS · Windows',
    },
  },
  {
    id: 'kernel',
    aliases: ['kernel', 'ядро', 'ядро ос'],
    related: ['operating-system', 'io', 'socket'],
    ru: {
      term: 'Kernel',
      expansion: 'Ядро операционной системы',
      category: 'СИСТЕМА',
      definition:
        'Центральная часть ОС, которая управляет процессором, памятью, устройствами и системными вызовами.',
      context:
        'Когда сокет получает данные, именно kernel знает об этом первым и сообщает libuv о готовности.',
      example: 'read(), write(), epoll_wait() — системные вызовы',
    },
    en: {
      term: 'Kernel',
      expansion: 'Core of the operating system',
      category: 'SYSTEM',
      definition:
        'The central OS component that manages CPU time, memory, devices, and system calls.',
      context:
        'When data reaches a socket, the kernel learns about it first and reports readiness to libuv.',
      example: 'read(), write(), and epoll_wait() are system calls',
    },
  },
  {
    id: 'cpu',
    aliases: ['cpu', 'processor', 'процессор', 'центральный процессор'],
    related: ['cpu-bound', 'thread', 'parallelism'],
    ru: {
      term: 'CPU',
      expansion: 'Central Processing Unit · процессор',
      category: 'СИСТЕМА',
      definition:
        'Устройство, которое выполняет машинные инструкции. Ядра CPU могут физически исполнять несколько потоков одновременно.',
      context:
        'Тяжёлый JavaScript занимает CPU и main thread. Workers добавляют потоки, но не создают новые физические ядра.',
      example: 'while-loop и PBKDF2 расходуют CPU time',
    },
    en: {
      term: 'CPU',
      expansion: 'Central Processing Unit',
      category: 'SYSTEM',
      definition:
        'The hardware that executes machine instructions. CPU cores can physically run multiple threads at the same time.',
      context:
        'Expensive JavaScript consumes CPU time and occupies main. Workers add threads but do not create physical cores.',
      example: 'A while loop and PBKDF2 consume CPU time',
    },
  },
  {
    id: 'process',
    aliases: ['process', 'процесс', 'node process'],
    related: ['pid', 'thread', 'child-process'],
    ru: {
      term: 'Process',
      expansion: 'Процесс ОС',
      category: 'СИСТЕМА',
      definition:
        'Запущенный экземпляр программы со своим адресным пространством памяти, ресурсами и идентификатором PID.',
      context:
        'Основной Express-сервер — один Node-процесс. Лаборатория памяти создаёт второй, дочерний процесс.',
      example: 'node src/server.js создаёт Node-процесс',
    },
    en: {
      term: 'Process',
      expansion: 'Operating-system process',
      category: 'SYSTEM',
      definition:
        'A running program instance with its own virtual address space, resources, and PID.',
      context:
        'The Express server is one Node process. The memory lab starts a second child process.',
      example: 'node src/server.js creates a Node process',
    },
  },
  {
    id: 'thread',
    aliases: ['thread', 'поток', 'поток выполнения'],
    related: ['process', 'main-thread', 'parallelism'],
    ru: {
      term: 'Thread',
      expansion: 'Поток выполнения',
      category: 'СИСТЕМА',
      definition:
        'Последовательность инструкций, которую планирует ОС. В одном процессе может существовать несколько потоков.',
      context:
        'Ваш основной JavaScript обычно работает в main thread, но Node также имеет служебные потоки, libuv pool и может создавать Workers.',
      example: 'main thread · Worker thread · libuv worker',
    },
    en: {
      term: 'Thread',
      expansion: 'Execution thread',
      category: 'SYSTEM',
      definition:
        'A sequence of instructions scheduled by the OS. A single process can contain multiple threads.',
      context:
        'Application JavaScript normally runs on main, while Node also has internal threads, a libuv pool, and optional Workers.',
      example: 'main thread · Worker thread · libuv worker',
    },
  },
  {
    id: 'synchronous',
    aliases: ['sync', 'synchronous', 'синхронный', 'синхронно'],
    related: ['asynchronous', 'blocking', 'run-to-completion'],
    ru: {
      term: 'Synchronous',
      expansion: 'Синхронное выполнение',
      category: 'АСИНХРОННОСТЬ',
      definition:
        'Следующая строка ждёт завершения текущей операции; функция возвращает результат непосредственно в этом вызове.',
      context:
        'console.log и blockMainThread выполняются синхронно. Долгая синхронная работа удерживает JavaScript-стек.',
      example: 'const text = readFileSync(path, "utf8")',
    },
    en: {
      term: 'Synchronous',
      expansion: 'Immediate, in-sequence execution',
      category: 'ASYNCHRONY',
      definition:
        'The next line waits for the current operation; the function returns its result directly from this call.',
      context:
        'console.log and blockMainThread run synchronously. Long synchronous work occupies the JavaScript stack.',
      example: 'const text = readFileSync(path, "utf8")',
    },
  },
  {
    id: 'asynchronous',
    aliases: ['async', 'asynchronous', 'асинхронный', 'асинхронно'],
    related: ['synchronous', 'non-blocking', 'callback', 'promise'],
    ru: {
      term: 'Asynchronous',
      expansion: 'Асинхронное выполнение',
      category: 'АСИНХРОННОСТЬ',
      definition:
        'Результат будет доступен позже через callback, Promise, событие или другой механизм продолжения.',
      context:
        'Асинхронность не означает отдельный поток автоматически. Она прежде всего разделяет момент запуска и момент получения результата.',
      example: 'readFile(path).then(handleResult)',
    },
    en: {
      term: 'Asynchronous',
      expansion: 'Result delivered later',
      category: 'ASYNCHRONY',
      definition:
        'The result becomes available later through a callback, Promise, event, or another continuation mechanism.',
      context:
        'Asynchrony does not automatically mean another thread. It primarily separates starting work from receiving its result.',
      example: 'readFile(path).then(handleResult)',
    },
  },
  {
    id: 'non-blocking',
    aliases: ['non blocking', 'non-blocking', 'неблокирующий', 'не блокирует'],
    related: ['asynchronous', 'io', 'event-loop'],
    ru: {
      term: 'Non-blocking',
      expansion: 'Неблокирующий',
      category: 'АСИНХРОННОСТЬ',
      definition:
        'Вызов не удерживает текущий поток в ожидании завершения внешней операции и быстро возвращает управление.',
      context:
        'Асинхронный readFile не блокирует main thread на время чтения, хотя его callback позднее снова выполнится в main.',
      example: 'fs.readFile() — non-blocking форма API',
    },
    en: {
      term: 'Non-blocking',
      expansion: 'Does not occupy the waiting thread',
      category: 'ASYNCHRONY',
      definition:
        'A call returns control quickly instead of keeping the current thread waiting for an external operation to finish.',
      context:
        'Async readFile does not block main while reading, although its callback later runs on main again.',
      example: 'fs.readFile() is a non-blocking API form',
    },
  },
  {
    id: 'concurrency',
    aliases: ['concurrency', 'concurrent', 'конкурентность', 'конкурентно'],
    related: ['parallelism', 'asynchronous', 'event-loop'],
    ru: {
      term: 'Concurrency',
      expansion: 'Конкурентность',
      category: 'АСИНХРОННОСТЬ',
      definition:
        'Способность системы продвигать несколько задач в пересекающиеся промежутки времени, не обязательно исполняя их физически одновременно.',
      context:
        'Event Loop даёт конкурентность множеству I/O-задач на одном JavaScript-потоке.',
      example: 'Сервер ждёт несколько сетевых запросов одновременно',
    },
    en: {
      term: 'Concurrency',
      expansion: 'Overlapping progress',
      category: 'ASYNCHRONY',
      definition:
        'The ability to make progress on multiple tasks over overlapping periods, without requiring physical simultaneous execution.',
      context:
        'The Event Loop provides concurrency for many I/O tasks on one JavaScript thread.',
      example: 'A server waits for many network requests concurrently',
    },
  },
  {
    id: 'parallelism',
    aliases: ['parallelism', 'parallel', 'параллелизм', 'параллельно'],
    related: ['concurrency', 'cpu', 'worker-thread'],
    ru: {
      term: 'Parallelism',
      expansion: 'Параллельное выполнение',
      category: 'АСИНХРОННОСТЬ',
      definition:
        'Физическое выполнение нескольких задач в один момент времени, например на разных ядрах CPU.',
      context:
        'Worker Threads и потоки libuv могут дать параллелизм. Один Event Loop сам по себе — механизм конкурентности, а не параллельного JS.',
      example: 'Два Workers считают на двух ядрах CPU',
    },
    en: {
      term: 'Parallelism',
      expansion: 'Simultaneous execution',
      category: 'ASYNCHRONY',
      definition:
        'Physical execution of multiple tasks at the same time, for example on different CPU cores.',
      context:
        'Worker Threads and libuv workers can provide parallelism. One Event Loop provides concurrency, not parallel JavaScript by itself.',
      example: 'Two Workers compute on two CPU cores',
    },
  },
  {
    id: 'io-bound',
    aliases: ['io bound', 'i/o bound', 'io-bound', 'ограничен вводом выводом'],
    related: ['io', 'cpu-bound', 'non-blocking'],
    ru: {
      term: 'I/O-bound',
      expansion: 'Ограниченный ожиданием ввода-вывода',
      category: 'НАГРУЗКА',
      definition:
        'Тип работы, где основное время уходит на ожидание сети, диска, базы данных или другого внешнего ресурса.',
      context:
        'Для I/O-bound задач обычно полезнее асинхронный API, чем Worker Thread.',
      example: 'Ожидание ответа базы данных',
    },
    en: {
      term: 'I/O-bound',
      expansion: 'Limited by input/output waiting',
      category: 'WORKLOAD',
      definition:
        'Work that spends most of its time waiting for a network, disk, database, or another external resource.',
      context:
        'For I/O-bound work, an asynchronous API is usually more useful than a Worker Thread.',
      example: 'Waiting for a database response',
    },
  },
  {
    id: 'event-loop',
    aliases: ['event loop', 'eventloop', 'цикл событий', 'евент луп'],
    related: ['queue', 'phase', 'callback', 'concurrency'],
    ru: {
      term: 'Event Loop',
      expansion: 'Цикл событий',
      category: 'АСИНХРОННОСТЬ',
      definition:
        'Механизм, который после освобождения текущего JavaScript-стека выбирает готовую отложенную работу по правилам очередей и фаз.',
      context:
        'Event Loop не выполняет несколько JavaScript callbacks одновременно. Он решает, какой callback войдёт в стек следующим.',
      example: 'timers → poll → check · с приоритетными microtasks',
    },
    en: {
      term: 'Event Loop',
      expansion: 'Event-processing loop',
      category: 'ASYNCHRONY',
      definition:
        'The mechanism that selects ready deferred work according to queue and phase rules after the current JavaScript stack becomes free.',
      context:
        'The Event Loop does not execute multiple JavaScript callbacks simultaneously. It decides which callback enters the stack next.',
      example: 'timers → poll → check, with priority microtasks',
    },
  },
  {
    id: 'promise',
    aliases: ['promise', 'promises', 'промис', 'обещание'],
    related: ['asynchronous', 'microtask', 'callback'],
    ru: {
      term: 'Promise',
      expansion: 'Объект будущего результата',
      category: 'JAVASCRIPT',
      definition:
        'Объект с состоянием pending, fulfilled или rejected, который представляет результат, доступный сейчас или позднее.',
      context:
        'then/catch/finally регистрируют продолжения в microtask queue. Promise сам по себе не переносит вычисление в другой поток.',
      example: 'fetch(url).then(readJson).catch(handleError)',
    },
    en: {
      term: 'Promise',
      expansion: 'An object representing a future result',
      category: 'JAVASCRIPT',
      definition:
        'An object in pending, fulfilled, or rejected state that represents a result available now or later.',
      context:
        'then/catch/finally register continuations in the microtask queue. A Promise does not move computation to another thread by itself.',
      example: 'fetch(url).then(readJson).catch(handleError)',
    },
  },
  {
    id: 'fifo',
    aliases: ['fifo', 'first in first out', 'первым пришел первым ушел', 'очередность'],
    related: ['queue', 'registration', 'event-loop'],
    ru: {
      term: 'FIFO',
      expansion: 'First In, First Out · первым вошёл, первым вышел',
      category: 'СТРУКТУРЫ',
      definition:
        'Правило очереди, при котором первый добавленный элемент извлекается первым.',
      context:
        'FIFO помогает предсказывать порядок внутри одной очереди, но не создаёт единого порядка между nextTick, microtasks и фазами.',
      example: 'Promise A зарегистрирован до Promise B → A обычно раньше B',
    },
    en: {
      term: 'FIFO',
      expansion: 'First In, First Out',
      category: 'DATA STRUCTURES',
      definition:
        'A queue rule where the first inserted item is the first one removed.',
      context:
        'FIFO predicts order inside one queue but does not define a global order across nextTick, microtasks, and Event Loop phases.',
      example: 'Promise A registered before Promise B → A normally runs first',
    },
  },
  {
    id: 'timer',
    aliases: ['timer', 'timers', 'таймер', 'таймеры'],
    related: ['event-loop', 'set-timeout', 'latency'],
    ru: {
      term: 'Timer',
      expansion: 'Таймер',
      category: 'АСИНХРОННОСТЬ',
      definition:
        'Запись о том, что callback может быть запущен не раньше заданного временного порога.',
      context:
        'Таймер не является отдельным потоком и не гарантирует точное время. Готовый callback ещё ждёт Event Loop и свободный стек.',
      example: 'setTimeout(callback, 100)',
    },
    en: {
      term: 'Timer',
      expansion: 'Time-threshold callback',
      category: 'ASYNCHRONY',
      definition:
        'A record saying that a callback may run no earlier than a specified time threshold.',
      context:
        'A timer is not a separate thread and does not guarantee exact timing. Its ready callback still waits for the Event Loop and a free stack.',
      example: 'setTimeout(callback, 100)',
    },
  },
  {
    id: 'set-timeout',
    aliases: ['settimeout', 'settimeout()', 'timeout', 'таймаут'],
    related: ['timer', 'set-immediate', 'event-loop'],
    ru: {
      term: 'setTimeout()',
      expansion: 'Планирование timer callback',
      category: 'NODE API',
      definition:
        'Функция, которая регистрирует одноразовый callback после минимальной задержки.',
      context:
        'setTimeout(fn, 0) не означает «сейчас». Порядок относительно setImmediate зависит от места регистрации.',
      example: 'setTimeout(() => console.log("later"), 0)',
    },
    en: {
      term: 'setTimeout()',
      expansion: 'Schedule a timer callback',
      category: 'NODE API',
      definition:
        'A function that registers a one-time callback after a minimum delay.',
      context:
        'setTimeout(fn, 0) does not mean “now”. Its order relative to setImmediate depends on registration context.',
      example: 'setTimeout(() => console.log("later"), 0)',
    },
  },
  {
    id: 'set-immediate',
    aliases: ['setimmediate', 'setimmediate()', 'immediate', 'иммедиат'],
    related: ['set-timeout', 'event-loop', 'poll'],
    ru: {
      term: 'setImmediate()',
      expansion: 'Callback check-фазы',
      category: 'NODE API',
      definition:
        'Node API, которое ставит callback в очередь фазы check после завершения текущей poll-фазы.',
      context:
        'Если setImmediate и setTimeout(0) созданы внутри одного I/O callback, immediate выполняется раньше.',
      example: 'setImmediate(() => console.log("check phase"))',
    },
    en: {
      term: 'setImmediate()',
      expansion: 'Check-phase callback',
      category: 'NODE API',
      definition:
        'A Node API that queues a callback for the check phase after the current poll phase completes.',
      context:
        'If setImmediate and setTimeout(0) are created inside the same I/O callback, immediate runs first.',
      example: 'setImmediate(() => console.log("check phase"))',
    },
  },
  {
    id: 'http',
    aliases: ['http', 'hypertext transfer protocol', 'хттп', 'протокол http'],
    related: ['api', 'socket', 'stream'],
    ru: {
      term: 'HTTP',
      expansion: 'Hypertext Transfer Protocol',
      category: 'СЕТЬ',
      definition:
        'Прикладной протокол запросов и ответов, на котором работают сайты и многие API.',
      context:
        'Браузер лаборатории отправляет HTTP-запросы Express-серверу. Один TCP-сокет может переносить несколько HTTP-сообщений.',
      example: 'GET /api/health → 200 OK',
    },
    en: {
      term: 'HTTP',
      expansion: 'Hypertext Transfer Protocol',
      category: 'NETWORK',
      definition:
        'An application-level request/response protocol used by websites and many APIs.',
      context:
        'The lab browser sends HTTP requests to the Express server. One TCP socket can carry multiple HTTP messages.',
      example: 'GET /api/health → 200 OK',
    },
  },
  {
    id: 'dns',
    aliases: ['dns', 'domain name system', 'днс', 'система доменных имен'],
    related: ['io', 'socket', 'operating-system'],
    ru: {
      term: 'DNS',
      expansion: 'Domain Name System',
      category: 'СЕТЬ',
      definition:
        'Система, которая сопоставляет доменные имена и другие DNS-записи с сетевой информацией, например IP-адресами.',
      context:
        'dns.lookup использует системный resolver и обычно libuv pool; dns.resolve* отправляет DNS-запросы другим асинхронным путём.',
      example: 'localhost → 127.0.0.1',
    },
    en: {
      term: 'DNS',
      expansion: 'Domain Name System',
      category: 'NETWORK',
      definition:
        'A system that maps domain names and other DNS records to network information such as IP addresses.',
      context:
        'dns.lookup uses the system resolver and usually the libuv pool; dns.resolve* sends DNS queries through another asynchronous path.',
      example: 'localhost → 127.0.0.1',
    },
  },
  {
    id: 'socket',
    aliases: ['socket', 'сокет', 'network socket', 'сетевой сокет'],
    related: ['http', 'file-descriptor', 'io'],
    ru: {
      term: 'Socket',
      expansion: 'Сетевой endpoint ОС',
      category: 'СЕТЬ',
      definition:
        'Объект ОС, через который процесс отправляет и получает сетевые данные.',
      context:
        'Node не создаёт JavaScript-поток на каждый socket. libuv наблюдает готовность множества сокетов через механизмы ОС.',
      example: 'TCP connection между браузером и Express',
    },
    en: {
      term: 'Socket',
      expansion: 'Operating-system network endpoint',
      category: 'NETWORK',
      definition:
        'An OS object through which a process sends and receives network data.',
      context:
        'Node does not create a JavaScript thread per socket. libuv watches many sockets through OS readiness facilities.',
      example: 'A TCP connection between the browser and Express',
    },
  },
  {
    id: 'file-descriptor',
    aliases: ['file descriptor', 'fd', 'файловый дескриптор', 'дескриптор'],
    related: ['socket', 'operating-system', 'io'],
    ru: {
      term: 'File descriptor',
      expansion: 'FD · файловый дескриптор',
      category: 'СИСТЕМА',
      definition:
        'Небольшой числовой идентификатор открытого файла, сокета, pipe или другого I/O-ресурса в процессе.',
      context:
        'libuv хранит handles поверх системных ресурсов; утечка незакрытых дескрипторов отличается от утечки JavaScript heap.',
      example: 'stdin обычно имеет fd 0, stdout — fd 1',
    },
    en: {
      term: 'File descriptor',
      expansion: 'FD',
      category: 'SYSTEM',
      definition:
        'A small numeric identifier for an open file, socket, pipe, or another I/O resource in a process.',
      context:
        'libuv wraps system resources in handles; leaking open descriptors differs from leaking JavaScript heap objects.',
      example: 'stdin is commonly fd 0, stdout is fd 1',
    },
  },
  {
    id: 'os-demultiplexer',
    aliases: ['epoll', 'kqueue', 'iocp', 'event notification', 'механизм готовности ос'],
    related: ['event-demultiplexer', 'kernel', 'socket'],
    ru: {
      term: 'epoll / kqueue / IOCP',
      expansion: 'Механизмы уведомления о I/O разных ОС',
      category: 'СИСТЕМА',
      definition:
        'Системные механизмы Linux, macOS/BSD и Windows, позволяющие эффективно узнавать о готовности множества I/O-источников.',
      context:
        'libuv скрывает различия между этими платформами и даёт Node общую модель Event Loop.',
      example: 'Linux: epoll · macOS: kqueue · Windows: IOCP',
    },
    en: {
      term: 'epoll / kqueue / IOCP',
      expansion: 'OS-specific I/O notification facilities',
      category: 'SYSTEM',
      definition:
        'Linux, macOS/BSD, and Windows facilities for efficiently learning which of many I/O sources are ready.',
      context:
        'libuv hides the platform differences and gives Node a common Event Loop model.',
      example: 'Linux: epoll · macOS: kqueue · Windows: IOCP',
    },
  },
  {
    id: 'esm',
    aliases: ['esm', 'es module', 'ecmascript module', 'эс модуль', 'модуль esm'],
    related: ['commonjs', 'module', 'promise'],
    ru: {
      term: 'ESM',
      expansion: 'ECMAScript Modules',
      category: 'МОДУЛИ',
      definition:
        'Стандартная модульная система JavaScript с import и export.',
      context:
        'Проект использует "type": "module". Вычисление top-level ESM происходит в microtask-контексте, что влияет на сравнение Promise и nextTick.',
      example: "import { Module } from '@nestjs/common'",
    },
    en: {
      term: 'ESM',
      expansion: 'ECMAScript Modules',
      category: 'MODULES',
      definition:
        'The standard JavaScript module system based on import and export.',
      context:
        'This project uses "type": "module". Top-level ESM evaluation occurs in a microtask context, affecting Promise versus nextTick ordering.',
      example: "import { Module } from '@nestjs/common'",
    },
  },
  {
    id: 'commonjs',
    aliases: ['commonjs', 'cjs', 'require module', 'коммонджс'],
    related: ['esm', 'module', 'nodejs'],
    ru: {
      term: 'CommonJS',
      expansion: 'CJS · историческая модульная система Node',
      category: 'МОДУЛИ',
      definition:
        'Модульный формат Node с require() и module.exports.',
      context:
        'CommonJS и ESM по-разному загружаются и имеют некоторые наблюдаемые различия, включая top-level порядок microtasks.',
      example: 'const fs = require("node:fs")',
    },
    en: {
      term: 'CommonJS',
      expansion: 'CJS · traditional Node module system',
      category: 'MODULES',
      definition:
        'The Node module format based on require() and module.exports.',
      context:
        'CommonJS and ESM load differently and expose some observable differences, including top-level microtask ordering.',
      example: 'const fs = require("node:fs")',
    },
  },
  {
    id: 'module',
    aliases: ['module', 'модуль', 'js module'],
    related: ['esm', 'commonjs', 'api'],
    ru: {
      term: 'Module',
      expansion: 'Модуль программы',
      category: 'МОДУЛИ',
      definition:
        'Файл или логическая единица кода с собственными экспортами и зависимостями.',
      context:
        'src/demos.js экспортирует каталог экспериментов, а App.jsx импортирует UI-компоненты.',
      example: 'export function publicDemo() {}',
    },
    en: {
      term: 'Module',
      expansion: 'A program module',
      category: 'MODULES',
      definition:
        'A file or logical code unit with its own exports and dependencies.',
      context:
        'src/demos.js exports the experiment catalog, while App.jsx imports UI components.',
      example: 'export function publicDemo() {}',
    },
  },
  {
    id: 'child-process',
    aliases: ['child process', 'child_process', 'дочерний процесс', 'fork process'],
    related: ['process', 'ipc', 'worker-thread'],
    ru: {
      term: 'Child process',
      expansion: 'Дочерний процесс',
      category: 'ПРОЦЕССЫ',
      definition:
        'Отдельный процесс ОС, запущенный другим процессом и имеющий собственное адресное пространство памяти.',
      context:
        'Memory Lab использует child_process.fork, чтобы утечка не жила в heap основного Express-сервера.',
      example: 'fork("./memory-leak-child.js")',
    },
    en: {
      term: 'Child process',
      expansion: 'A process started by another process',
      category: 'PROCESSES',
      definition:
        'A separate OS process started by another process, with its own virtual address space.',
      context:
        'The Memory Lab uses child_process.fork so retained objects do not live in the Express server heap.',
      example: 'fork("./memory-leak-child.js")',
    },
  },
  {
    id: 'ipc',
    aliases: ['ipc', 'inter process communication', 'межпроцессное взаимодействие', 'межпроцессная связь'],
    related: ['child-process', 'process', 'message-passing'],
    ru: {
      term: 'IPC',
      expansion: 'Inter-Process Communication',
      category: 'ПРОЦЕССЫ',
      definition:
        'Механизмы обмена данными между отдельными процессами.',
      context:
        'Родитель Memory Lab отправляет child команды pause, release и gc через встроенный IPC-канал fork().',
      example: 'child.send({ type: "action", action: "pause" })',
    },
    en: {
      term: 'IPC',
      expansion: 'Inter-Process Communication',
      category: 'PROCESSES',
      definition:
        'Mechanisms for exchanging data between separate processes.',
      context:
        'The Memory Lab parent sends pause, release, and gc commands to its child through fork() IPC.',
      example: 'child.send({ type: "action", action: "pause" })',
    },
  },
  {
    id: 'structured-clone',
    aliases: ['structured clone', 'structured cloning', 'структурное клонирование', 'structuredclone'],
    related: ['worker-thread', 'transfer-list', 'shared-array-buffer'],
    ru: {
      term: 'Structured clone',
      expansion: 'Алгоритм структурного клонирования',
      category: 'ПОТОКИ',
      definition:
        'Алгоритм копирования многих JavaScript-значений с поддержкой циклических ссылок, Map, Set и типизированных массивов.',
      context:
        'Сообщения Worker обычно клонируются. Функции и некоторые специальные объекты скопировать нельзя, а прототипы пользовательских классов не сохраняются.',
      example: 'worker.postMessage({ rows, options })',
    },
    en: {
      term: 'Structured clone',
      expansion: 'Structured cloning algorithm',
      category: 'THREADS',
      definition:
        'An algorithm for copying many JavaScript values, including cyclic structures, Map, Set, and typed arrays.',
      context:
        'Worker messages are normally cloned. Functions and some special objects cannot be cloned, and custom class prototypes are not preserved.',
      example: 'worker.postMessage({ rows, options })',
    },
  },
  {
    id: 'transfer-list',
    aliases: ['transfer list', 'transferlist', 'список передачи', 'передача владения'],
    related: ['structured-clone', 'array-buffer', 'worker-thread'],
    ru: {
      term: 'Transfer list',
      expansion: 'Список объектов для передачи владения',
      category: 'ПОТОКИ',
      definition:
        'Список transferable-объектов, память которых перемещается получателю без полного копирования.',
      context:
        'Переданный ArrayBuffer становится недоступен отправителю. Это быстрее копии, но требует явно понимать владение данными.',
      example: 'worker.postMessage(buffer, [buffer])',
    },
    en: {
      term: 'Transfer list',
      expansion: 'Objects whose ownership is transferred',
      category: 'THREADS',
      definition:
        'A list of transferable objects whose memory ownership moves to the receiver without a full copy.',
      context:
        'A transferred ArrayBuffer becomes unusable by the sender. This can be faster than cloning but requires explicit ownership reasoning.',
      example: 'worker.postMessage(buffer, [buffer])',
    },
  },
  {
    id: 'shared-array-buffer',
    aliases: ['sharedarraybuffer', 'shared array buffer', 'общая память', 'разделяемый буфер'],
    related: ['worker-thread', 'transfer-list', 'concurrency'],
    ru: {
      term: 'SharedArrayBuffer',
      expansion: 'Разделяемый бинарный буфер',
      category: 'ПОТОКИ',
      definition:
        'Область памяти, к которой одновременно могут обращаться несколько JavaScript-потоков.',
      context:
        'Данные не копируются, но появляются настоящие гонки. Для координации используют Atomics и строгий протокол доступа.',
      example: 'new SharedArrayBuffer(1024) · Atomics.add(...)',
    },
    en: {
      term: 'SharedArrayBuffer',
      expansion: 'Shared binary memory',
      category: 'THREADS',
      definition:
        'A memory region that multiple JavaScript threads can access at the same time.',
      context:
        'Data is not copied, but real races become possible. Coordination requires Atomics and a carefully designed access protocol.',
      example: 'new SharedArrayBuffer(1024) · Atomics.add(...)',
    },
  },
  {
    id: 'gc',
    aliases: ['gc', 'garbage collector', 'garbage collection', 'сборщик мусора', 'сборка мусора'],
    related: ['reference', 'heap-used', 'memory-leak'],
    ru: {
      term: 'GC',
      expansion: 'Garbage Collector · сборщик мусора',
      category: 'ПАМЯТЬ',
      definition:
        'Механизм автоматического поиска и освобождения объектов, которые больше недостижимы из корней программы.',
      context:
        'GC не знает, нужен ли объект бизнесу. Если глобальный массив всё ещё содержит ссылку, объект остаётся живым.',
      example: 'global.gc() доступен только с --expose-gc',
    },
    en: {
      term: 'GC',
      expansion: 'Garbage Collector',
      category: 'MEMORY',
      definition:
        'The automatic mechanism that finds and reclaims objects no longer reachable from program roots.',
      context:
        'GC does not know business intent. If a global array still holds a reference, the object remains alive.',
      example: 'global.gc() is available only with --expose-gc',
    },
  },
  {
    id: 'reference',
    aliases: ['reference', 'ссылка', 'object reference', 'ссылка на объект'],
    related: ['gc', 'reachable', 'memory-leak'],
    ru: {
      term: 'Reference',
      expansion: 'Ссылка на объект',
      category: 'ПАМЯТЬ',
      definition:
        'Значение, через которое программа может добраться до объекта в памяти.',
      context:
        'Утечка часто появляется не из-за самого allocation, а из-за долгоживущей ссылки в cache, listener, closure или глобальном массиве.',
      example: 'retainedBlocks.push(buffer)',
    },
    en: {
      term: 'Reference',
      expansion: 'A way to reach an object',
      category: 'MEMORY',
      definition:
        'A value through which a program can reach an object in memory.',
      context:
        'A leak often comes not from allocation itself but from a long-lived reference in a cache, listener, closure, or global array.',
      example: 'retainedBlocks.push(buffer)',
    },
  },
  {
    id: 'buffer',
    aliases: ['buffer', 'node buffer', 'буфер', 'буфер node'],
    related: ['array-buffer', 'external', 'io'],
    ru: {
      term: 'Buffer',
      expansion: 'Node.js Buffer',
      category: 'ПАМЯТЬ',
      definition:
        'Тип Node для работы с последовательностью байтов: файлами, сетевыми пакетами, изображениями и бинарными протоколами.',
      context:
        'Объект-обёртка виден V8, но backing store Buffer в основном учитывается как external/arrayBuffers.',
      example: 'Buffer.alloc(4 * 1024 * 1024)',
    },
    en: {
      term: 'Buffer',
      expansion: 'Node.js byte buffer',
      category: 'MEMORY',
      definition:
        'A Node type for handling byte sequences such as files, network packets, images, and binary protocols.',
      context:
        'The wrapper object is visible to V8, while Buffer backing storage is primarily reported as external/arrayBuffers.',
      example: 'Buffer.alloc(4 * 1024 * 1024)',
    },
  },
  {
    id: 'array-buffer',
    aliases: ['arraybuffer', 'array buffer', 'массив буфер', 'бинарный буфер'],
    related: ['buffer', 'transfer-list', 'shared-array-buffer'],
    ru: {
      term: 'ArrayBuffer',
      expansion: 'Низкоуровневый бинарный буфер JavaScript',
      category: 'ПАМЯТЬ',
      definition:
        'Фиксированная область сырых байтов, которую читают через TypedArray или DataView.',
      context:
        'ArrayBuffer можно передавать Worker через transfer list. После передачи исходный буфер становится detached.',
      example: 'new ArrayBuffer(1024) · new Uint8Array(buffer)',
    },
    en: {
      term: 'ArrayBuffer',
      expansion: 'Low-level JavaScript binary buffer',
      category: 'MEMORY',
      definition:
        'A fixed raw-byte region accessed through TypedArray or DataView.',
      context:
        'An ArrayBuffer can be sent to a Worker through a transfer list. After transfer, the original buffer becomes detached.',
      example: 'new ArrayBuffer(1024) · new Uint8Array(buffer)',
    },
  },
  {
    id: 'allocator',
    aliases: ['allocator', 'memory allocator', 'аллокатор', 'распределитель памяти'],
    related: ['gc', 'rss', 'oom'],
    ru: {
      term: 'Allocator',
      expansion: 'Распределитель памяти',
      category: 'ПАМЯТЬ',
      definition:
        'Компонент, который выдаёт и переиспользует участки нативной памяти для процесса.',
      context:
        'После GC allocator может оставить свободные страницы процессу для будущих allocation. Поэтому RSS не обязан сразу уменьшаться.',
      example: 'malloc/free и внутренние allocators V8',
    },
    en: {
      term: 'Allocator',
      expansion: 'Memory allocator',
      category: 'MEMORY',
      definition:
        'A component that provides and reuses native memory regions for a process.',
      context:
        'After GC, an allocator may retain free pages for future allocations. Therefore RSS does not have to decrease immediately.',
      example: 'malloc/free and V8 internal allocators',
    },
  },
  {
    id: 'oom',
    aliases: ['oom', 'out of memory', 'нехватка памяти', 'закончилась память'],
    related: ['allocator', 'memory-leak', 'cgroup'],
    ru: {
      term: 'OOM',
      expansion: 'Out Of Memory',
      category: 'ПАМЯТЬ',
      definition:
        'Состояние, когда процесс или система не может выделить требуемую память.',
      context:
        'V8 может остановить процесс при достижении heap limit, а ОС или container runtime — при превышении общего memory limit.',
      example: 'JavaScript heap out of memory · container OOMKilled',
    },
    en: {
      term: 'OOM',
      expansion: 'Out Of Memory',
      category: 'MEMORY',
      definition:
        'A condition where a process or system cannot allocate the requested memory.',
      context:
        'V8 can terminate on its heap limit, while the OS or container runtime can enforce a total memory limit.',
      example: 'JavaScript heap out of memory · container OOMKilled',
    },
  },
  {
    id: 'cgroup',
    aliases: ['cgroup', 'control group', 'контрольная группа', 'лимит контейнера'],
    related: ['container', 'process', 'oom'],
    ru: {
      term: 'cgroup',
      expansion: 'Linux control group',
      category: 'КОНТЕЙНЕРЫ',
      definition:
        'Механизм Linux для учёта и ограничения ресурсов группы процессов: памяти, CPU и числа процессов.',
      context:
        'Docker Compose задаёт лаборатории 2 GB. Основной Node и memory child входят в одну cgroup и делят этот предел.',
      example: 'mem_limit: 2g',
    },
    en: {
      term: 'cgroup',
      expansion: 'Linux control group',
      category: 'CONTAINERS',
      definition:
        'A Linux mechanism for accounting and limiting resources such as memory, CPU, and process count for a group of processes.',
      context:
        'Docker Compose gives the lab 2 GB. The main Node process and memory child share one cgroup and that limit.',
      example: 'mem_limit: 2g',
    },
  },
  {
    id: 'container',
    aliases: ['container', 'docker container', 'контейнер', 'докер контейнер'],
    related: ['cgroup', 'process', 'operating-system'],
    ru: {
      term: 'Container',
      expansion: 'Контейнер приложения',
      category: 'КОНТЕЙНЕРЫ',
      definition:
        'Изолированная группа процессов с собственным файловым и сетевым окружением, использующая kernel хостовой ОС.',
      context:
        'Контейнер легче виртуальной машины: внутри нет отдельного kernel. Docker-образ описывает файловую систему и команду запуска.',
      example: 'docker compose up --build',
    },
    en: {
      term: 'Container',
      expansion: 'Application container',
      category: 'CONTAINERS',
      definition:
        'An isolated process group with its own filesystem and network environment, sharing the host OS kernel.',
      context:
        'A container is lighter than a virtual machine because it has no separate kernel. A Docker image defines its filesystem and startup command.',
      example: 'docker compose up --build',
    },
  },
  {
    id: 'ndjson',
    aliases: ['ndjson', 'newline delimited json', 'json lines', 'jsonl'],
    related: ['stream', 'http', 'sse'],
    ru: {
      term: 'NDJSON',
      expansion: 'Newline-Delimited JSON',
      category: 'ПРОТОКОЛЫ',
      definition:
        'Потоковый формат, где каждая строка является самостоятельным JSON-объектом.',
      context:
        'Обычные эксперименты отправляют trace по HTTP постепенно. Клиент может разобрать одну строку, не дожидаясь всего ответа.',
      example: '{"type":"start"}\\n{"type":"callback"}\\n',
    },
    en: {
      term: 'NDJSON',
      expansion: 'Newline-Delimited JSON',
      category: 'PROTOCOLS',
      definition:
        'A streaming format where every line is an independent JSON object.',
      context:
        'Regular experiments stream their trace over HTTP. The client can parse one line without waiting for the entire response.',
      example: '{"type":"start"}\\n{"type":"callback"}\\n',
    },
  },
  {
    id: 'sse',
    aliases: ['sse', 'server sent events', 'eventsource', 'события от сервера'],
    related: ['stream', 'http', 'ndjson'],
    ru: {
      term: 'SSE',
      expansion: 'Server-Sent Events',
      category: 'ПРОТОКОЛЫ',
      definition:
        'Однонаправленный HTTP-поток, по которому сервер долго отправляет клиенту именованные текстовые события.',
      context:
        'Memory Lab использует EventSource и SSE для непрерывной передачи samples и статуса процесса в браузер.',
      example: 'event: sample\\ndata: {"rss":123}\\n\\n',
    },
    en: {
      term: 'SSE',
      expansion: 'Server-Sent Events',
      category: 'PROTOCOLS',
      definition:
        'A one-way long-lived HTTP stream through which a server sends named text events to a client.',
      context:
        'The Memory Lab uses EventSource and SSE to continuously send process samples and state to the browser.',
      example: 'event: sample\\ndata: {"rss":123}\\n\\n',
    },
  },
  {
    id: 'pid',
    aliases: ['pid', 'process id', 'идентификатор процесса', 'номер процесса'],
    related: ['process', 'child-process', 'operating-system'],
    ru: {
      term: 'PID',
      expansion: 'Process Identifier',
      category: 'СИСТЕМА',
      definition:
        'Числовой идентификатор, который ОС присваивает запущенному процессу.',
      context:
        'В хедере показан runtime сервера, а Memory Lab отдельно отображает PID дочернего процесса.',
      example: 'process.pid',
    },
    en: {
      term: 'PID',
      expansion: 'Process Identifier',
      category: 'SYSTEM',
      definition:
        'A numeric identifier assigned by the OS to a running process.',
      context:
        'The header shows the server runtime, while the Memory Lab separately exposes its child-process PID.',
      example: 'process.pid',
    },
  },
  {
    id: 'environment-variable',
    aliases: ['environment variable', 'env var', 'env', 'переменная окружения', 'окружение'],
    related: ['process', 'uv-threadpool-size', 'container'],
    ru: {
      term: 'Environment variable',
      expansion: 'Переменная окружения',
      category: 'СИСТЕМА',
      definition:
        'Пара key/value, которую ОС передаёт процессу при запуске для конфигурации без изменения кода.',
      context:
        'PORT и UV_THREADPOOL_SIZE читаются из process.env. Некоторые значения важно задать до старта Node.',
      example: '$env:UV_THREADPOOL_SIZE = "2"',
    },
    en: {
      term: 'Environment variable',
      expansion: 'Process environment key/value',
      category: 'SYSTEM',
      definition:
        'A key/value pair supplied to a process at startup for configuration without changing source code.',
      context:
        'PORT and UV_THREADPOOL_SIZE are read from process.env. Some values must be set before Node starts.',
      example: 'UV_THREADPOOL_SIZE=2 node src/server.js',
    },
  },
  {
    id: 'latency',
    aliases: ['latency', 'delay', 'задержка', 'время отклика'],
    related: ['lag', 'throughput', 'timer'],
    ru: {
      term: 'Latency',
      expansion: 'Задержка / время отклика',
      category: 'ПРОИЗВОДИТЕЛЬНОСТЬ',
      definition:
        'Время между началом действия и наблюдаемым результатом.',
      context:
        'Блокирующий callback увеличивает latency всех готовых запросов. Низкий throughput и высокая latency — разные проблемы.',
      example: 'HTTP roundtrip: 18 ms',
    },
    en: {
      term: 'Latency',
      expansion: 'Response delay',
      category: 'PERFORMANCE',
      definition:
        'The time between starting an action and observing its result.',
      context:
        'A blocking callback increases latency for every ready request. Low throughput and high latency are different problems.',
      example: 'HTTP roundtrip: 18 ms',
    },
  },
  {
    id: 'throughput',
    aliases: ['throughput', 'пропускная способность', 'операций в секунду', 'rps'],
    related: ['latency', 'concurrency', 'cpu'],
    ru: {
      term: 'Throughput',
      expansion: 'Пропускная способность',
      category: 'ПРОИЗВОДИТЕЛЬНОСТЬ',
      definition:
        'Количество работы, которое система завершает за единицу времени.',
      context:
        'Worker pool может увеличить throughput CPU-задач, но отдельный запрос всё равно получить большую latency.',
      example: '500 requests per second',
    },
    en: {
      term: 'Throughput',
      expansion: 'Work completed per unit of time',
      category: 'PERFORMANCE',
      definition:
        'The amount of work a system completes per unit of time.',
      context:
        'A Worker pool can increase CPU-task throughput while an individual request may still have high latency.',
      example: '500 requests per second',
    },
  },
  {
    id: 'stream',
    aliases: ['stream', 'streaming', 'поток данных', 'стрим'],
    related: ['backpressure', 'ndjson', 'sse'],
    ru: {
      term: 'Stream',
      expansion: 'Поток данных',
      category: 'ДАННЫЕ',
      definition:
        'Интерфейс обработки данных частями, без обязательного хранения всего набора в памяти.',
      context:
        'NDJSON trace и SSE передают события постепенно. Здесь stream означает поток данных, а не OS thread.',
      example: 'response.body.getReader()',
    },
    en: {
      term: 'Stream',
      expansion: 'Incremental data flow',
      category: 'DATA',
      definition:
        'An interface for processing data in chunks without necessarily holding the entire dataset in memory.',
      context:
        'NDJSON traces and SSE send events incrementally. Here “stream” means data flow, not an OS thread.',
      example: 'response.body.getReader()',
    },
  },
  {
    id: 'backpressure',
    aliases: ['backpressure', 'back pressure', 'обратное давление', 'медленный потребитель'],
    related: ['stream', 'queue', 'memory-leak'],
    ru: {
      term: 'Backpressure',
      expansion: 'Обратное давление в потоке',
      category: 'ДАННЫЕ',
      definition:
        'Механизм, который не даёт быстрому producer бесконечно накапливать данные перед медленным consumer.',
      context:
        'Если сервер пишет быстрее, чем клиент читает, без backpressure растут очереди и память.',
      example: 'Если writable.write() вернул false, ждут событие drain',
    },
    en: {
      term: 'Backpressure',
      expansion: 'Flow control for a slow consumer',
      category: 'DATA',
      definition:
        'A mechanism that prevents a fast producer from accumulating unlimited data in front of a slow consumer.',
      context:
        'If a server writes faster than a client reads, queues and memory grow unless backpressure is respected.',
      example: 'If writable.write() returns false, wait for drain',
    },
  },
  {
    id: 'native-code',
    aliases: ['native code', 'native', 'нативный код', 'c++ code', 'c code'],
    related: ['cpu', 'libuv', 'v8'],
    ru: {
      term: 'Native code',
      expansion: 'Нативный машинный / C/C++ код',
      category: 'RUNTIME',
      definition:
        'Код, скомпилированный для конкретной платформы и выполняемый CPU напрямую, а не как JavaScript приложения.',
      context:
        'libuv, части Node, crypto и V8 реализованы на C/C++. Асинхронный pbkdf2 выполняет нативную работу в pool.',
      example: 'crypto.pbkdf2() вызывает нативную реализацию',
    },
    en: {
      term: 'Native code',
      expansion: 'Machine / C / C++ code',
      category: 'RUNTIME',
      definition:
        'Code compiled for a platform and executed directly by the CPU rather than as application JavaScript.',
      context:
        'libuv, parts of Node, crypto, and V8 are implemented in C/C++. Async pbkdf2 runs native work in the pool.',
      example: 'crypto.pbkdf2() invokes a native implementation',
    },
  },
  {
    id: 'sql',
    aliases: [
      'sql',
      'structured query language',
      'язык запросов',
      'язык sql',
      'select insert update delete',
    ],
    related: ['postgresql', 'parameter', 'transaction'],
    ru: {
      term: 'SQL',
      expansion: 'Structured Query Language · язык структурированных запросов',
      category: 'БАЗЫ ДАННЫХ',
      definition:
        'Декларативный язык определения таблиц, чтения строк и изменения данных в реляционной базе.',
      context:
        'Отдельная глава начинает с SELECT, FROM, WHERE, INSERT, UPDATE, DELETE, NULL, $1 parameters и result.rows.',
      example: 'SELECT id, name FROM products WHERE price <= $1',
    },
    en: {
      term: 'SQL',
      expansion: 'Structured Query Language',
      category: 'DATABASES',
      definition:
        'A declarative language for defining tables, reading rows, and changing data in a relational database.',
      context:
        'The beginner chapter starts with SELECT, FROM, WHERE, INSERT, UPDATE, DELETE, NULL, $1 parameters, and result.rows.',
      example: 'SELECT id, name FROM products WHERE price <= $1',
    },
  },
  {
    id: 'microservice',
    aliases: [
      'microservice',
      'microservices',
      'микросервис',
      'микросервисы',
      'microservice architecture',
      'микросервисная архитектура',
    ],
    related: ['message broker', 'event', 'idempotency', 'distributed trace'],
    ru: {
      term: 'Microservice',
      expansion: 'Независимо развёртываемая сервисная граница',
      category: 'АРХИТЕКТУРА',
      definition:
        'Application boundary вокруг business capability, которая самостоятельно развёртывается и владеет своими данными.',
      context:
        'Глава показывает настоящий Nest TCP transport, command, event, remote error, duplicate delivery и transactional outbox.',
      example: 'Orders → order.placed.v1 → Inventory',
    },
    en: {
      term: 'Microservice',
      expansion: 'Independently deployable service boundary',
      category: 'ARCHITECTURE',
      definition:
        'An application boundary around a business capability that deploys independently and owns its data.',
      context:
        'The chapter demonstrates a real Nest TCP transport, commands, events, remote errors, duplicate delivery, and a transactional outbox.',
      example: 'Orders → order.placed.v1 → Inventory',
    },
  },
];

const chapterTermAliases = {
  'call stack': ['стек вызовов', 'стек javascript', 'js stack'],
  callback: ['колбэк', 'функция обратного вызова', 'callback function'],
  microtask: ['микрозадача', 'микротаска', 'micro task'],
  phase: ['фаза event loop', 'фаза цикла событий'],
  registration: ['регистрация callback', 'регистрация обработчика'],
  'event source': ['источник событий', 'источник io', 'источник i/o'],
  demultiplexer: [
    'демультиплексор',
    'демультиплексирование',
    'event demultiplexer',
    'демультиплексор событий',
  ],
  libuv: ['либув', 'uv library'],
  poll: ['poll phase', 'фаза poll', 'опрос событий'],
  queue: ['очередь', 'очередь callback', 'callback queue'],
  lag: ['задержка event loop', 'event loop lag', 'задержка цикла событий'],
  'run-to-completion': [
    'выполнение до завершения',
    'run to completion',
    'атомарность callback',
  ],
  starvation: ['голодание', 'голодание очереди', 'queue starvation'],
  'main thread': ['главный поток', 'основной поток', 'javascript thread'],
  'cpu-bound': ['cpu bound', 'вычислительная задача', 'нагрузка на cpu'],
  'worker thread': ['воркер', 'рабочий поток', 'worker_threads'],
  'message passing': ['передача сообщений', 'обмен сообщениями'],
  'native operation': ['нативная операция', 'native job'],
  'thread pool': ['пул потоков', 'libuv pool', 'worker pool'],
  uv_threadpool_size: ['размер пула libuv', 'uv threadpool size'],
  pbkdf2: ['password based key derivation function', 'вывод ключа'],
  'heap used': ['использованная куча', 'heapused', 'v8 heap'],
  external: ['внешняя память', 'external memory'],
  rss: ['resident set size', 'резидентная память'],
  retained: ['удерживаемая память', 'retained memory'],
  'gc root': ['корень gc', 'корень сборщика мусора'],
  reachable: ['достижимый объект', 'достижимость'],
  executor: ['promise executor', 'исполнитель promise', 'функция executor'],
  'pending fulfilled rejected': [
    'состояния promise',
    'состояния промиса',
    'settled',
  ],
  'then chain': ['цепочка then', 'promise chain', 'цепочка промисов'],
  'async await': ['асинк авейт', 'async function', 'await'],
  'promise all': ['промис ол', 'все промисы'],
  'promise allsettled': ['промис all settled', 'все результаты promise'],
  'promise race any': ['promise race', 'promise any', 'гонка промисов'],
  bullmq: ['bull mq', 'бул мк', 'булл мк', 'очередь bullmq'],
  redis: ['редис', 'redis server', 'redis database'],
  job: ['джоб', 'задача bullmq', 'queue job'],
  'bullmq worker': ['воркер bullmq', 'обработчик bullmq job'],
  idempotency: ['идемпотентность', 'идемпотентный обработчик'],
  'relational model': ['реляционная модель', 'relations', 'отношения'],
  constraint: ['ограничение базы данных', 'ограничение целостности'],
  invariant: ['инвариант', 'бизнес правило', 'business rule'],
  acid: [
    'atomicity consistency isolation durability',
    'атомарность согласованность изоляция долговечность',
  ],
  wal: ['write ahead log', 'журнал предзаписи', 'журнал postgres'],
  sqlstate: ['код ошибки postgres', 'postgres error code'],
  selectivity: ['селективность', 'избирательность запроса'],
  'b tree': ['btree', 'b-tree', 'би три индекс'],
  'hash index': ['хеш индекс', 'hash индекс'],
  gin: ['generalized inverted index', 'инвертированный индекс'],
  brin: ['block range index', 'индекс диапазонов блоков'],
  'explain analyze': ['план запроса', 'explain', 'анализ плана'],
  'cardinality estimate': ['оценка кардинальности', 'estimated rows'],
  mvcc: [
    'multiversion concurrency control',
    'многоверсионное управление конкурентным доступом',
  ],
  snapshot: ['снимок транзакции', 'снимок данных'],
  'isolation level': ['уровень изоляции', 'transaction isolation'],
  'pessimistic lock': ['пессимистичная блокировка', 'select for update'],
  'optimistic lock': ['оптимистичная блокировка', 'version locking'],
  deadlock: ['взаимная блокировка', 'дедлок'],
  'serialization failure': ['ошибка сериализации', 'sqlstate 40001'],
  'inner join': ['внутреннее соединение', 'join'],
  'left join': ['левое соединение', 'left outer join'],
  'nested loop': ['вложенный цикл join', 'nested loop join'],
  'hash join': ['хеш соединение'],
  'merge join': ['слияние join', 'sort merge join'],
  'n+1 query': ['n+1', 'эн плюс один', 'лишние запросы orm'],
  'materialized view': [
    'материализованное представление',
    'материализованный вид',
  ],
  'service boundary': ['граница сервиса', 'bounded context', 'service ownership'],
  'request-response': ['запрос ответ', 'синхронный вызов сервиса'],
  event: ['событие', 'domain event', 'integration event'],
  'message broker': ['брокер сообщений', 'kafka', 'rabbitmq', 'nats'],
  'delivery semantics': ['гарантии доставки', 'at least once', 'at most once'],
  idempotency: ['идемпотентность', 'идемпотентный consumer', 'deduplication'],
  'eventual consistency': ['согласованность в конечном счете'],
  statement: ['sql statement', 'sql команда', 'оператор sql'],
  clause: ['sql clause', 'часть sql', 'where clause'],
  expression: ['sql expression', 'выражение sql'],
  null: ['нулл', 'отсутствующее значение', 'is null'],
  'parameter $1': ['sql parameter', 'параметр запроса', 'placeholder'],
  'alias as': ['sql alias', 'псевдоним column'],
  'result set': ['результат select', 'набор строк', 'result rows'],
};

export function normalizeGlossaryText(value = '') {
  return String(value)
    .toLocaleLowerCase()
    .replaceAll('ё', 'е')
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}+#]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function compact(value) {
  return normalizeGlossaryText(value).replaceAll(' ', '');
}

function localizedBaseTerm(term, language) {
  const localized = term[language] ?? term.en;
  return {
    id: term.id,
    ...localized,
    aliases: term.aliases,
    related: term.related ?? [],
    sources: [],
    kind: 'foundation',
  };
}

function searchKeysFor(entry) {
  return [
    entry.term,
    entry.expansion,
    ...(entry.aliases ?? []),
  ]
    .filter(Boolean)
    .flatMap((value) => [normalizeGlossaryText(value), compact(value)]);
}

export function buildGlossary(language, demos = []) {
  const entries = baseTerms.map((term) => localizedBaseTerm(term, language));
  const keyToEntry = new Map();

  for (const entry of entries) {
    for (const key of searchKeysFor(entry)) {
      if (key) keyToEntry.set(key, entry);
    }
  }

  for (const demo of demos) {
    for (const term of demo.learning?.terms ?? []) {
      const normalizedName = normalizeGlossaryText(term.name);
      const compactName = compact(term.name);
      const source =
        language === 'ru'
          ? `Глава ${demo.number} · ${demo.title}`
          : `Chapter ${demo.number} · ${demo.title}`;
      const existing =
        keyToEntry.get(normalizedName) ?? keyToEntry.get(compactName);

      if (existing) {
        if (!existing.sources.includes(source)) existing.sources.push(source);
        continue;
      }

      const entry = {
        id: `chapter-${demo.id}-${compactName}`,
        term: term.name,
        expansion: '',
        category: language === 'ru' ? 'ТЕРМИН ГЛАВЫ' : 'CHAPTER TERM',
        definition: term.description,
        context:
          language === 'ru'
            ? 'Этот термин уже встречается в подробном словаре выбранной учебной главы.'
            : 'This term also appears in the detailed glossary of its learning chapter.',
        example: '',
        aliases: [
          term.name,
          ...(chapterTermAliases[normalizedName] ?? []),
        ],
        related: [],
        sources: [source],
        kind: 'chapter',
      };

      entries.push(entry);
      for (const key of searchKeysFor(entry)) {
        if (key) keyToEntry.set(key, entry);
      }
    }
  }

  return entries;
}

export function searchGlossary(entries, query, limit = 8) {
  const normalizedQuery = normalizeGlossaryText(query);
  const compactQuery = compact(query);
  if (!normalizedQuery) return [];

  return entries
    .map((entry) => {
      const keys = searchKeysFor(entry);
      let score = 0;

      for (const key of keys) {
        if (key === normalizedQuery || key === compactQuery) {
          score = Math.max(score, 120);
        } else if (
          key.startsWith(normalizedQuery) ||
          key.startsWith(compactQuery)
        ) {
          score = Math.max(score, 90);
        } else if (
          key.includes(normalizedQuery) ||
          key.includes(compactQuery)
        ) {
          score = Math.max(score, 65);
        }
      }

      const body = normalizeGlossaryText(
        `${entry.definition} ${entry.context}`,
      );
      if (body.includes(normalizedQuery)) score = Math.max(score, 35);

      return { entry, score };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.entry.term.localeCompare(right.entry.term),
    )
    .slice(0, limit)
    .map(({ entry }) => entry);
}

export function glossaryTermCount() {
  return baseTerms.length;
}
