import { promisesBullMqEnglish } from './content/promises-bullmq.en.js';

export const ui = {
  ru: {
    brandSubtitle: 'runtime observatory',
    serverLive: 'SERVER LIVE',
    connecting: 'CONNECTING',
    offline: 'OFFLINE',
    experiments: 'Эксперименты',
    mentalModel: 'Ментальная модель',
    mentalNote:
      'После каждого callback Node опустошает приоритетные очереди, затем продолжает обход фаз.',
    execute: 'ВЫПОЛНИТЬ',
    repeat: 'ПОВТОРИТЬ',
    scenario: 'СЦЕНАРИЙ',
    runScenario: 'Запустить сценарий',
    runAgain: 'Запустить ещё раз',
    running: 'ВЫПОЛНЯЕТСЯ',
    complete: 'ЗАВЕРШЕНО',
    ready: 'ГОТОВ',
    error: 'ОШИБКА',
    connectionLost: 'СВЯЗЬ ПОТЕРЯНА',
    processId: 'PROCESS ID',
    currentServer: 'текущий сервер',
    uptime: 'UPTIME',
    sinceStart: 'после запуска',
    loopDelay: 'LOOP DELAY P95',
    utilization: 'UTILIZATION',
    eventLoop: 'event loop',
    roundtrip: 'HTTP ROUNDTRIP',
    browserServer: 'browser → server',
    liveTrace: 'LIVE TRACE',
    timeline: 'Временная шкала',
    memoryChart: 'График памяти',
    clear: 'Очистить',
    clearChart: 'Очистить график',
    eventsAppear: 'События появятся здесь',
    runSelected: 'Запустите выбранный сценарий',
    waitingRun: 'Ожидаю запуск эксперимента…',
    time: 'ВРЕМЯ',
    source: 'ИСТОЧНИК',
    event: 'СОБЫТИЕ',
    theory: 'Теория',
    code: 'Код',
    simplifiedCode: 'Упрощённый код',
    runtimeCode: 'Runtime-код',
    howItWorks: 'КАК ЭТО РАБОТАЕТ',
    watch: 'На что смотреть',
    expected: 'ОЖИДАЕМЫЙ РЕЗУЛЬТАТ',
    simplified: 'УПРОЩЁННЫЙ ФРАГМЕНТ',
    copy: 'Копировать',
    copied: 'Скопировано',
    simplifiedCodeNote:
      'Это короткая модель идеи. Она намеренно не содержит измерения времени, emit-события, ожидание завершения и обработку всех ошибок.',
    fullImplementation:
      'Полная реализация с инструментированием находится в',
    chapter: 'ГЛАВА',
    deepDive: 'ПОДРОБНЫЙ РАЗБОР · ОТ БАЗЫ К КОДУ',
    chapterPrefix: 'Разбираем:',
    chapterHint:
      'Этот раздел можно читать до запуска опыта. После теории вернитесь к live trace и сопоставьте каждый шаг с реальным событием.',
    plainLanguage: 'СНАЧАЛА ПРОСТЫМИ СЛОВАМИ',
    technicalFoundation: 'ТЕХНИЧЕСКАЯ ОСНОВА',
    whyKnow: 'Зачем это знать',
    whereRuns: 'ГДЕ ВЫПОЛНЯЕТСЯ РАБОТА',
    yourCode: 'ВАШ JS-КОД',
    operatingSystem: 'ОПЕРАЦИОННАЯ СИСТЕМА',
    glossary: 'СЛОВАРЬ',
    experimentTerms: 'Термины этого эксперимента',
    termsHint: 'Сначала поймите слова — затем порядок выполнения.',
    mechanics: 'МЕХАНИКА',
    stepsTitle: 'Что происходит по шагам',
    stepsHint: 'Каждый шаг соответствует наблюдаемому состоянию runtime.',
    context: 'КОНТЕКСТ',
    nuancesTitle: 'Где результат требует оговорки',
    nuancesHint:
      'Эти детали объясняют, почему похожий код иногда даёт другой trace.',
    codeInView: 'КОД ПЕРЕД ГЛАЗАМИ',
    connectTheory: 'Свяжите теорию со строками JavaScript',
    codeLearningPath: 'Теория, упрощённая модель и фактический runtime-код',
    theoryLevelHint:
      'Сначала разберитесь, какие части Node участвуют в выполнении.',
    simplifiedLevelHint:
      'Затем уберите служебные детали и рассмотрите только главную идею.',
    runtimeLevelHint:
      'После этого сопоставьте модель с кодом, который создаёт live trace.',
    simplifiedCodeTitle: 'Минимальная модель без служебного кода',
    runtimeCodeTitle: 'Полный код, который выполняет сценарий',
    runtimeCodeSectionHint:
      'Это не альтернативный пример: ниже показаны функции и файлы, используемые кнопкой запуска.',
    runtimeExactSource: 'ФАКТИЧЕСКИЙ SOURCE',
    runtimeCodeHint:
      'Код сформирован из реальной серверной функции. Для сценариев с отдельным процессом или Worker показаны все участвующие файлы.',
    runtimeCopy: 'КОПИРОВАТЬ ФАЙЛ',
    runtimeCopied: 'ФАЙЛ СКОПИРОВАН',
    runtimeFiles: 'Файлы runtime-сценария',
    runtimeRoles: {
      scenario: 'сценарий',
      worker: 'Worker Thread',
      supervisor: 'supervisor',
      child: 'дочерний процесс',
    },
    codeLines: 'строк',
    runtimeTraceConnection:
      'Именно вызовы emit(...) превращаются в строки live trace. await и Promise удерживают HTTP-поток открытым до завершения сценария.',
    runtimeCodeUnavailable: 'Для этого сценария runtime-source пока недоступен.',
    copyExample: 'КОПИРОВАТЬ ПРИМЕР',
    copiedExample: 'СКОПИРОВАНО',
    educationalSnippet: 'src/demos.js · учебный фрагмент',
    howReadCode: 'КАК ЧИТАТЬ ЭТОТ КОД',
    readThisWay: 'ЧИТАЙТЕ ТАК',
    executionDirection: 'регистрация → ожидание → готовность → callback',
    recipes: 'РЕЦЕПТЫ',
    recipesTitle: 'Практические шаблоны, которые можно подсмотреть',
    recipesHint:
      'Сравнивайте цель, код и оговорки — не запоминайте синтаксис без модели.',
    doNotConfuse: 'НЕ ПЕРЕПУТАЙТЕ',
    misconceptions: 'Популярные заблуждения',
    misconceptionHint: 'Миф слева, корректная модель справа.',
    myth: 'МИФ',
    actual: 'НА САМОМ ДЕЛЕ',
    selfCheck: 'САМОПРОВЕРКА',
    explainYourself: 'Ответьте своими словами',
    selfCheckHint:
      'Если ответ получается объяснить без терминов из документации, ментальная модель уже начала складываться.',
    safeMode: 'БЕЗОПАСНЫЙ РЕЖИМ',
    startLeak: 'Запустить утечку',
    startAgain: 'Запустить снова',
    processActive: 'ПРОЦЕСС АКТИВЕН',
    memoryRetained: 'Память удерживается',
    isolation: 'ИЗОЛЯЦИЯ',
    starting: 'Запускается…',
    startStatus: 'ЗАПУСК',
    limit: 'ЛИМИТ',
    growthStopped: 'Рост остановлен',
    pause: 'ПАУЗА',
    processPaused: 'Процесс на паузе',
    leakActive: 'УТЕЧКА АКТИВНА',
    isolatedManual: 'Изолированный процесс · ручной запуск',
    safetyDescription:
      'Максимум 512 MB retained, аварийный предел 768 MB RSS, автопауза через 2 минуты. Основной сервер не хранит «утёкшие» объекты.',
    privateModeTitle: 'Личный режим · расширенные лимиты',
    privateSafetyDescription:
      'Максимум {retained} MB retained, аварийный предел {rss} MB RSS, автопауза через {duration} секунд. Основной сервер не хранит «утёкшие» объекты.',
    publicModeTitle: 'Публичный режим · принудительное завершение',
    publicSafetyDescription:
      'Максимум {retained} MB retained и {rss} MB RSS. Через {duration} секунд дочерний процесс завершается и возвращает память контейнеру.',
    memoryKind: 'ТИП ПАМЯТИ',
    perStep: 'ЗА ОДИН ШАГ',
    interval: 'ИНТЕРВАЛ',
    retainedLimit: 'RETAINED LIMIT',
    bufferExternal: 'Buffer / external',
    arrayHeap: 'Array / V8 heap',
    mixed: 'Mixed 50 / 50',
    retained: 'RETAINED',
    blocks: 'блоков',
    heapUsed: 'HEAP USED',
    v8Objects: 'объекты V8',
    external: 'EXTERNAL',
    childRss: 'CHILD RSS',
    memoryOverTime: 'MEMORY OVER TIME',
    pauseAction: 'Пауза',
    resumeAction: 'Продолжить',
    releaseRefs: 'Освободить ссылки',
    callGc: 'Вызвать GC',
    stopProcess: 'Остановить процесс',
    memoryOff: 'Эксперимент выключен. Память не выделяется.',
    creatingProcess: 'Создаём изолированный Node-процесс…',
    fontSize: 'Размер текста',
    normalText: 'Обычный',
    largeText: 'Крупный',
    language: 'Язык',
    mainProjectLink: 'NNEON · Статьи на 90 языках',
    opensNewTab: 'откроется в новой вкладке',
    glossarySearch: 'Поиск по словарю',
    glossarySearchPlaceholder: 'Найти термин: I/O, API, RSS…',
    glossaryResults: 'Термины',
    glossaryNoResults:
      'Термин не найден. Попробуйте сокращение, полное название или перевод.',
    glossaryTermCount: 'терминов в индексе',
    glossaryKeyboardHint: '↑↓ выбрать · Enter открыть · Esc закрыть',
    glossaryMeaning: 'ЧТО ЭТО ЗНАЧИТ',
    glossaryInLab: 'ГДЕ ЭТО В ЛАБОРАТОРИИ',
    glossaryExample: 'ПРИМЕР',
    glossaryAppearsIn: 'РАЗОБРАНО В ГЛАВАХ',
    glossaryRelated: 'СВЯЗАННЫЕ ТЕРМИНЫ',
    glossaryClose: 'Закрыть карточку термина',
  },
  en: {
    brandSubtitle: 'runtime observatory',
    serverLive: 'SERVER LIVE',
    connecting: 'CONNECTING',
    offline: 'OFFLINE',
    experiments: 'Experiments',
    mentalModel: 'Mental model',
    mentalNote:
      'After each callback, Node drains priority queues and then continues through the event-loop phases.',
    execute: 'RUN',
    repeat: 'RUN AGAIN',
    scenario: 'SCENARIO',
    runScenario: 'Run scenario',
    runAgain: 'Run one more time',
    running: 'RUNNING',
    complete: 'COMPLETED',
    ready: 'READY',
    error: 'ERROR',
    connectionLost: 'CONNECTION LOST',
    processId: 'PROCESS ID',
    currentServer: 'current server',
    uptime: 'UPTIME',
    sinceStart: 'since startup',
    loopDelay: 'LOOP DELAY P95',
    utilization: 'UTILIZATION',
    eventLoop: 'event loop',
    roundtrip: 'HTTP ROUNDTRIP',
    browserServer: 'browser → server',
    liveTrace: 'LIVE TRACE',
    timeline: 'Timeline',
    memoryChart: 'Memory chart',
    clear: 'Clear',
    clearChart: 'Clear chart',
    eventsAppear: 'Events will appear here',
    runSelected: 'Run the selected scenario',
    waitingRun: 'Waiting for an experiment…',
    time: 'TIME',
    source: 'SOURCE',
    event: 'EVENT',
    theory: 'Theory',
    code: 'Code',
    simplifiedCode: 'Simplified code',
    runtimeCode: 'Runtime code',
    howItWorks: 'HOW IT WORKS',
    watch: 'What to watch',
    expected: 'EXPECTED RESULT',
    simplified: 'SIMPLIFIED SNIPPET',
    copy: 'Copy',
    copied: 'Copied',
    simplifiedCodeNote:
      'This is a compact model of the idea. It intentionally omits timing instrumentation, emit events, completion tracking, and some error handling.',
    fullImplementation: 'The fully instrumented implementation lives in',
    chapter: 'CHAPTER',
    deepDive: 'DEEP DIVE · FROM BASICS TO CODE',
    chapterPrefix: 'Understanding:',
    chapterHint:
      'You can read this chapter before running the experiment. Then return to the live trace and match each concept to a real event.',
    plainLanguage: 'FIRST, IN PLAIN LANGUAGE',
    technicalFoundation: 'TECHNICAL FOUNDATION',
    whyKnow: 'Why it matters',
    whereRuns: 'WHERE THE WORK RUNS',
    yourCode: 'YOUR JS CODE',
    operatingSystem: 'OPERATING SYSTEM',
    glossary: 'GLOSSARY',
    experimentTerms: 'Terms used in this experiment',
    termsHint: 'Understand the words first, then the execution order.',
    mechanics: 'MECHANICS',
    stepsTitle: 'What happens step by step',
    stepsHint: 'Each step maps to an observable runtime state.',
    context: 'CONTEXT',
    nuancesTitle: 'Where the result needs context',
    nuancesHint:
      'These details explain why similar code can sometimes produce a different trace.',
    codeInView: 'CODE IN VIEW',
    connectTheory: 'Connect the theory to JavaScript lines',
    codeLearningPath: 'Theory, simplified model, and actual runtime code',
    theoryLevelHint:
      'First understand which parts of Node participate in execution.',
    simplifiedLevelHint:
      'Then remove instrumentation and focus on the central mechanism.',
    runtimeLevelHint:
      'Finally match the model to the code that produces the live trace.',
    simplifiedCodeTitle: 'A minimal model without instrumentation',
    runtimeCodeTitle: 'The complete code executed by the scenario',
    runtimeCodeSectionHint:
      'This is not an alternative example: these are the functions and files used by the Run button.',
    runtimeExactSource: 'ACTUAL SOURCE',
    runtimeCodeHint:
      'The source is generated from the real server function. Scenarios using a child process or Worker include every participating file.',
    runtimeCopy: 'COPY FILE',
    runtimeCopied: 'FILE COPIED',
    runtimeFiles: 'Runtime scenario files',
    runtimeRoles: {
      scenario: 'scenario',
      worker: 'Worker Thread',
      supervisor: 'supervisor',
      child: 'child process',
    },
    codeLines: 'lines',
    runtimeTraceConnection:
      'The emit(...) calls become live-trace rows. await and Promise keep the HTTP stream open until the scenario completes.',
    runtimeCodeUnavailable: 'Runtime source is not available for this scenario yet.',
    copyExample: 'COPY EXAMPLE',
    copiedExample: 'COPIED',
    educationalSnippet: 'src/demos.js · educational snippet',
    howReadCode: 'HOW TO READ THIS CODE',
    readThisWay: 'READ IT AS',
    executionDirection: 'registration → waiting → readiness → callback',
    recipes: 'RECIPES',
    recipesTitle: 'Practical patterns worth keeping nearby',
    recipesHint:
      'Compare the goal, code, and caveats instead of memorizing syntax without a model.',
    doNotConfuse: 'DO NOT CONFUSE',
    misconceptions: 'Common misconceptions',
    misconceptionHint: 'The myth is on the left; the accurate model is on the right.',
    myth: 'MYTH',
    actual: 'ACTUALLY',
    selfCheck: 'SELF-CHECK',
    explainYourself: 'Explain it in your own words',
    selfCheckHint:
      'If you can explain the answer without quoting documentation, your mental model is starting to take shape.',
    safeMode: 'SAFE MODE',
    startLeak: 'Start memory leak',
    startAgain: 'Start again',
    processActive: 'PROCESS ACTIVE',
    memoryRetained: 'Memory is retained',
    isolation: 'ISOLATION',
    starting: 'Starting…',
    startStatus: 'STARTING',
    limit: 'LIMIT',
    growthStopped: 'Growth stopped',
    pause: 'PAUSED',
    processPaused: 'Process is paused',
    leakActive: 'LEAK ACTIVE',
    isolatedManual: 'Isolated process · manual start',
    safetyDescription:
      'Maximum 512 MB retained, 768 MB emergency RSS threshold, and an automatic pause after 2 minutes. The main server never stores leaked objects.',
    privateModeTitle: 'Private mode · extended limits',
    privateSafetyDescription:
      'Maximum {retained} MB retained, {rss} MB emergency RSS threshold, and an automatic pause after {duration} seconds. The main server never stores leaked objects.',
    publicModeTitle: 'Public mode · forced termination',
    publicSafetyDescription:
      'Maximum {retained} MB retained and {rss} MB RSS. After {duration} seconds the child process exits and returns its memory to the container.',
    memoryKind: 'MEMORY TYPE',
    perStep: 'PER STEP',
    interval: 'INTERVAL',
    retainedLimit: 'RETAINED LIMIT',
    bufferExternal: 'Buffer / external',
    arrayHeap: 'Array / V8 heap',
    mixed: 'Mixed 50 / 50',
    retained: 'RETAINED',
    blocks: 'blocks',
    heapUsed: 'HEAP USED',
    v8Objects: 'V8 objects',
    external: 'EXTERNAL',
    childRss: 'CHILD RSS',
    memoryOverTime: 'MEMORY OVER TIME',
    pauseAction: 'Pause',
    resumeAction: 'Resume',
    releaseRefs: 'Release references',
    callGc: 'Run GC',
    stopProcess: 'Stop process',
    memoryOff: 'The experiment is off. No memory is being allocated.',
    creatingProcess: 'Creating an isolated Node process…',
    fontSize: 'Text size',
    normalText: 'Comfortable',
    largeText: 'Large',
    language: 'Language',
    mainProjectLink: 'NNEON · Articles in 90 languages',
    opensNewTab: 'opens in a new tab',
    glossarySearch: 'Search the glossary',
    glossarySearchPlaceholder: 'Find a term: I/O, API, RSS…',
    glossaryResults: 'Terms',
    glossaryNoResults:
      'No term found. Try an abbreviation, full name, or translation.',
    glossaryTermCount: 'terms in the index',
    glossaryKeyboardHint: '↑↓ select · Enter open · Esc close',
    glossaryMeaning: 'WHAT IT MEANS',
    glossaryInLab: 'WHERE IT APPEARS IN THE LAB',
    glossaryExample: 'EXAMPLE',
    glossaryAppearsIn: 'COVERED IN CHAPTERS',
    glossaryRelated: 'RELATED TERMS',
    glossaryClose: 'Close term card',
  },
};

