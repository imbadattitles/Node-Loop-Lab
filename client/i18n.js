import { cachingEnglish } from './content/caching.en.js';
import { promisesBullMqEnglish } from './content/promises-bullmq.en.js';
import { databaseEnglish } from './content/database.en.js';
import { infrastructureEnglish } from './content/infrastructure.en.js';
import { microservicesEnglish } from './content/microservices.en.js';
import { nestEnglish } from './content/nest.en.js';
import { productionCaseNotesEnglish } from './content/production-case-notes.en.js';
import { productionCasesEnglish } from './content/production-cases.en.js';
import { pythonEnglish } from './content/python.en.js';
import { seniorRuntimeEnglish } from './content/senior-runtime.en.js';
import { sqlBasicsEnglish } from './content/sql-basics.en.js';

export const ui = {
  ru: {
    brandSubtitle: 'runtime observatory',
    serverLive: 'SERVER LIVE',
    connecting: 'CONNECTING',
    offline: 'OFFLINE',
    experiments: 'Эксперименты',
    demoCategories: {
      runtime: {
        title: 'Node.js Runtime',
        description: 'Event Loop · потоки · модели',
      },
      async: {
        title: 'Асинхронность и jobs',
        description: 'Promises · очереди · Redis',
      },
      diagnostics: {
        title: 'Память и production',
        description: 'GC · snapshots · monitoring',
      },
      nestjs: {
        title: 'NestJS',
        description: 'DI · IoC · request lifecycle',
      },
      microservices: {
        title: 'Микросервисы',
        description: 'boundaries · messages · failures',
      },
      databases: {
        title: 'Базы данных',
        description: 'SQL · PostgreSQL · consistency',
      },
      infrastructure: {
        title: 'Контейнеры и оркестрация',
        description: 'Docker · Compose · Kubernetes',
      },
      caching: {
        title: 'Кэширование',
        description: 'Node · Nest · Redis · HTTP',
      },
      python: {
        title: 'Python и CPython',
        description: 'syntax · objects · VM · asyncio',
      },
      other: {
        title: 'Другие темы',
        description: 'Дополнительные главы',
      },
    },
    mentalModel: 'Ментальная модель',
    mentalNote:
      'После каждого callback Node опустошает приоритетные очереди, затем продолжает обход фаз.',
    pythonMentalNote:
      'CPython компилирует code block в bytecode и выполняет его во frame; asyncio подключается как отдельный cooperative scheduler.',
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
    officialResources: 'ОФИЦИАЛЬНЫЕ МАТЕРИАЛЫ',
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
      metrics: 'Prometheus exporter',
      nest: 'NestJS runtime',
      database: 'PostgreSQL runtime',
      python: 'CPython-сценарий',
      bridge: 'Node → CPython bridge',
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
    productionCases: 'PRODUCTION-КЕЙСЫ',
    productionCasesTitle: 'Как учебная ошибка превращается в инцидент',
    productionCasesHint:
      'Реалистичный сервис: исходный код, наблюдаемая проблема, исправление и причина, по которой оно работает.',
    productionCase: 'КЕЙС',
    productionIncident: 'КОНТЕКСТ ИНЦИДЕНТА',
    productionBefore: 'ДО',
    productionAfter: 'ПОСЛЕ',
    productionRisk: 'ПРОБЛЕМНАЯ РЕАЛИЗАЦИЯ',
    productionFix: 'ИСПРАВЛЕННАЯ РЕАЛИЗАЦИЯ',
    productionFunctions: 'ФУНКЦИИ И КОНСТРУКЦИИ',
    productionFunctionsHint:
      'Что делают непривычные вызовы из обоих фрагментов кода.',
    productionExplanation: 'ПОЧЕМУ ИСПРАВЛЕНИЕ РАБОТАЕТ',
    productionSignals: 'ЧТО БЫЛО ВИДНО В PRODUCTION',
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
    closureLeak: 'Замыкание / V8 heap',
    globalCacheLeak: 'Глобальный Map-кэш',
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
    createSnapshot: 'Создать heap snapshot',
    snapshotCreating: 'Snapshot создаётся…',
    heapSnapshot: 'Heap snapshot для Chrome DevTools',
    snapshotWarning:
      'Снимок синхронно блокирует дочерний процесс и может временно потребовать около 2× V8 heap. Поэтому он разрешён только до {limit} MB retained.',
    downloadSnapshot: 'Скачать .heapsnapshot',
    snapshotNotReady: 'Снимок ещё не создан',
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
    demoCategories: {
      runtime: {
        title: 'Node.js Runtime',
        description: 'Event Loop · threads · models',
      },
      async: {
        title: 'Async and jobs',
        description: 'Promises · queues · Redis',
      },
      diagnostics: {
        title: 'Memory and production',
        description: 'GC · snapshots · monitoring',
      },
      nestjs: {
        title: 'NestJS',
        description: 'DI · IoC · request lifecycle',
      },
      microservices: {
        title: 'Microservices',
        description: 'boundaries · messages · failures',
      },
      databases: {
        title: 'Databases',
        description: 'SQL · PostgreSQL · consistency',
      },
      infrastructure: {
        title: 'Containers and orchestration',
        description: 'Docker · Compose · Kubernetes',
      },
      caching: {
        title: 'Caching',
        description: 'Node · Nest · Redis · HTTP',
      },
      python: {
        title: 'Python and CPython',
        description: 'syntax · objects · VM · asyncio',
      },
      other: {
        title: 'Other topics',
        description: 'Additional chapters',
      },
    },
    mentalModel: 'Mental model',
    mentalNote:
      'After each callback, Node drains priority queues and then continues through the event-loop phases.',
    pythonMentalNote:
      'CPython compiles a code block to bytecode and executes it in a frame; asyncio is a separate cooperative scheduler.',
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
    officialResources: 'OFFICIAL RESOURCES',
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
      metrics: 'Prometheus exporter',
      nest: 'NestJS runtime',
      database: 'PostgreSQL runtime',
      python: 'CPython scenario',
      bridge: 'Node → CPython bridge',
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
    productionCases: 'PRODUCTION CASES',
    productionCasesTitle: 'How a learning mistake becomes an incident',
    productionCasesHint:
      'A realistic service: the original code, observable failure, corrected implementation, and why the correction works.',
    productionCase: 'CASE',
    productionIncident: 'INCIDENT CONTEXT',
    productionBefore: 'BEFORE',
    productionAfter: 'AFTER',
    productionRisk: 'PROBLEMATIC IMPLEMENTATION',
    productionFix: 'CORRECTED IMPLEMENTATION',
    productionFunctions: 'FUNCTIONS AND CONSTRUCTS',
    productionFunctionsHint:
      'What the unfamiliar calls from both code samples actually do.',
    productionExplanation: 'WHY THE CORRECTION WORKS',
    productionSignals: 'WHAT PRODUCTION SHOWED',
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
    closureLeak: 'Closure / V8 heap',
    globalCacheLeak: 'Global Map cache',
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
    createSnapshot: 'Create heap snapshot',
    snapshotCreating: 'Creating snapshot…',
    heapSnapshot: 'Heap snapshot for Chrome DevTools',
    snapshotWarning:
      'A snapshot synchronously blocks the child process and may temporarily require about 2× its V8 heap. It is therefore allowed only at or below {limit} MB retained.',
    downloadSnapshot: 'Download .heapsnapshot',
    snapshotNotReady: 'No snapshot has been created',
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
  ...cachingEnglish,
  ...databaseEnglish,
  ...infrastructureEnglish,
  ...microservicesEnglish,
  ...nestEnglish,
  ...pythonEnglish,
  ...seniorRuntimeEnglish,
  ...sqlBasicsEnglish,
  'promises-immediate-bullmq': promisesBullMqEnglish,
  'event-loop-order': {
    title: 'Event Loop order',
    eyebrow: 'Stack → queues → phases',
    summary:
      'Compare synchronous code, nextTick, microtasks, timers, poll, and check in one live run.',
    theory:
      'Lines run top to bottom, but async calls only register callbacks. The current JavaScript always finishes first. At the next boundary Node processes priority work and then continues the Event Loop. nextTick normally precedes Promise after an ordinary callback, but an already-running microtask and top-level ESM change that local order. Timers, I/O, and immediates start according to readiness and phase, not as entries in one global queue.',
    watchFor:
      'The first round records the order of the current async context—do not force it into a mnemonic. Inside an fs.readFile callback, a stricter case is visible: nextTick → Promise, then setImmediate before the newly-created setTimeout(0).',
    expected: [
      'The current synchronous section always finishes before another callback starts.',
      'After an ordinary callback, nextTick and microtasks receive a checkpoint before phases continue.',
      'If scheduling already happens inside a microtask/ESM, Promise may appear before nextTick.',
      'Source order defines registration; FIFO helps only inside a compatible ready queue.',
      'For timers, I/O, and immediates, you need readiness, current phase, and registration location.',
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
        'The Event Loop is the mechanism that lets one JavaScript thread coordinate many tasks. Synchronous code runs now, while timers, network and file operations, and other asynchronous work are registered and return callbacks when ready. The Event Loop repeatedly takes ready work from the appropriate queues and phases, allowing Node to handle many events without creating a separate JavaScript thread for every one of them.',
      foundation:
        'Main-thread Node JavaScript follows run-to-completion: another callback cannot interrupt a running section. After an ordinary callback, Node drains process.nextTick first and then the V8 microtask queue—Promise.then and queueMicrotask—before continuing or advancing the loop. A timer, I/O callback, or setImmediate can start only when ready and when the loop reaches its timers, poll, or check context.',
      why:
        'Prediction needs three questions: where is this code running, which queue or phase owns the callback, and is its source ready? Registration order settles the tie only after those checks—usually inside one ready FIFO queue.',
      resources: [
        {
          label: 'Node.js: Event Loop',
          description:
            'Official guide to timers, poll, check, and setTimeout versus setImmediate.',
          href: 'https://nodejs.org/learn/asynchronous-work/event-loop-timers-and-nexttick',
        },
        {
          label: 'Node.js: process.nextTick',
          description:
            'The nextTick queue, microtasks, and the CommonJS versus ESM distinction.',
          href: 'https://nodejs.org/api/process.html#processnexttickcallback-args',
        },
        {
          label: 'Node.js: Timers',
          description:
            'Why a delay is a threshold and setImmediate uses a separate queue.',
          href: 'https://nodejs.org/api/timers.html',
        },
      ],
      anchorModel: {
        label: 'Anchor model',
        title: 'Execution starts are chosen at boundaries',
        intro:
          'A source line registers a future function. That function can begin only after current JavaScript finishes and its queue context allows it.',
        checkpoints: [
          {
            badge: '01 · Stack',
            title: 'Current JavaScript finishes',
            description:
              'A function or callback runs until return. No timer, Promise, or I/O callback can splice itself into the middle of synchronous work.',
          },
          {
            badge: '02 · Checkpoint',
            title: 'Priority work is checked',
            description:
              'After an ordinary callback, Node drains nextTick and then Promise/queueMicrotask. Work added by them may also join this checkpoint.',
          },
          {
            badge: '03 · Event Loop',
            title: 'The current or next phase continues',
            description:
              'Node takes another ready callback from the phase or moves through poll, check, and timers according to the current loop iteration.',
          },
        ],
        lanes: [
          {
            location: 'Separate Node queue',
            name: 'process.nextTick',
            rule: 'Normally drains before V8 microtasks and can cause starvation when recursively refilled.',
          },
          {
            location: 'V8 microtask queue',
            name: 'Promise / queueMicrotask',
            rule: 'Runs at a checkpoint before phases continue; newly-added microtasks are drained too.',
          },
          {
            location: 'Timers',
            name: 'setTimeout',
            rule: 'Delay is a minimum readiness threshold, not an exact callback start time.',
          },
          {
            location: 'Poll',
            name: 'I/O callback',
            rule: 'Starts after the operation is ready, poll can process it, and the stack is free.',
          },
          {
            location: 'Check',
            name: 'setImmediate',
            rule: 'Waits for check and cannot interrupt a timer or I/O callback that is already running.',
          },
        ],
        callouts: [
          {
            title: 'Why the 1 → 6 ladder is inaccurate',
            text: 'Sync really is first, and nextTick/microtasks receive a checkpoint. But timers, I/O, and immediates are not three positions in a global queue: their relative starts depend on phase, readiness, and registration location.',
          },
          {
            title: 'Where source order still matters',
            text: 'Callbacks in one already-ready FIFO queue are normally taken in insertion order. Do not extend that rule to different queues, different I/O sources, or merely equal delay values.',
          },
        ],
        exampleLabel: 'Two ready timer callbacks in one timers phase',
        example:
          'timer 1 → nextTick from timer 1 → Promise from timer 1 → timer 2 → setImmediate from timer 1',
        footnote:
          'A checkpoint occurs after timer 1, so priority work can appear between two callbacks of one phase. setImmediate waits for check and does not splice into the timers phase.',
      },
      terms: [
        ['Call Stack', 'The functions executing right now. No other callback starts JavaScript while this stack is busy.'],
        ['Callback', 'A function the runtime invokes later after a timer, I/O completion, worker message, or another event.'],
        ['Microtask', 'A high-priority Promise or queueMicrotask continuation, drained between callbacks and phases.'],
        ['Phase', 'A stage of the libuv Event Loop. This lab focuses on timers, poll, and check.'],
        ['Registration', 'The synchronous moment when runtime receives a callback and the conditions for running it later. Registration is not callback execution.'],
      ],
      steps: [
        ['Synchronous code runs', 'Lines are read top to bottom: console.log prints now, while the remaining calls register callbacks.'],
        ['The stack becomes empty', 'Only now can another callback begin JavaScript. This is a selection boundary, not preemption of the current function.'],
        ['A priority checkpoint runs', 'After an ordinary callback Node drains process.nextTick and then Promise.then/queueMicrotask. Top-level ESM and an already-running microtask are separate contexts.'],
        ['Ready phase work is selected', 'Timers checks reached thresholds, poll handles ready I/O, and check runs setImmediate. There is no universal global FIFO between them.'],
        ['The rule repeats after a callback', 'Every completed callback is followed by another checkpoint. nextTick and Promise from timer 1 can therefore start before timer 2.'],
      ],
      nuances: [
        ['Source order is registration order', 'The nextTick line really executes before the Promise line, but their arrow-function bodies run later. Source order alone is not the final console.log order.'],
        ['FIFO applies after context checks', 'Two Promise.then callbacks registered in sequence preserve their order. Two already-ready callbacks of one phase are also normally taken in queue order. This is not a rule for different phases, I/O sources, or readiness times.'],
        ['Timers, immediates, and I/O are not a ladder', 'In the main module, setTimeout(0) and setImmediate may swap. If both are created inside one I/O callback, setImmediate runs before the new timer. I/O itself starts when its operation is ready and the loop can process its callback.'],
        ['nextTick → Promise also needs context', 'After an ordinary callback and in CommonJS, nextTick precedes Promise microtasks. An ES module is evaluated as a microtask; scheduling at top-level ESM or inside another microtask can let Promise/queueMicrotask run before nextTick until control returns to Node.'],
        ['Node version affects old diagrams', 'Since libuv 1.45 / Node 20, timers run only after poll instead of both before and after it. An old article’s diagram may therefore differ from modern Node.'],
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
      examples: [
        {
          title: 'Microtasks between two timers',
          goal:
            'See the checkpoint after every callback, not only after the entire timers phase.',
          code: `setTimeout(() => {
  console.log('timer 1');

  process.nextTick(() => console.log('nextTick from timer 1'));
  Promise.resolve().then(() => console.log('Promise from timer 1'));
  setImmediate(() => console.log('immediate from timer 1'));
}, 0);

setTimeout(() => console.log('timer 2'), 0);`,
          notes: [
            'If both timers are ready in one timers phase: timer 1 → nextTick → Promise → timer 2 → immediate.',
            'nextTick and Promise start after the timer 1 callback returns.',
            'setImmediate waits for check, so it does not interrupt timers processing.',
          ],
        },
        {
          title: 'Immediate and timer inside I/O',
          goal:
            'Pin down a context where the relative order is predictable.',
          code: `import { readFile } from 'node:fs';

readFile(new URL(import.meta.url), () => {
  setTimeout(() => console.log('timer'), 0);
  setImmediate(() => console.log('immediate'));
});

// Here: immediate → timer`,
          notes: [
            'The readFile callback is handled in an I/O/poll context.',
            'After poll, the loop reaches check, so the new immediate runs before the new zero-delay timer.',
            'Do not blindly transfer this result to a top-level main module.',
          ],
        },
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
    learning: {
      ...normalizeLearning(translation.learning),
      productionCases: (productionCasesEnglish[demo.id] ?? []).map(
        (caseStudy) => ({
          ...caseStudy,
          functionNotes: productionCaseNotesEnglish[demo.id] ?? [],
        }),
      ),
    },
  };
}

const memoryMessagesEn = new Map([
  ['Эксперимент ещё не запускался', 'The experiment has not been started yet.'],
  ['Запускаем изолированный процесс…', 'Starting an isolated process…'],
  ['Изолированный процесс остановлен', 'The isolated process has stopped.'],
  ['Дочерний процесс готов', 'The child process is ready.'],
  ['Новый блок сохранён в глобальном массиве', 'A new block was stored in the global array.'],
  ['Замыкание сохранено в долгоживущем массиве и удерживает payload', 'A closure was stored in a long-lived array and retains its payload.'],
  ['Объект сохранён в глобальном Map без TTL и ограничения размера', 'An object was stored in a global Map without TTL or a size bound.'],
  ['Перед heap snapshot выделение памяти поставлено на паузу', 'Allocation was paused before taking the heap snapshot.'],
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
  if (message.startsWith('Хранилища ссылок очищены.')) {
    return 'The reference stores are empty. Run GC and compare heapUsed/external.';
  }
  if (message.startsWith('Создаём heap snapshot:')) {
    return 'Creating a heap snapshot: synchronous V8 heap serialization temporarily blocks the child Event Loop.';
  }
  if (message.startsWith('Heap snapshot готов.')) {
    return 'The heap snapshot is ready. Download it and open Chrome DevTools → Memory → Load.';
  }
  if (message.startsWith('Не удалось создать heap snapshot:')) {
    return message.replace(
      'Не удалось создать heap snapshot:',
      'Could not create the heap snapshot:',
    );
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
  ['Теперь 180 мс CPU-bound JavaScript блокируют один главный isolate', 'Now 180 ms of CPU-bound JavaScript blocks the single main isolate'],
  ['Вывод: дешёвое ожидание I/O даёт throughput, но CPU-параллелизм требует Worker, процессов или другого runtime-подхода', 'Conclusion: inexpensive I/O waiting provides throughput, while CPU parallelism needs Workers, processes, or another runtime approach'],
  ['Prometheus получает эти process/runtime/memory-lab ряды через GET /api/metrics', 'Prometheus obtains these process, runtime, and memory-lab series through GET /api/metrics'],
  ['Создаём короткую контролируемую блокировку, чтобы метрика delay получила сигнал', 'Creating a short controlled block so the delay metric receives a signal'],
  ['Grafana не измеряет процесс сама: она строит панели по временным рядам, которые собрал Prometheus', 'Grafana does not measure the process itself: it builds panels from time series collected by Prometheus'],
  ['Nest читает metadata модуля и строит граф provider tokens', 'Nest reads module metadata and builds the provider-token graph'],
  ['Application context закрыт', 'The application context is closed'],
  ['Отправляем успешный запрос в настоящий ephemeral Nest HTTP server', 'Sending a successful request to a real ephemeral Nest HTTP server'],
  ['Отправляем id=not-a-number: Pipe прерывает normal flow', 'Sending id=not-a-number: the pipe interrupts normal flow'],
  ['Отправляем запрос без доступа: Guard не допускает Interceptor, Pipe и Controller', 'Sending a request without access: the guard prevents the interceptor, pipe, and controller'],
  ['Middleware видит raw HTTP раньше route context; Interceptor знает handler и оборачивает его до/после', 'Middleware sees raw HTTP before route context; the interceptor knows the handler and wraps it before and after'],
  ['Ephemeral Nest HTTP server остановлен', 'The ephemeral Nest HTTP server is stopped'],
  ['Запускаем отдельную Nest application boundary с TCP transport', 'Starting a separate Nest application boundary with TCP transport'],
  ['Checkout вызывает request-response pattern inventory.reserve и ждёт один ответ', 'Checkout calls the inventory.reserve request-response pattern and waits for one response'],
  ['Checkout публикует event order.created и не ждёт business-ответ consumer-а', 'Checkout publishes order.created and does not wait for the consumer business result'],
  ['Микросервисы дают независимые границы deploy и владения данными, но добавляют сеть, partial failures, contracts, observability и delivery semantics', 'Microservices provide independent deployment and data-ownership boundaries, but add networking, partial failures, contracts, observability, and delivery semantics'],
  ['TCP client и Nest microservice остановлены', 'The TCP client and Nest microservice were stopped'],
  ['PostgreSQL не подключён: задайте DATABASE_URL или запустите проект через Docker Compose', 'PostgreSQL is not connected: set DATABASE_URL or run the project with Docker Compose'],
  ['Учебная схема удалена; постоянные данные не создавались', 'The training schema was dropped; no persistent data was created'],
  ['CREATE TABLE описал columns, data types, defaults и constraints таблицы products', 'CREATE TABLE defined the products columns, data types, defaults, and constraints'],
  ['Создаём PRIMARY KEY, UNIQUE, CHECK и FOREIGN KEY как правила целостности внутри БД', 'Creating PRIMARY KEY, UNIQUE, CHECK, and FOREIGN KEY as database integrity rules'],
  ['Параметры $1/$2 переданы отдельно от SQL: значения не становятся частью синтаксиса запроса', 'Parameters $1/$2 were sent separately from SQL, so values never become query syntax'],
  ['ACID: constraints поддерживают consistency, транзакция даёт atomicity, WAL/disk — durability, а isolation управляет видимостью параллельных изменений', 'ACID: constraints support consistency, the transaction provides atomicity, WAL and disk provide durability, and isolation controls visibility of concurrent changes'],
  ['Создаём 40 000 событий с коррелированным временем, tenant_id, status и массивом tags', 'Creating 40,000 events with correlated timestamps, tenant_id, status, and a tags array'],
  ['Индекс не является приказом: planner выбирает Seq Scan, Index Scan или Bitmap Scan по статистике, селективности и стоимости', 'An index is not an instruction: the planner chooses Seq Scan, Index Scan, or Bitmap Scan from statistics, selectivity, and cost'],
  ['Создаём 2 000 клиентов и 30 000 заказов для JOIN и агрегирования', 'Creating 2,000 customers and 30,000 orders for JOIN and aggregation'],
  ['Raw SQL здесь параметризован и видим; ORM полезен, пока команда проверяет сгенерированный SQL, планы, N+1 и границы транзакций', 'Raw SQL is visible and parameterized here; an ORM remains useful while the team inspects generated SQL, plans, N+1, and transaction boundaries'],
  ['Docker client собирает build context; .dockerignore исключает node_modules, .git и секреты', 'The Docker client assembles build context; .dockerignore excludes node_modules, .git, and secrets'],
  ['COPY package*.json расположен до COPY исходников: изменение кода не инвалидирует слой npm ci', 'COPY package*.json precedes source COPY, so a code change does not invalidate the npm ci layer'],
  ['Runtime image получает standalone build, но не исходный build toolchain', 'The runtime image receives the standalone build without the original build toolchain'],
  ['Container запускает node server.js как USER node; init передаёт сигналы и убирает zombie processes', 'The container starts node server.js as USER node; init forwards signals and reaps zombie processes'],
  ['Port mapping 127.0.0.1:3000:3000 публикует container port только на loopback хоста', 'Port mapping 127.0.0.1:3000:3000 publishes the container port only on the host loopback interface'],
  ['Healthcheck проверяет /api/health; healthy не означает, что все внешние зависимости доступны', 'The healthcheck tests /api/health; healthy does not mean every external dependency is available'],
  ['Image — неизменяемый шаблон; container — запущенный process с writable layer и runtime configuration', 'An image is an immutable template; a container is a running process with a writable layer and runtime configuration'],
  ['Новый Pod стал Ready; controller удалил один старый Pod без снижения ready replicas', 'The new Pod became Ready; the controller removed one old Pod without reducing ready replicas'],
  ['Scheduler размещает Pod по requests; limits ограничивают runtime, но не резервируют дополнительный ресурс', 'The scheduler places a Pod by requests; limits bound runtime but do not reserve extra capacity'],
  ['Kubernetes непрерывно сравнивает desired и actual state; controller исправляет расхождение, а Service маршрутизирует только Ready Pods', 'Kubernetes continuously compares desired and actual state; a controller corrects drift while the Service routes only to Ready Pods'],
  ['Без cache три одинаковых чтения трижды занимают repository и connection', 'Without cache, three identical reads occupy the repository and a connection three times'],
  ['In-memory cache принадлежит одному Node process; Redis нужен для общего cache нескольких replicas', 'An in-memory cache belongs to one Node process; multiple replicas need Redis for a shared cache'],
  ['Nest application context и cache store закрыты', 'The Nest application context and cache store are closed'],
  ['Синтаксический сценарий завершён: коллекции, comprehension, unpacking и функции выполнились в CPython', 'The syntax scenario completed: collections, a comprehension, unpacking, and functions ran in CPython'],
  ['Семантический сценарий завершён: объекты, классы, генератор, исключение и context manager наблюдались вживую', 'The semantics scenario completed: objects, classes, a generator, an exception, and a context manager were observed live'],
  ['asyncio.create_task создал Tasks; coroutine bodies ещё ждут передачи управления loop', 'asyncio.create_task created tasks; coroutine bodies are still waiting for control to return to the loop'],
  ['CPython VM и asyncio — разные слои: интерпретатор выполняет bytecode, а библиотечный event loop планирует cooperative Tasks', 'The CPython VM and asyncio are separate layers: the interpreter executes bytecode while a library event loop schedules cooperative tasks'],
  ['CPython не найден. Установите Python 3.11+ или запустите Docker-версию: в image интерпретатор уже включён', 'CPython was not found. Install Python 3.11+ or use the Docker version, whose image already includes the interpreter'],
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
    [/^Интерпретатор: (.+)$/, 'Interpreter: $1'],
    [/^Создан list из (\d+) dict-объектов; имена ссылаются на объекты, а не содержат отдельные типизированные ячейки$/, 'Created a list of $1 dictionaries; names refer to objects instead of containing separate fixed-type cells'],
    [/^List comprehension отфильтровал paid-заказы (.+) и вычислил total=(.+)$/, 'A list comprehension selected paid orders $1 and calculated total=$2'],
    [/^Распаковка sequence: first=(.+), middle=(.+), last=(.+)$/, 'Sequence unpacking: first=$1, middle=$2, last=$3'],
    [/^enumerate дал индекс и значение без ручного счётчика: (.+)$/, 'enumerate produced indexes and values without a manual counter: $1'],
    [/^Функция получила keyword-only argument и вернула: (.+)$/, 'The function received a keyword-only argument and returned: $1'],
    [/^dataclass создал читаемый объект (.+); вычисляемое property subtotal=(.+)$/, 'dataclass created the readable object $1; the computed subtotal property is $2'],
    [/^Два имени указывают на один mutable list: изменение видно через оба имени = (.+)$/, 'Two names point to one mutable list, so both names observe the mutation = $1'],
    [/^Mutable default переиспользован между вызовами: first=(.+); second=(.+)$/, 'A mutable default was reused across calls: first=$1; second=$2'],
    [/^Default None создаёт отдельный list на вызов: first=(.+); second=(.+)$/, 'A None default creates a separate list per call: first=$1; second=$2'],
    [/^Generator вычислял значения лениво и отдал: (.+)$/, 'The generator computed values lazily and yielded: $1'],
    [/^match\/case разобрал форму dict и выбрал ветку: (.+)$/, 'match/case destructured a dictionary and selected: $1'],
    [/^except перехватил ожидаемую ошибку преобразования: (.+)$/, 'except caught the expected conversion error: $1'],
    [/^with вызвал cleanup ресурса: closed=(.+); записано «(.+)»$/, 'with performed resource cleanup: closed=$1; wrote “$2”'],
    [/^(.+) ([\d.]+): GIL активен=(.+)$/, '$1 $2: GIL enabled=$3'],
    [/^compile создал code object; dis показал bytecode operations: (.+)$/, 'compile created a code object; dis reported bytecode operations: $1'],
    [/^Выполняемый code block имеет frame: function=(.+), locals=(.*)$/, 'The executing code block has a frame: function=$1, locals=$2'],
    [/^Цикл ссылок: alive до gc=(.+); gc\.collect\(\) нашёл (\d+); alive после=(.+)$/, 'Reference cycle: alive before gc=$1; gc.collect() found $2; alive after=$3'],
    [/^Task (.+) вошёл в coroutine и дошёл до await$/, 'Task $1 entered its coroutine and reached await'],
    [/^Task (.+) продолжился после готовности awaitable$/, 'Task $1 resumed after its awaitable became ready'],
    [/^asyncio\.gather дождался обеих Tasks; порядок завершения=(.+)$/, 'asyncio.gather awaited both tasks; completion order=$1'],
    [/^time\.sleep внутри coroutine заблокировал event loop; timer опоздал примерно на (.+) мс$/, 'time.sleep inside a coroutine blocked the event loop; the timer was delayed by about $1 ms'],
    [/^asyncio\.to_thread вынес blocking I\/O; timer loop опоздал только примерно на (.+) мс$/, 'asyncio.to_thread offloaded blocking I/O; the loop timer was delayed by only about $1 ms'],
    [/^Проверенные команды: (.+)$/, 'Checked commands: $1'],
    [/^Контекст запуска: /, 'Scheduling context: '],
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
    [/^Регистрируем (\d+) I\/O-подобных ожиданий без \1 JavaScript-потоков$/, 'Registering $1 I/O-like waits without $1 JavaScript threads'],
    [/^Все ожидания зарегистрированы за (.+) мс; стек снова свободен$/, 'All waits were registered in $1 ms; the stack is free again'],
    [/^(\d+) continuations выполнены тем же Event Loop после готовности таймеров$/, '$1 continuations ran on the same Event Loop after their timers became ready'],
    [/^Таймер после CPU-блокировки вошёл в стек через (\d+) мс$/, 'The timer entered the stack $1 ms after the CPU block'],
    [/^До нагрузки: RSS=(\d+) MB, heapUsed=(\d+) MB$/, 'Before load: RSS=$1 MB, heapUsed=$2 MB'],
    [/^Event Loop: p95 delay=(.+) мс, max=(.+) мс, ELU=(.+)%$/, 'Event Loop: p95 delay=$1 ms, max=$2 ms, ELU=$3%'],
    [/^Constructor injection: (.+), environment=(.+)$/, 'Constructor injection: $1, environment=$2'],
    [/^DEFAULT scope: повторный get вернул тот же instance = (true|false)$/, 'DEFAULT scope: a repeated get returned the same instance = $1'],
    [/^useExisting alias указывает на тот же UsersService = (true|false)$/, 'The useExisting alias points to the same UsersService = $1'],
    [/^useFactory получил DI_CONFIG; audit=(.+)$/, 'useFactory received DI_CONFIG; audit=$1'],
    [/^REQUEST scope: context A (.+), context B (.+)$/, 'REQUEST scope: context A $1, context B $2'],
    [/^Внутри одного ContextId instance общий = (true|false); между запросами новый = (true|false)$/, 'One ContextId shares an instance = $1; a different request gets a new one = $2'],
    [/^Inventory получил command inventory\.reserve для order=(.+)$/, 'Inventory received inventory.reserve for order=$1'],
    [/^Получен reservation=(.+); reused=(true|false)$/, 'Received reservation=$1; reused=$2'],
    [/^Повтор operationId=(.+) вернул прежний reservation$/, 'Duplicate operationId=$1 returned the existing reservation'],
    [/^Повторный command не создал вторую запись; reused=(true|false)$/, 'The duplicate command did not create a second record; reused=$1'],
    [/^Notification получил event order\.created для order=(.+)$/, 'Notifications received order.created for order=$1'],
    [/^Remote error пересёк transport boundary: (.+)$/, 'A remote error crossed the transport boundary: $1'],
    [/^Подключён PostgreSQL (.+); создаём изолированную схему (.+)$/, 'Connected to PostgreSQL $1; creating isolated schema $2'],
    [/^Сценарий PostgreSQL остановлен: (.+)$/, 'PostgreSQL scenario stopped: $1'],
    [/^INSERT добавил (\d+) строки; RETURNING вернул generated id без отдельного SELECT$/, 'INSERT added $1 rows; RETURNING exposed generated IDs without another SELECT'],
    [/^SELECT → FROM → WHERE → ORDER BY → LIMIT вернул: (.+)$/, 'SELECT → FROM → WHERE → ORDER BY → LIMIT returned: $1'],
    [/^description = NULL нашёл (\d+); IS NULL нашёл (\d+)$/, 'description = NULL found $1; IS NULL found $2'],
    [/^UPDATE изменил stock и вернул новое значение=(.+)$/, 'UPDATE changed stock and returned the new value=$1'],
    [/^GROUP BY создал (\d+) группы; HAVING фильтрует уже агрегированные группы$/, 'GROUP BY created $1 groups; HAVING filters already aggregated groups'],
    [/^DELETE с WHERE удалил строк=(\d+); без WHERE удалились бы все строки$/, 'DELETE with WHERE removed $1 rows; without WHERE it would remove every row'],
    [/^CHECK отклонил отрицательную сумму: SQLSTATE (.+)$/, 'CHECK rejected a negative amount: SQLSTATE $1'],
    [/^Внутри транзакции строк=(\d+); после ROLLBACK строк=(\d+)$/, 'Rows inside the transaction=$1; rows after ROLLBACK=$2'],
    [/^До составного индекса: (.+); execution=(.+) ms$/, 'Before the composite index: $1; execution=$2 ms'],
    [/^После B-tree: (.+); execution=(.+) ms$/, 'After the B-tree: $1; execution=$2 ms'],
    [/^Размеры индексов: (.+)$/, 'Index sizes: $1'],
    [/^READ COMMITTED: первый SELECT=(.+), второй SELECT=(.+)$/, 'READ COMMITTED: first SELECT=$1, second SELECT=$2'],
    [/^REPEATABLE READ: первый SELECT=(.+), второй SELECT=(.+)$/, 'REPEATABLE READ: first SELECT=$1, second SELECT=$2'],
    [/^SELECT FOR UPDATE: вторая транзакция ждёт блокировку=(true|false)$/, 'SELECT FOR UPDATE: the second transaction is waiting=$1'],
    [/^Пессимистичная блокировка ждала (.+) ms; итоговый balance=(.+)$/, 'The pessimistic lock waited $1 ms; final balance=$2'],
    [/^Оптимистичная версия: update A=(\d+), stale update B=(\d+); 0 означает конфликт$/, 'Optimistic version: update A=$1, stale update B=$2; zero means conflict'],
    [/^JOIN plan: (.+); execution=(.+) ms$/, 'JOIN plan: $1; execution=$2 ms'],
    [/^N\+1: 21 round trips=(.+) ms; один JOIN=1 round trip=(.+) ms$/, 'N+1: 21 round trips=$1 ms; one JOIN=1 round trip=$2 ms'],
    [/^Materialized View: было=(.+), до REFRESH=(.+), после=(.+)$/, 'Materialized View: before=$1, before REFRESH=$2, after=$3'],
    [/^Dockerfile описывает (\d+) стадии: (.+)$/, 'The Dockerfile defines $1 stages: $2'],
    [/^BuildKit строит stage (.+) из immutable base image (.+)$/, 'BuildKit builds stage $1 from immutable base image $2'],
    [/^Deployment принят: desired replicas=(\d+), image=(.+)$/, 'Deployment accepted: desired replicas=$1, image=$2'],
    [/^Actual=(\d+), desired=(\d+): ReplicaSet создаёт (.+)$/, 'Actual=$1, desired=$2: the ReplicaSet creates $3'],
    [/^(.+) прошёл readinessProbe и добавлен в endpoints Service$/, '$1 passed readinessProbe and joined the Service endpoints'],
    [/^Service выбирает по label (\d+) ready Pods из (\d+)$/, 'The Service selects $1 Ready Pods out of $2 by label'],
    [/^(.+) стал NotReady: container продолжает работать, но Service исключил его из трафика$/, '$1 became NotReady: the container keeps running but the Service removes it from traffic'],
    [/^maxSurge=1: создан (.+), старые ready Pods пока обслуживают трафик$/, 'maxSurge=1: $1 was created while old Ready Pods continue serving traffic'],
    [/^Без cache: reads=(\d+), elapsed≈(\d+) мс$/, 'Without cache: reads=$1, elapsed≈$2 ms'],
    [/^MISS (.+): выполняется repository\.findById$/, 'MISS $1: running repository.findById'],
    [/^HIT (.+): repository не вызывается$/, 'HIT $1: the repository is not called'],
    [/^Cache-aside: repository reads=(\d+), elapsed≈(\d+) мс$/, 'Cache-aside: repository reads=$1, elapsed≈$2 ms'],
    [/^После TTL новый MISS добавил repository reads=(\d+)$/, 'After TTL, a new miss added $1 repository read'],
    [/^MISS (.+): запрос присоединён к уже выполняющемуся loader$/, 'MISS $1: the request joined the loader already in progress'],
    [/^Пять одновременных MISS вызвали loader (\d+) раз вместо 5$/, 'Five concurrent misses called the loader $1 time instead of 5'],
    [/^UPDATE записан в primary; ключ (.+) удалён$/, 'The update committed to primary and key $1 was deleted'],
    [/^После invalidation прочитана revision=(\d+), price=(.+)$/, 'After invalidation, revision=$1 and price=$2 were read'],
  ];
  for (const [pattern, replacement] of replacements) {
    if (pattern.test(translated)) return translated.replace(pattern, replacement);
  }
  return translated;
}