const englishDemos = {
  'promises-immediate-bullmq': promisesBullMqEnglish,
  'event-loop-order': {
    title: 'Event Loop order',
    eyebrow: 'Stack → queues → phases',
    summary:
      'Compare synchronous code, nextTick, microtasks, timers, poll, and check in one live run.',
    theory:
      'Lines run top to bottom, but async calls on those lines only register callbacks. Once the stack is empty, Node selects work by queue and phase: in this HTTP-run context nextTick precedes Promise, setTimeout belongs to timers, and setImmediate belongs to check. Top-level ESM and timer/immediate require additional context.',
    watchFor:
      'When launched from an HTTP callback, setImmediate can run before the timer written above it. Inside one fs.readFile callback, setImmediate is guaranteed to precede setTimeout(0); in a standalone main module, the last two can swap.',
    expected: [
      'Synchronous messages always come first.',
      'In this callback context, process.nextTick runs before Promise/queueMicrotask.',
      'Microtasks run before Node moves to the next phase.',
      'Source order determines registration, but not always callbacks from different queues.',
      'You cannot memorize one universal order for setTimeout(0) and setImmediate.',
    ],
    code: `console.log('sync'); // Runs now

// These lines register callbacks from top to bottom:
process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('Promise'));
setTimeout(() => console.log('timer'), 0);
setImmediate(() => console.log('immediate'));

// Their bodies run later according to queue and phase rules.`,
    learning: {
      plain:
        'Imagine one cook and several priority shelves. Notes are written top to bottom, but that is not yet the cooking order. After finishing the current action, the cook chooses the next job by shelf and context. In a normal callback, Node checks nextTick, then microtasks, and then continues through Event Loop phases.',
      foundation:
        'JavaScript in a Node process normally follows run-to-completion on one main thread: a running function is not interrupted by another callback. Call lines execute top to bottom, but nextTick, then, setTimeout, and setImmediate only register functions for later. Once the stack is empty, queue priority can outweigh visual source order.',
      why:
        'Registration order predicts work inside one queue, while queue and phase rules decide between work categories. Mixing these levels leads to races, starvation, and tests that pass only in one environment.',
      terms: [
        ['Call Stack', 'The functions executing right now. No other callback starts JavaScript while this stack is busy.'],
        ['Callback', 'A function the runtime invokes later after a timer, I/O completion, worker message, or another event.'],
        ['Microtask', 'A high-priority Promise or queueMicrotask continuation, drained between callbacks and phases.'],
        ['Phase', 'A stage of the libuv Event Loop. This lab focuses on timers, poll, and check.'],
        ['Registration', 'The synchronous moment when runtime receives a callback and the conditions for running it later. Registration is not callback execution.'],
      ],
      steps: [
        ['Synchronous code runs', 'Lines are read top to bottom: console.log prints now, while the remaining calls register callbacks.'],
        ['The stack becomes empty', 'Node is now able to select deferred work.'],
        ['nextTick is drained', 'In this HTTP experiment, process.nextTick uses a special Node queue and precedes Promise.'],
        ['Microtasks are drained', 'Promise.then and queueMicrotask run, including new microtasks they enqueue.'],
        ['Phases continue', 'The loop moves to ready timers, poll I/O, and setImmediate in check.'],
      ],
      nuances: [
        ['Source order is registration order', 'The nextTick line really executes before the Promise line, but their arrow-function bodies run later. Source order alone is not the final console.log order.'],
        ['FIFO matters inside one queue', 'Two Promise.then callbacks registered in sequence normally keep that order. nextTick and Promise use different queues, so queue priority can overtake an earlier line.'],
        ['Timer versus immediate needs location', 'In the main module, setTimeout(0) and setImmediate may swap. If both are created inside the same I/O callback, setImmediate runs first. Node 20 also changed where timers run relative to poll.'],
        ['Top-level ESM is an exception', 'An ES module is itself evaluated as a microtask, so Promise can precede nextTick in a standalone ESM file. The lab registers them from an HTTP callback and shows nextTick → Promise.'],
      ],
      pitfalls: [
        ['Node has one global event queue.', 'There are multiple queues and phases with different priority rules.'],
        ['setTimeout(fn, 0) runs fn immediately.', 'Zero is a minimum delay; the callback still waits for its phase and a free stack.'],
        ['Async code can interrupt current JavaScript.', 'A callback starts only after the current JavaScript finishes.'],
        ['A callback from the higher source line must run first.', 'That only holds under compatible rules, such as one FIFO queue. Different queues apply their priorities and phase rules first.'],
        ['process.nextTick is always before Promise.', 'That is the normal callback and CommonJS order. During top-level ESM evaluation, Promise/microtasks can get ahead.'],
      ],
      codeIntro:
        'The first line executes console.log immediately. The next four lines run top to bottom only as registrations. Predict their arrow-function bodies using the queue, phase, and location from which the snippet runs.',
      codeNotes: [
        'console.log runs immediately in the current call stack.',
        'process.nextTick and Promise.then are registered in source order but use different queues.',
        'Promise.then becomes a microtask; top-level ESM changes its comparison with nextTick.',
        'setTimeout and setImmediate belong to different phases, so the earlier timer line does not guarantee an earlier callback.',
      ],
      questions: [
        'Why does the Promise callback not run inside Promise.resolve()?',
        'What happens to a timer while the current function runs for five seconds?',
        'When does source order remain callback order, and when does a queue override it?',
      ],
    },
  },
  'event-demultiplexer': {
    title: 'Event demultiplexer',
    eyebrow: 'Many sources → one thread',
    summary:
      'Start a timer, file read, and DNS lookup together, then observe ready callbacks returning to JavaScript.',
    theory:
      'An event demultiplexer is the platform mechanism through which libuv learns which I/O sources are ready. Linux commonly uses epoll, macOS uses kqueue, and Windows uses IOCP. Some operations, including regular files and some DNS calls, are delegated to the libuv thread pool.',
    watchFor:
      'All registrations finish almost immediately. Readiness arrives in an arbitrary order, but JavaScript callbacks still enter the main stack one at a time.',
    expected: [
      'Three operations are registered without waiting for results.',
      'The JavaScript thread stays free between registration and callbacks.',
      'A fast operation does not have to wait for a slow one.',
      'On this successful run, Promise.all completes after every source and returns results in input order.',
    ],
    learning: {
      plain:
        'Think of a hotel dispatcher. They do not stand at every door and repeatedly ask whether a room is ready. Services report readiness, and the dispatcher forwards those notifications to one receptionist: the JavaScript thread.',
      foundation:
        'Node registers async work with libuv and returns control to the application. libuv uses OS readiness for sockets, usually delegates regular files and dns.lookup to its native thread pool, and tracks timers as time thresholds. These internal paths converge when callbacks return to JavaScript.',
      why:
        'This model lets one process handle many connections without creating one JavaScript thread per request.',
      terms: [
        ['Event source', 'A readiness source such as a socket, timer, file operation, DNS request, or worker message.'],
        ['Demultiplexer', 'A mechanism that waits for many sources and returns the subset that is ready.'],
        ['libuv', 'The native Node library that unifies the Event Loop and async operations across operating systems.'],
        ['Poll', 'The phase that handles many ready I/O callbacks and may wait for additional events.'],
      ],
      steps: [
        ['Registration', 'JavaScript starts a timer, readFile, and DNS without waiting in place.'],
        ['Delegation', 'libuv uses a timer structure, an OS facility, or its native thread pool.'],
        ['Free stack', 'Node can process other requests while the sources are not ready.'],
        ['Readiness signal', 'The OS/libuv reports which source has completed.'],
        ['Callback', 'The ready function enters the JavaScript stack when it is free.'],
      ],
      nuances: [
        ['Not every source follows one path', 'A network socket usually uses epoll, kqueue, or IOCP; a regular file often uses the thread pool; a timer is a time-threshold check. “Demultiplexer” is a useful shared model, not one universal object behind every API.'],
        ['dns.lookup differs from dns.resolve', 'dns.lookup uses the system resolver and usually the shared libuv pool. dns.resolve* methods issue DNS requests through another path. “DNS” alone does not identify the mechanism.'],
        ['Promise.all starts nothing', 'readFile, lookup, and the timer start while the expressions above are evaluated. Promise.all receives already-created Promises, preserves result order, and coordinates waiting.'],
        ['Fast rejection is not cancellation', 'On the success path Promise.all waits for all three results. If one Promise rejects, the aggregate rejects early, but the remaining operations are not automatically canceled.'],
      ],
      pitfalls: [
        ['Node repeatedly calls every function to ask whether it is ready.', 'Waiting is performed by efficient OS and libuv mechanisms.'],
        ['Every async operation creates a new thread.', 'Sockets usually use OS readiness; only some APIs use a limited thread pool.'],
        ['Parallel completion means parallel JavaScript callbacks.', 'Callbacks still enter a single JavaScript environment one at a time.'],
        ['Promise.all starts and cancels its operations.', 'The operations are normally already running. Cancellation needs a separate mechanism such as AbortSignal when the specific API supports it.'],
      ],
      codeIntro:
        'The three operations begin registration while the first expressions are evaluated. Promise.all does not make them sequential or parallel; it receives already-created Promises and aggregates their result.',
      codeNotes: [
        'readFile and lookup are delegated to Node/libuv.',
        'setTimeout registers a deadline without blocking the thread.',
        'Promise.all preserves result order even when readiness arrives in another order.',
        'A rejected Promise.all does not cancel the other operations.',
      ],
      questions: [
        'Why does a fast DNS lookup not have to wait for a slow timer?',
        'Which part differs between a network socket and a regular file?',
      ],
    },
  },
  'callback-queue': {
    title: 'Callback queue',
    eyebrow: 'One stack, many ready tasks',
    summary:
      'Five zero-delay timers show how one expensive callback delays the entire queue.',
    theory:
      'A ready callback is not necessarily running. It waits until the JavaScript stack is free. After each callback, Node also processes nextTick and microtasks before taking the next task from the phase. The lab latency is measured from timer registration, not from an internal readiness timestamp.',
    watchFor:
      'Callbacks #2–#5 show large latency because callback #1 blocks the stack. The trace value starts at timer registration rather than the exact internal readiness moment. Its nextTick and Promise run before #2.',
    expected: [
      'All timers are registered in one synchronous pass.',
      'Callback #1 blocks the main thread for about 260 ms.',
      'The remaining callbacks cannot bypass that block.',
      'nextTick/microtasks run before the next timer callback.',
      'The displayed delay includes the timer threshold and waiting for a free stack.',
    ],
    learning: {
      plain:
        'Imagine one service window. Five people may already be ready, but the clerk handles only one person at a time. If the first customer takes a long time, everyone else waits.',
      foundation:
        'A queue stores ready work; it does not execute it. The JavaScript call stack remains the executor. After every callback, priority nextTick and microtask queues may run before the next timer callback. This lab measures from registration, so its number is broader than pure queue waiting time.',
      why:
        'Queue delay affects the latency of the entire server. One slow callback can delay thousands of otherwise independent connections.',
      terms: [
        ['Queue', 'A waiting structure. Being queued does not mean the callback is currently executing.'],
        ['Lag', 'Delay relative to an expected moment. Here the value is total time since registration, including the minimum timer threshold and stack waiting.'],
        ['Run-to-completion', 'The current callback runs until it returns; the Event Loop does not preempt it.'],
        ['Starvation', 'A priority queue keeps refilling and prevents other phases from receiving execution time.'],
      ],
      steps: [
        ['Five registrations', 'All setTimeout(0) calls are created in one short synchronous loop.'],
        ['Timers become ready', 'Their minimum deadline passes, but the stack may still be busy.'],
        ['First callback blocks', 'A CPU loop owns the only main JavaScript stack for about 260 ms.'],
        ['Priority queues run', 'nextTick and Promise from the first callback run before timer #2.'],
        ['The queue drains', 'The remaining callbacks execute quickly, one after another.'],
      ],
      nuances: [
        ['setTimeout(0) is not ready instantly', 'Zero defines a minimum threshold, not an immediate call. The timer must become eligible, the Event Loop must reach timers, and the stack must be free.'],
        ['The trace is not pure queue wait', 'The experiment counts milliseconds from common registration. That is useful end-to-end latency, but exact queue wait would require a separate timestamp for each timer’s internal readiness.'],
        ['FIFO here is controlled, not global', 'Five identical timers are created by one loop and normally run in registration order. Do not extend that result to callbacks from different phases, I/O sources, or threads.'],
        ['Microtasks can cause starvation', 'After callback #1, Node runs its nextTick and Promise before timer #2. If nextTick recursively keeps adding itself, other Event Loop phases can be starved.'],
      ],
      pitfalls: [
        ['Ready callbacks execute simultaneously.', 'Readiness grants the right to wait, not parallel JavaScript execution.'],
        ['All queues are globally strict FIFO.', 'FIFO may apply inside a structure, while work categories follow different priority rules.'],
        ['Timer delay means the clock is inaccurate.', 'It usually indicates a busy stack, a saturated phase, or process load.'],
        ['Five expired timers mean five parallel executors.', 'They only become candidates for execution; one main JavaScript stack still processes callbacks sequentially.'],
      ],
      codeIntro:
        'The first callback intentionally performs expensive synchronous work. The other four timers cannot bypass it even though their delay is also zero.',
      codeNotes: [
        'The loop registers callbacks but does not execute them.',
        'heavyCpuWork occupies the current stack.',
        'The next timer log appears only after the expensive function returns.',
        'Displayed time starts at registration, not at the timer’s internal readiness signal.',
      ],
      questions: [
        'Why does callback #2 receive roughly 260 ms of lag?',
        'Can a Promise inside callback #1 run before callback #2?',
      ],
    },
  },
  'blocking-vs-worker': {
    title: 'Blocking vs Worker',
    eyebrow: 'CPU-bound work',
    summary:
      'Compare a heartbeat gap caused by main-thread blocking with the same calculation in a Worker Thread.',
    theory:
      'Asynchronous Node does not automatically make JavaScript multithreaded. A long synchronous calculation blocks HTTP, timers, and every callback in the process. Worker Threads provide a separate JavaScript thread and Event Loop for CPU-bound work, while remaining in the same process and competing for its CPU and memory.',
    watchFor:
      'Part A contains a large heartbeat gap. In part B, the Worker is busy calculating while main-thread heartbeats continue.',
    expected: [
      'A synchronous CPU loop freezes the Event Loop.',
      'Expired timers cannot interrupt running JavaScript.',
      'A Worker Thread does not execute the calculation on the server Event Loop, though it can compete for CPU.',
      'The Worker-to-main message becomes an async callback.',
      'The experiment compares responsiveness; it does not promise that a short task becomes faster.',
    ],
    code: `// Bad on the main thread:
heavyCpuWork(360);

// Move CPU-bound work out:
const worker = new Worker('./cpu-worker.js');
worker.on('message', result => {
  console.log(result);
});`,
    learning: {
      plain:
        'The main thread is like the only emergency operator. If they spend minutes calculating a spreadsheet, they stop answering calls. A Worker is another operator that can perform the calculation while the first line stays available.',
      foundation:
        'The Event Loop scales waiting for I/O, not CPU-bound JavaScript. A Worker Thread creates a separate V8 isolate, call stack, and Event Loop inside the same process. Data is exchanged through structured cloning, transfer lists, or SharedArrayBuffer.',
      why:
        'Blocking the main thread delays every route, timer, and client in the process. Workers preserve responsiveness but require a bounded pool and careful data transfer.',
      terms: [
        ['Main Thread', 'The thread running Express, HTTP callbacks, and the primary application JavaScript.'],
        ['CPU-bound', 'Work whose speed is limited by CPU calculation rather than waiting for an external resource.'],
        ['Worker Thread', 'A separate Node JavaScript environment with its own V8 isolate.'],
        ['Message passing', 'Data exchange through postMessage; values are cloned, transferred, or shared.'],
      ],
      steps: [
        ['Main heartbeat', 'A timer creates control events roughly every 70 ms.'],
        ['Blocking', 'A synchronous CPU loop does not return control to the Event Loop.'],
        ['Accumulated lag', 'The heartbeat cannot interrupt the calculation and runs only afterward.'],
        ['Worker creation', 'The same calculation idea runs in a separate V8 isolate.'],
        ['Result message', 'Main keeps producing heartbeats and later receives an async message callback.'],
      ],
      nuances: [
        ['Responsive does not mean faster', 'The experiment proves that the main thread stays available. It does not guarantee lower compute time: Worker creation, isolate startup, and data transfer all have a cost.'],
        ['Threads still share CPU', 'The Worker is separate from the server Event Loop but competes for cores, memory, and the same process/container cgroup. Heartbeats may still jitter on a saturated CPU.'],
        ['A Worker is not a child process', 'A Worker has its own V8 isolate and JavaScript heap but remains inside the same process and can use shared memory. Isolation is weaker than child_process, while communication is usually cheaper.'],
        ['Large messages have a cost', 'Normal values use structured cloning. Large ArrayBuffers can transfer ownership through a transfer list; SharedArrayBuffer requires application-level synchronization.'],
      ],
      pitfalls: [
        ['Wrapping a calculation in async moves it to another thread.', 'async changes the return value to a Promise; synchronous body code still runs in the current thread.'],
        ['A Promise makes work parallel.', 'A Promise models a future value; the API decides where the work executes.'],
        ['Create a new Worker for every HTTP request.', 'Isolate startup is expensive; production systems usually use a bounded worker pool.'],
        ['A Worker is guaranteed to speed up every task.', 'A short task may become slower because of startup and messaging. The primary win in this lab is main-thread responsiveness.'],
      ],
      codeIntro:
        'The first call blocks main. The Worker version runs another file while main subscribes to the result message and remains responsive.',
      codeNotes: [
        'A Worker is not a callback in the same thread; it is another JavaScript environment.',
        'The message event itself is processed by the main Event Loop.',
        'Worker errors and exits must be handled explicitly.',
        'Production systems normally reuse Workers instead of creating an isolate for every small task.',
      ],
      questions: [
        'Why can setInterval not interrupt a while loop?',
        'Which values are expensive to send through structured cloning?',
      ],
    },
  },
  'libuv-thread-pool': {
    title: 'libuv thread pool',
    eyebrow: 'Hidden parallelism',
    summary:
      'Six PBKDF2 jobs reveal the native thread-pool queue and the callbacks returning to the Event Loop.',
    theory:
      'Some Node APIs use the shared libuv thread pool: crypto, zlib, parts of fs and DNS. It has four threads by default unless UV_THREADPOOL_SIZE is set before Node starts. This is not Worker Threads: application JavaScript does not run there; a native operation does, and its callback returns to the Event Loop.',
    watchFor:
      'With the default pool, the first four jobs may finish close together and the remaining jobs in a second wave. CPU and machine load affect the exact result.',
    expected: [
      'Six jobs are submitted almost immediately.',
      'The main JavaScript thread does not calculate PBKDF2.',
      'Pool size limits concurrently serviced jobs but does not guarantee the same number of physical CPU cores.',
      'Result callbacks return to the main Event Loop.',
    ],
    learning: {
      plain:
        'Think of a small kitchen behind the dining room. The JavaScript waiter quickly submits six orders. Only four cooks are available, so two orders wait even though the waiter is free to serve other guests.',
      foundation:
        'The libuv pool executes selected native operations that cannot use normal OS readiness or are computationally expensive. Application JavaScript does not execute in this pool. The pool is shared by the process, and completed native work posts a callback back to the Event Loop.',
      why:
        'The shared pool can become a hidden bottleneck: expensive crypto can increase the latency of unrelated fs or DNS work.',
      terms: [
        ['Native operation', 'C/C++ code inside Node or a library, rather than your application JavaScript.'],
        ['Thread pool', 'A fixed number of reusable threads with a queue of jobs in front of them.'],
        ['UV_THREADPOOL_SIZE', 'An environment variable that sets shared pool size when the Node process starts.'],
        ['PBKDF2', 'A computationally expensive key-derivation function used here to create observable pool work.'],
      ],
      steps: [
        ['Six submissions', 'JavaScript quickly calls async pbkdf2 six times.'],
        ['Pool queue', 'Free native threads take jobs; the remaining jobs wait.'],
        ['Main is free', 'The Event Loop can handle HTTP while native threads calculate.'],
        ['First wave', 'With the default pool, roughly four jobs often complete close together.'],
        ['Result callbacks', 'Each native completion returns to the main Event Loop.'],
      ],
      nuances: [
        ['Pool size is not physical core count', 'UV_THREADPOOL_SIZE=4 permits up to four pool jobs, but the OS and CPU decide how much work truly runs at once. A busy or low-core machine may not show clean waves.'],
        ['Set the variable before Node starts', 'The pool is initialized early, so pass UV_THREADPOOL_SIZE in the process or container environment. Changing process.env later is not a reliable live reconfiguration.'],
        ['A free Event Loop can still be slow', 'Main does not calculate PBKDF2, but native threads compete for the same CPU. A saturated shared pool also delays unrelated fs, crypto, and some DNS operations that use it.'],
        ['Waves are an observation, not a contract', 'Equal iteration counts do not guarantee strict completion order. OS scheduling, CPU frequency, and other load can mix the callbacks.'],
      ],
      pitfalls: [
        ['The libuv pool and Worker Threads are the same.', 'The pool runs native API functions; a Worker runs your JavaScript in another isolate.'],
        ['A larger UV_THREADPOOL_SIZE is always faster.', 'After CPU saturation, more threads add contention and context switching.'],
        ['Every asynchronous Node API uses this pool.', 'Network sockets usually use OS readiness without one thread per operation.'],
        ['A free main thread means the load cannot affect HTTP.', 'CPU contention and a saturated shared pool can still increase latency even when JavaScript is not blocked.'],
      ],
      codeIntro:
        'All six native jobs are created synchronously. Async pbkdf2 delegates calculation to the pool, while its callback records when each result returns.',
      codeNotes: [
        'The number of calls can exceed the pool size.',
        'The pool queue is outside the JavaScript snippet.',
        'Completion order does not have to match submission order.',
        'UV_THREADPOOL_SIZE applies to the whole process, not only this loop.',
      ],
      questions: [
        'Why can job #5 wait while the Event Loop is free?',
        'What happens to fs.readFile when the shared pool is fully occupied?',
      ],
    },
  },
  'memory-leak': {
    title: 'Memory leak',
    eyebrow: 'Retained references → rising RSS',
    summary:
      'A controlled leak in an isolated process: watch heap, external, and RSS, release references, and then run GC.',
    theory:
      'Memory leaks when the application keeps references to objects it no longer needs. The garbage collector sees those objects as reachable and is not allowed to remove them. Buffer primarily increases external memory, arrays live in the V8 heap, and RSS is the process total.',
    watchFor:
      'While blocks remain in the global array, even manual GC cannot reduce retained memory. After Release references, the objects become collectible; compare the metrics after GC.',
    expected: [
      'The experiment allocates nothing before manual start.',
      'Retained and heapUsed/external grow in steps.',
      'Pause stops growth but does not release objects.',
      'Release removes references, allowing GC to reclaim memory.',
      'Retained is a block estimate; heap, external, and RSS show different views of memory.',
      'Application safeguards pause growth automatically, while Docker adds a 2 GB hard limit to the whole container.',
    ],
    code: `let leakedBlocks = [];

setInterval(() => {
  // The reference remains reachable from global scope:
  leakedBlocks.push(Buffer.alloc(4 * 1024 * 1024));
  console.log(process.memoryUsage());
}, 500);

// Remove the references first:
leakedBlocks = [];
// Only now can GC reclaim the objects.`,
    learning: {
      plain:
        'The garbage collector is like a cleaner who discards only ownerless items. If unused boxes remain listed in a global inventory, the cleaner assumes they are needed. Remove the references first; only then can memory be reclaimed.',
      foundation:
        'GC starts from roots such as globals, active stacks, closures, and internal handles. Everything reachable from those roots is alive. A leak usually means the program accidentally preserves a path from a root to data that is no longer useful. Lab metrics are different, partially overlapping views of memory.',
      why:
        'Long-term growth causes more frequent and longer GC pauses, swapping, slowdown, and eventually out-of-memory termination. Different memory types appear in different metrics.',
      terms: [
        ['Heap Used', 'The managed V8 heap occupied by JavaScript objects, arrays, strings, and metadata.'],
        ['External', 'Memory connected to JavaScript objects but stored outside the V8 heap, such as Buffer backing stores.'],
        ['RSS', 'Total resident process memory: heap, native code, stacks, buffers, and other mapped pages.'],
        ['Retained', 'Data kept alive by references. Here it is the controlled estimate of blocks stored in an array.'],
        ['GC root', 'A starting point for garbage-collector traversal, such as global scope or an active stack.'],
        ['Reachable', 'An object connected to a GC root through references; the collector is not allowed to remove it.'],
      ],
      steps: [
        ['Manual start', 'Express creates a separate Node process with a V8 heap cap and application safeguards.'],
        ['Allocation', 'A timer creates a Buffer, Array, or mixed block.'],
        ['Retention', 'The block reference is pushed into the global retainedBlocks array.'],
        ['Pause', 'New blocks stop, but existing blocks remain reachable and occupy memory.'],
        ['Release + GC', 'Clearing the array removes the path from a root, so GC can collect the blocks.'],
        ['Stop', 'Terminating the child process guarantees that all of its memory returns to the OS.'],
      ],
      nuances: [
        ['Retained is a lab counter', 'It sums the requested sizes of blocks kept in the array. It is not the exact retained size from a heap snapshot or actual RSS; objects also have runtime overhead.'],
        ['Metrics partially overlap', 'arrayBuffers is included in external, while RSS contains heap, external, code, stacks, and other pages. Adding heapUsed + external + arrayBuffers + RSS produces double counting.'],
        ['Release, GC, and OS return are separate', 'Removing references only makes objects unreachable. GC later releases them to the allocator, and the allocator may keep pages for reuse, so RSS does not have to fall immediately.'],
        ['A safeguard is not always a hard quota', 'Retained, RSS, and time thresholds are enforced by code, while --max-old-space-size limits V8 heap rather than total process memory. The Docker cgroup in compose.yml provides a hard 2 GB total for server plus child.'],
      ],
      pitfalls: [
        ['Any RSS increase proves a leak.', 'An allocator may retain free pages for reuse. Look for a sustained trend under repeatable load.'],
        ['global.gc() can remove any object I no longer want.', 'GC does not understand business intent. A reachable object is alive.'],
        ['Stable heapUsed means there is no leak.', 'Buffer/external, native allocations, handles, or other non-heap resources may still grow.'],
        ['const keeps an object alive forever.', 'Lifetime is determined by reachability, not by the let or const keyword.'],
        ['Adding every displayed number gives process memory.', 'The metrics have different boundaries and overlap. RSS is the total resident view; the other metrics help explain its composition.'],
      ],
      codeIntro:
        'The critical line is push into an array that outlives individual operations. While the array is reachable from global scope, every Buffer it contains is reachable too.',
      codeNotes: [
        'Buffer.alloc primarily increases external/arrayBuffers.',
        'leakedBlocks.push creates a long-lived retaining reference.',
        'Assigning [] breaks the references but does not promise an immediate RSS decrease.',
        'Manual GC is only for observation; production code should not use it as a leak treatment.',
        'Retained in the UI is a controlled block-size estimate, not heap-profiler output.',
      ],
      questions: [
        'Why does GC before clearing the array not reduce retained memory?',
        'Why may RSS remain high after successful cleanup?',
        'Which metric best reveals a Buffer leak?',
      ],
    },
  },
};

function normalizeLearning(learning) {
  return {
    ...learning,
    terms: learning.terms.map(([name, description]) => ({ name, description })),
    steps: learning.steps.map(([title, description]) => ({ title, description })),
    nuances: learning.nuances.map(([title, description]) => ({ title, description })),
    pitfalls: learning.pitfalls.map(([myth, fact]) => ({ myth, fact })),
  };
}

export function localizeDemo(demo, language) {
  if (language === 'ru') return demo;
  const translation = englishDemos[demo.id];
  if (!translation) return demo;

  return {
    ...demo,
    ...translation,
    code: translation.code ?? demo.code,
    learning: normalizeLearning(translation.learning),
  };
}

const memoryMessagesEn = new Map([
  ['Эксперимент ещё не запускался', 'The experiment has not been started yet.'],
  ['Запускаем изолированный процесс…', 'Starting an isolated process…'],
  ['Изолированный процесс остановлен', 'The isolated process has stopped.'],
  ['Дочерний процесс готов', 'The child process is ready.'],
  ['Новый блок сохранён в глобальном массиве', 'A new block was stored in the global array.'],
  ['Добавление блоков поставлено на паузу', 'Block allocation is paused.'],
  ['Добавление блоков продолжено', 'Block allocation has resumed.'],
  ['Ссылки удалены; объекты теперь доступны сборщику мусора', 'References were removed; the objects are now collectible.'],
  ['Выполнены два явных прохода global.gc()', 'Two explicit global.gc() passes completed.'],
  ['Эксперимент остановлен', 'The experiment was stopped.'],
  ['Автопауза через две минуты', 'Automatically paused after two minutes.'],
  ['Автоостановка по лимиту времени', 'Automatically stopped at the public time limit.'],
  ['Достигнут выбранный лимит удерживаемой памяти', 'The selected retained-memory limit was reached.'],
  ['Достигнут лимит удерживаемой памяти', 'The retained-memory limit was reached.'],
]);

export function translateMemoryMessage(message, language) {
  if (language === 'ru' || !message) return message;
  if (memoryMessagesEn.has(message)) return memoryMessagesEn.get(message);
  if (message.startsWith('Эксперимент запущен:')) {
    return message
      .replace('Эксперимент запущен:', 'Experiment started:')
      .replace('каждые', 'every')
      .replace('мс, лимит', 'ms, limit');
  }
  if (message.startsWith('Глобальный массив очищен.')) {
    return 'The global array is empty. Run GC and compare heapUsed/external.';
  }
  if (message.startsWith('GC завершён.')) {
    return 'GC completed. RSS may stay above baseline because the allocator can retain free pages for reuse.';
  }
  if (message.startsWith('Сработал лимит времени:')) {
    return 'The time limit was reached: the experiment was paused automatically.';
  }
  if (message.startsWith('Сработал публичный лимит времени:')) {
    return 'The public time limit was reached: the experiment was stopped automatically.';
  }
  if (message.startsWith('Аварийная пауза: RSS достиг')) {
    return message.replace(
      'Аварийная пауза: RSS достиг',
      'Emergency pause: RSS reached',
    );
  }
  if (message.startsWith('Сначала освободите ссылки')) {
    return 'Release the references first, or start a new run with a larger limit.';
  }
  if (message.includes('Новые блоки больше не создаются')) {
    const reason = message.split('.')[0];
    return `${translateMemoryMessage(reason, language)}. No new blocks will be allocated.`;
  }
  if (message.startsWith('Supervisor остановил процесс')) {
    return 'The supervisor stopped the process because it crossed the emergency RSS threshold.';
  }
  if (message.startsWith('Процесс завершился:')) {
    return message.replace('Процесс завершился:', 'Process exited:');
  }
  return message;
}

const exactTraceEn = new Map([
  ['Синхронный код начал выполняться', 'Synchronous code started executing'],
  ['Callbacks зарегистрированы; синхронный стек сейчас освободится', 'Callbacks registered; the synchronous stack is about to become empty'],
  ['process.nextTick callback', 'process.nextTick callback'],
  ['Promise.then microtask', 'Promise.then microtask'],
  ['queueMicrotask callback', 'queueMicrotask callback'],
  ['setTimeout(0) callback', 'setTimeout(0) callback'],
  ['setImmediate callback', 'setImmediate callback'],
  ['Запускаем fs.readFile и переходим к I/O-раунду', 'Starting fs.readFile and moving to the I/O round'],
  ['Callback fs.readFile: сейчас мы внутри poll-фазы', 'fs.readFile callback: currently inside the poll phase'],
  ['nextTick, созданный внутри I/O', 'nextTick created inside I/O'],
  ['Promise, созданный внутри I/O', 'Promise created inside I/O'],
  ['setImmediate, созданный внутри I/O', 'setImmediate created inside I/O'],
  ['setTimeout(0), созданный внутри I/O', 'setTimeout(0) created inside I/O'],
  ['Регистрируем три независимые операции', 'Registering three independent operations'],
  ['Таймер 180 мс передан подсистеме таймеров', 'A 180 ms timer was delegated to the timer subsystem'],
  ['Чтение package.json делегировано libuv', 'Reading package.json was delegated to libuv'],
  ['DNS lookup localhost делегирован libuv', 'localhost DNS lookup was delegated to libuv'],
  ['JS-стек свободен; Event Loop ожидает сигналы готовности, а не опрашивает каждую функцию вручную', 'The JS stack is free; the Event Loop waits for readiness signals instead of manually polling every function'],
  ['Таймер готов: callback вернулся в JavaScript', 'Timer ready: callback returned to JavaScript'],
  ['Одновременно ставим пять setTimeout(0)', 'Scheduling five setTimeout(0) calls together'],
  ['Callback #1 занимает главный поток на 260 мс', 'Callback #1 occupies the main thread for 260 ms'],
  ['Callback #1 освободил стек', 'Callback #1 released the stack'],
  ['nextTick из callback #1 вклинился перед следующим таймером', 'nextTick from callback #1 ran before the next timer'],
  ['Promise из callback #1 тоже выполнен перед следующим таймером', 'Promise from callback #1 also ran before the next timer'],
  ['Очередь не исполняет callbacks параллельно: каждый ждёт свободный стек', 'The queue does not execute callbacks in parallel: each one waits for a free stack'],
  ['Часть A — CPU-работа в главном потоке', 'Part A — CPU work on the main thread'],
  ['Блокируем главный поток примерно на 360 мс', 'Blocking the main thread for about 360 ms'],
  ['Часть B — та же работа в Worker Thread', 'Part B — the same work in a Worker Thread'],
  ['CPU-задача отправлена отдельному Worker', 'CPU task sent to a separate Worker'],
  ['Сравните разрыв heartbeat в части A с равномерными событиями в части B', 'Compare the heartbeat gap in part A with the steady events in part B'],
  ['Главный JS-поток сразу свободен; вычисления идут в пуле libuv', 'The main JS thread is immediately free; calculations run in the libuv pool'],
  ['UV_THREADPOOL_SIZE=4 (по умолчанию)', 'UV_THREADPOOL_SIZE=4 (default)'],
  ['Создаём Promise: executor выполняется синхронно прямо сейчас', 'Creating a Promise: its executor runs synchronously right now'],
  ['executor вызвал resolve(2)', 'The executor called resolve(2)'],
  ['Код после resolve ещё выполняется, но повторно изменить outcome уже нельзя', 'Code after resolve still runs, but the outcome can no longer be changed'],
  ['then/catch/setImmediate зарегистрированы; текущий стек освобождается', 'then/catch/setImmediate registered; the current stack is becoming empty'],
  ['finally выполнился без подмены успешного результата', 'finally ran without replacing the fulfilled result'],
  ['setImmediate callback выполняется в check-фазе', 'The setImmediate callback runs in the check phase'],
  ['await setImmediate() из node:timers/promises продолжил функцию в check-фазе', 'await setImmediate() from node:timers/promises resumed the function in the check phase'],
  ['BullMQ-пример пропущен: задайте REDIS_URL или запустите проект через Docker Compose', 'BullMQ example skipped: set REDIS_URL or run the project with Docker Compose'],
  ['Queue.add сохраняет job в Redis; HTTP-запрос не выполняет job сам', 'Queue.add stores the job in Redis; the HTTP request does not process the job itself'],
]);

export function translateTraceMessage(message, language, demos = []) {
  if (language === 'ru' || !message) return message;
  if (exactTraceEn.has(message)) return exactTraceEn.get(message);

  const demoTitlePairs = demos.map((demo) => [
    demo.originalTitle ?? demo.title,
    demo.title,
  ]);
  let translated = message;
  for (const [russianTitle, englishTitle] of demoTitlePairs) {
    translated = translated.replace(`«${russianTitle}»`, `“${englishTitle}”`);
  }

  const replacements = [
    [/^Запуск /, 'Starting '],
    [/^Сценарий завершён за (\d+) мс$/, 'Scenario completed in $1 ms'],
    [/^Первый раунд: /, 'First round: '],
    [/^Внутри I\/O: /, 'Inside I/O: '],
    [/^Файл готов: получено (\d+) байт$/, 'File ready: received $1 bytes'],
    [/^DNS готов: /, 'DNS ready: '],
    [/^Все источники готовы: /, 'All sources are ready: '],
    [/^Таймер #(\d+) зарегистрирован$/, 'Timer #$1 registered'],
    [/^Callback #(\d+) взят из очереди \(через (\d+) мс\)$/, 'Callback #$1 taken from the queue after $2 ms'],
    [/^Пульс main #(\d+); задержка (\d+) мс$/, 'Main heartbeat #$1; lag $2 ms'],
    [/^Главный поток снова свободен .*$/, 'The main thread is free again'],
    [/^Worker закончил за (\d+) мс;.*$/, 'Worker finished in $1 ms while main kept producing heartbeats'],
    [/^Синхронно запускаем (\d+) вызовов crypto\.pbkdf2$/, 'Synchronously submitting $1 crypto.pbkdf2 calls'],
    [/^PBKDF2 #(\d+) отправлен в пул$/, 'PBKDF2 #$1 submitted to the pool'],
    [/^PBKDF2 #(\d+) вернулся через (\d+) мс$/, 'PBKDF2 #$1 returned after $2 ms'],
    [/^Все (\d+) задач завершены за (\d+) мс$/, 'All $1 jobs completed in $2 ms'],
    [/^Первый then получил (\d+) и вернул (\d+)$/, 'The first then received $1 and returned $2'],
    [/^Второй then дождался Promise и получил (\d+)$/, 'The second then awaited a Promise and received $1'],
    [/^catch обработал: (.+)$/, 'catch handled: $1'],
    [/^Цепочка завершилась значением (.+); catch вернул (.+)$/, 'The chain fulfilled with $1; catch returned $2'],
    [/^Promise\.all сохранил входной порядок: (.+)$/, 'Promise.all preserved input order: $1'],
    [/^Promise\.allSettled вернул статусы: (.+)$/, 'Promise.allSettled returned statuses: $1'],
    [/^Promise\.race: первым завершился (.+)$/, 'Promise.race: $1 settled first'],
    [/^BullMQ Worker взял job (.+): (.+)$/, 'BullMQ Worker picked job $1: $2'],
    [/^Redis хранит job (.+) в состоянии waiting$/, 'Redis stores job $1 in the waiting state'],
    [/^QueueEvents получил completed для job (.+): (.+)$/, 'QueueEvents received completed for job $1: $2'],
    [/^Ошибка BullMQ Worker: (.+)$/, 'BullMQ Worker error: $1'],
    [/^BullMQ недоступен: (.+)\. Promise-часть сценария уже выполнена\.$/, 'BullMQ is unavailable: $1. The Promise section has already completed.'],
  ];
  for (const [pattern, replacement] of replacements) {
    if (pattern.test(translated)) return translated.replace(pattern, replacement);
  }
  return translated;
}
