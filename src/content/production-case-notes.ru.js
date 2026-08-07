export const productionCaseNotesRu = {
  'event-loop-order': [
    {
      term: 'orders.insert(input)',
      description:
        'Асинхронный метод репозитория: записывает заказ в БД и возвращает Promise с созданным заказом.',
    },
    {
      term: 'setImmediate(callback)',
      description:
        'Регистрирует callback для check-фазы Event Loop. Он не означает «выполни строго после следующей строки».',
    },
    {
      term: 'await promise',
      description:
        'Приостанавливает только текущую async-функцию. После settlement её продолжение будет поставлено в очередь microtasks.',
    },
    {
      term: 'broker.publish(...)',
      description:
        'Отправляет событие брокеру сообщений. В корректном API возвращает Promise, чтобы вызывающий код мог дождаться подтверждения.',
    },
    {
      term: 'transactional outbox',
      description:
        'Заказ и запись о будущем событии сохраняются одной DB-транзакцией, а отдельный publisher позднее отправляет событие.',
    },
  ],

  'event-demultiplexer': [
    {
      term: 'catalog.get(id)',
      description:
        'Условный HTTP-клиент или repository-метод: начинает I/O и возвращает Promise с ответом внешнего сервиса.',
    },
    {
      term: 'AbortSignal.timeout(800)',
      description:
        'Создаёт сигнал отмены, который сработает через 800 мс. Клиент должен поддерживать AbortSignal, иначе timeout ничего не прервёт.',
    },
    {
      term: 'Promise.all([...])',
      description:
        'Сразу подписывается на все переданные Promise и выполняется, когда готовы все; при первом rejection отклоняет общий Promise.',
    },
    {
      term: '[product, stock, price]',
      description:
        'Деструктуризация результата. Promise.all сохраняет порядок входного массива, а не порядок фактического завершения запросов.',
    },
  ],

  'callback-queue': [
    {
      term: '@Controller / @Post',
      description:
        'Nest-декораторы: связывают класс с группой маршрутов, а метод — с HTTP POST endpoint.',
    },
    {
      term: '@Body() input',
      description:
        'Nest извлекает тело HTTP-запроса и передаёт его параметром метода. DTO описывает ожидаемую структуру данных.',
    },
    {
      term: 'bcrypt.hashSync(...)',
      description:
        'Синхронно вычисляет password hash и до возврата удерживает главный JavaScript-поток.',
    },
    {
      term: 'cost = 12',
      description:
        'Параметр стоимости bcrypt: каждый следующий шаг экспоненциально увеличивает объём вычислений, поэтому значение выбирают по измерениям.',
    },
    {
      term: 'await bcrypt.hash(...)',
      description:
        'Асинхронная версия передаёт тяжёлую native-работу в thread pool и возвращает Promise с готовым hash.',
    },
    {
      term: 'constructor(private users: UsersService)',
      description:
        'Constructor injection Nest: IoC-контейнер создаёт UsersService и передаёт его контроллеру.',
    },
  ],

  'blocking-vs-worker': [
    {
      term: '@Get / @Param',
      description:
        'Nest регистрирует GET-маршрут, а @Param извлекает динамический :id из URL.',
    },
    {
      term: 'new StreamableFile(buffer)',
      description:
        'Nest-обёртка для отправки Buffer или Stream как файла. Она не переносит вычисление самого файла в другой поток.',
    },
    {
      term: 'renderInvoicePdf(invoice)',
      description:
        'Условная синхронная CPU-heavy функция: строит PDF и возвращает Buffer, всё это время блокируя текущий isolate.',
    },
    {
      term: 'queue.add(name, data, options)',
      description:
        'BullMQ сохраняет job в Redis. data — сериализуемые входные данные, options задают id, retry и другие правила.',
    },
    {
      term: '@InjectQueue(name)',
      description:
        'Nest BullMQ внедряет Queue с указанным зарегистрированным именем через DI-контейнер.',
    },
    {
      term: '@Processor / WorkerHost',
      description:
        'Nest BullMQ регистрирует отдельный consumer очереди; метод process получает Job и выполняет фоновую работу.',
    },
  ],

  'libuv-thread-pool': [
    {
      term: 'pbkdf2Async(...)',
      description:
        'Promise-обёртка над crypto.pbkdf2: native-вычисление выполняется в общем libuv thread pool.',
    },
    {
      term: 'users.map(...)',
      description:
        'Синхронно обходит весь массив и сразу создаёт по Promise на пользователя; сам map не ограничивает concurrency.',
    },
    {
      term: 'pLimit(4)',
      description:
        'Создаёт ограничитель, который одновременно запускает не более четырёх переданных ему async-функций.',
    },
    {
      term: 'chunks(users, 25)',
      description:
        'Учебный helper, разбивающий большой массив на части по 25 элементов, чтобы ограничить временные Promise и память.',
    },
  ],

  'memory-leak': [
    {
      term: '@Body() input',
      description:
        'Nest передаёт DTO из тела запроса. Если closure захватит input, весь связанный payload останется достижимым.',
    },
    {
      term: 'emitter.on(event, listener)',
      description:
        'Добавляет постоянный listener в EventEmitter. Он останется там до явного off/removeListener.',
    },
    {
      term: 'parseCsv(input.csv)',
      description:
        'Условная функция превращает большой CSV в массив объектов; захват этого массива особенно заметен в heap snapshot.',
    },
    {
      term: 'queue.add(...)',
      description:
        'Сохраняет небольшое описание фоновой задачи в Redis вместо удержания request closure внутри HTTP-процесса.',
    },
    {
      term: 'objectKey',
      description:
        'Небольшой идентификатор файла в S3-совместимом object storage; worker позднее скачает CSV по этому ключу.',
    },
    {
      term: '@HttpCode(HttpStatus.ACCEPTED)',
      description:
        'Заставляет Nest вернуть HTTP 202: работа принята, но будет завершена асинхронно.',
    },
  ],

  'promises-immediate-bullmq': [
    {
      term: 'ids.map(async (...) => ...)',
      description:
        'Сразу создаёт массив Promise. map не ждёт async-callback и не объединяет его результаты в один Promise.',
    },
    {
      term: 'await <обычный массив>',
      description:
        'Возвращает этот массив практически сразу: await ожидает thenable, а массив Promise сам по себе thenable не является.',
    },
    {
      term: 'Promise.all(promises)',
      description:
        'Создаёт общий Promise завершения всей партии и сохраняет порядок результатов по исходному массиву.',
    },
    {
      term: 'pLimit(10)',
      description:
        'Не позволяет партии создать больше десяти одновременных операций против БД или внешнего API.',
    },
    {
      term: '@HttpCode(204)',
      description:
        'Nest вернёт No Content только после того, как Promise метода контроллера действительно завершится.',
    },
  ],

  'runtime-models': [
    {
      term: 'ledger.history(userId)',
      description:
        'Условный I/O-вызов истории операций. await освобождает stack, пока БД или внешний сервис готовит ответ.',
    },
    {
      term: 'calculateRisk(history)',
      description:
        'Условная синхронная CPU-heavy функция. async-контроллер не делает её автоматически параллельной.',
    },
    {
      term: 'workerPool.run(data)',
      description:
        'Передаёт сериализуемое задание свободному Worker Thread и возвращает Promise с результатом.',
    },
    {
      term: 'maxQueue',
      description:
        'Верхняя граница ожидающих worker-задач. При переполнении сервис должен быстро отказать, а не бесконечно расходовать память.',
    },
    {
      term: '@Inject(RISK_POOL)',
      description:
        'Nest внедряет pool по DI-token, поэтому его размер, lifecycle и тестовую замену контролирует модуль.',
    },
  ],

  'memory-diagnostics': [
    {
      term: 'setTimeout(callback, delay)',
      description:
        'Создаёт Timer, который до срабатывания удерживает callback и все захваченные им ссылки.',
    },
    {
      term: 'closure',
      description:
        'Функция вместе с доступом к внешним переменным. В примере callback продолжает удерживать webhook payload.',
    },
    {
      term: 'retryQueue.add(...)',
      description:
        'Сохраняет retry как durable job: задача переживает перезапуск процесса и не зависит от живого Timer.',
    },
    {
      term: 'parseAndEnrich(...)',
      description:
        'Условная функция разбора и обогащения payload; результат становится большим объектом, который нежелательно захватывать Timer-ом.',
    },
    {
      term: 'retryStore.insert(...)',
      description:
        'Записывает состояние повтора в постоянное хранилище и возвращает маленькую запись с id и рассчитанной задержкой.',
    },
    {
      term: 'delay / jobId',
      description:
        'delay откладывает запуск job, а стабильный jobId помогает не поставить один и тот же retry в очередь повторно.',
    },
  ],

  'production-observability': [
    {
      term: 'NestInterceptor',
      description:
        'Nest-компонент, оборачивающий выполнение выбранного controller handler до и после его вызова.',
    },
    {
      term: 'ExecutionContext',
      description:
        'Даёт interceptor доступ к controller, handler и транспортному контексту текущего запроса.',
    },
    {
      term: 'next.handle()',
      description:
        'Запускает дальнейшую Nest pipeline и возвращает RxJS Observable с результатом handler.',
    },
    {
      term: 'finalize(callback)',
      description:
        'RxJS-оператор вызывает callback и при успехе, и при ошибке Observable — удобное место для записи duration.',
    },
    {
      term: 'histogram.observe(labels, value)',
      description:
        'Добавляет измерение в Prometheus histogram. Каждая уникальная комбинация labels создаёт отдельный time series.',
    },
    {
      term: 'context.getClass() / getHandler()',
      description:
        'Возвращают выбранные Nest controller class и method. Их имена образуют ограниченный набор metric labels.',
    },
    {
      term: 'logger.info(fields, message)',
      description:
        'Пишет structured log: high-cardinality requestId и userId остаются доступными для поиска, но не создают Prometheus series.',
    },
  ],

  'nest-dependency-injection': [
    {
      term: '@Injectable()',
      description:
        'Помечает класс как provider, экземпляром и зависимостями которого может управлять Nest IoC-контейнер.',
    },
    {
      term: 'new Pool(...)',
      description:
        'Создаёт PostgreSQL connection pool вручную. Внутри сервиса такой ресурс скрыт от module lifecycle и тестовых замен.',
    },
    {
      term: 'Symbol("USER_REPOSITORY")',
      description:
        'Создаёт уникальный DI-token для абстрактного repository-контракта без привязки к конкретному классу.',
    },
    {
      term: '@Inject(USER_REPOSITORY)',
      description:
        'Просит Nest найти provider по token и передать его в параметр конструктора.',
    },
    {
      term: 'useClass',
      description:
        'Custom provider: связывает token с классом реализации, который создаст и будет хранить контейнер.',
    },
    {
      term: '@Module({ providers })',
      description:
        'Объявляет composition root модуля: здесь Nest узнаёт, какие tokens и классы входят в DI-граф.',
    },
  ],

  'nest-request-lifecycle': [
    {
      term: 'NestInterceptor / next.handle()',
      description:
        'Interceptor выполняет код вокруг handler, а next.handle запускает следующую часть pipeline и возвращает Observable.',
    },
    {
      term: 'lastValueFrom(observable)',
      description:
        'Преобразует RxJS Observable в Promise с последним значением; в плохом примере это маскирует естественную interceptor pipeline.',
    },
    {
      term: '@UseGuards(JwtAuthGuard)',
      description:
        'Guard решает, разрешён ли запрос. При отказе controller handler и pipe его параметров не выполняются.',
    },
    {
      term: 'ValidationPipe',
      description:
        'Проверяет входной DTO и при transform=true преобразует допустимые значения к ожидаемым типам.',
    },
    {
      term: '@UseInterceptors(...)',
      description:
        'Подключает обёртку для logging, timing, cache или преобразования результата выбранного handler.',
    },
    {
      term: '@UseFilters(...)',
      description:
        'Подключает exception filter, который превращает необработанное исключение в контролируемый HTTP-ответ.',
    },
  ],

  'database-sql-foundations': [
    {
      term: 'db.query(sql, [values])',
      description:
        'Отправляет SQL и параметры отдельно. $1 получает первое значение без склейки пользовательского ввода со строкой SQL.',
    },
    {
      term: 'rowCount',
      description:
        'Количество строк, найденных или изменённых запросом; в старом варианте используется для application-level проверки.',
    },
    {
      term: 'UNIQUE INDEX ON lower(email)',
      description:
        'База запрещает два email, совпадающих без учёта регистра, даже при конкурентных INSERT.',
    },
    {
      term: 'SQLSTATE 23505',
      description:
        'Стабильный машинный код PostgreSQL для unique_violation; по нему приложение переводит ошибку в HTTP 409.',
    },
  ],

  'database-indexes-explain': [
    {
      term: 'CREATE INDEX',
      description:
        'Строит дополнительную структуру доступа. Каждый индекс занимает место и обновляется при изменении таблицы.',
    },
    {
      term: '(tenant_id, created_at)',
      description:
        'Составной B-tree: сначала группирует строки tenant, затем хранит их в порядке created_at.',
    },
    {
      term: 'WHERE status = pending',
      description:
        'Предикат partial index: в индекс попадает только нужное подмножество строк, поэтому он меньше.',
    },
    {
      term: 'INCLUDE (id)',
      description:
        'Хранит id в leaf pages для index-only scan, но не добавляет его в ключ сортировки.',
    },
    {
      term: 'EXPLAIN (ANALYZE, BUFFERS)',
      description:
        'Реально выполняет SELECT и показывает фактические строки, время и работу с cache/disk buffers.',
    },
  ],

  'database-transactions-locks': [
    {
      term: 'SELECT balance',
      description:
        'Читает snapshot значения, но без блокировки не резервирует его от изменения другой транзакцией.',
    },
    {
      term: 'UPDATE ... balance = balance - $1',
      description:
        'Считает новое значение внутри PostgreSQL на актуальной заблокированной версии строки.',
    },
    {
      term: 'AND balance >= $1',
      description:
        'Переносит проверку инварианта в то же атомарное выражение, что и изменение.',
    },
    {
      term: 'RETURNING balance',
      description:
        'Возвращает новое значение из UPDATE без дополнительного SELECT.',
    },
    {
      term: 'result.rowCount === 0',
      description:
        'Означает, что account не найден или условие достаточного баланса не прошло.',
    },
  ],

  'database-joins-materialized-views': [
    {
      term: 'repository.findRecent(100)',
      description:
        'Условный ORM-вызов списка. Если relations lazy, связанные customers ещё не загружены.',
    },
    {
      term: 'orders.map(async ...)',
      description:
        'Запускает отдельную загрузку customer для каждой строки и создаёт паттерн N+1.',
    },
    {
      term: 'JOIN customers ...',
      description:
        'Объединяет orders и customers внутри одного SQL-запроса по совпадающему foreign key.',
    },
    {
      term: 'jsonb_build_object(...)',
      description:
        'Функция PostgreSQL собирает выбранные customer-поля в JSON-объект прямо в результате запроса.',
    },
    {
      term: 'LIMIT $1',
      description:
        'Параметризованный предел строк; значение передаётся отдельно от SQL как первый параметр.',
    },
  ],

  'database-sql-basics': [
    {
      term: 'SELECT id, name, ...',
      description:
        'Явный SELECT list определяет columns и shape каждой row в result.rows.',
    },
    {
      term: 'template literal ${value}',
      description:
        'JavaScript подставляет текст до отправки в PostgreSQL; недоверенное значение становится частью SQL grammar.',
    },
    {
      term: '$1 / $2',
      description:
        'Protocol placeholders для values; node-postgres связывает их с элементами отдельного values array.',
    },
    {
      term: 'SORT_COLUMNS allowlist',
      description:
        'Локальное отображение разрешённых API-значений в реальные column identifiers; произвольный ввод в SQL не попадает.',
    },
    {
      term: 'Math.min(limit, 100)',
      description:
        'Ставит верхнюю границу размера ответа, даже если DTO передал очень большое положительное число.',
    },
    {
      term: 'result.rows',
      description:
        'Массив rows, который вернул pg driver; keys объектов соответствуют именам или aliases SELECT list.',
    },
  ],

  'microservices-foundations': [
    {
      term: 'ClientProxy.send(pattern, data)',
      description:
        'Создаёт Nest request-response Observable: producer ждёт один response или remote error.',
    },
    {
      term: 'firstValueFrom(observable)',
      description:
        'Преобразует первый emitted response RxJS Observable в Promise для использования с await.',
    },
    {
      term: 'db.transaction(callback)',
      description:
        'Выполняет order и outbox writes на одной DB connection с единым COMMIT или ROLLBACK.',
    },
    {
      term: 'outbox.add(tx, event)',
      description:
        'Сохраняет будущий event в той же транзакции, не пытаясь атомарно координировать PostgreSQL и broker.',
    },
    {
      term: '@EventPattern(name)',
      description:
        'Регистрирует Nest consumer handler для event pattern выбранного transport.',
    },
    {
      term: 'idempotency.once(eventId, work)',
      description:
        'Условный application helper: атомарно запоминает eventId и не повторяет work при duplicate delivery.',
    },
  ],

  'caching-strategies': [
    {
      term: '@Inject(CACHE_MANAGER)',
      description:
        'Просит Nest DI container передать cache-manager instance, созданный импортированным CacheModule.',
    },
    {
      term: 'cache.get(key)',
      description:
        'Читает derived copy по точному key; undefined/null означают miss, а 0, false и пустая строка могут быть валидным hit.',
    },
    {
      term: 'cache.set(key, value, ttl)',
      description:
        'Сохраняет сериализуемую copy на ограниченный срок; текущий Nest cache-manager принимает TTL в миллисекундах.',
    },
    {
      term: 'cache.del(key)',
      description:
        'Инвалидирует одну cached copy после изменения primary state, чтобы следующее чтение загрузило новую revision.',
    },
    {
      term: 'inFlight.get(key)',
      description:
        'Проверяет, уже выполняется ли loader этого key в текущем process, и позволяет concurrent caller переиспользовать Promise.',
    },
    {
      term: 'finally(() => inFlight.delete(key))',
      description:
        'Удаляет coordination Promise после success или error, иначе отклонённый loader навсегда заблокировал бы будущие попытки.',
    },
    {
      term: 'stableHash(dimensions)',
      description:
        'Условный helper канонически сериализует все dimensions ответа и получает компактный cache key без raw personal data.',
    },
    {
      term: 'ttlJitter(maxMs)',
      description:
        'Условный helper возвращает небольшую случайную добавку к TTL, чтобы популярные keys не истекали одновременно.',
    },
    {
      term: 'singleFlight.do(key, loader)',
      description:
        'Условная abstraction объединяет параллельные calls одного key; local реализация хранит Promise, distributed требует coordination store.',
    },
    {
      term: 'featured:v2:${locale}',
      description:
        'Versioned key включает locale, потому что разные языки возвращают разные representations одного каталога.',
    },
  ],

  'python-syntax-for-js': [
    {
      term: 'payload.get("discount")',
      description:
        'Возвращает значение mapping key или None, если key отсутствует. В отличие от payload["discount"] не выбрасывает KeyError.',
    },
    {
      term: 'value or fallback',
      description:
        'Возвращает value, если он truthy, иначе fallback. Ноль, пустая строка, None и пустая collection приводят к fallback.',
    },
    {
      term: 'value is None',
      description:
        'Проверяет identity с singleton None и не смешивает отсутствие с другими falsy-значениями.',
    },
    {
      term: '@dataclass(...)',
      description:
        'Decorator генерирует типичные методы класса данных; frozen ограничивает assignment fields, slots меняет layout instances.',
    },
    {
      term: 'raise ValueError(...)',
      description:
        'Создаёт и выбрасывает exception о некорректном значении, чтобы invalid contract не продолжил normal flow.',
    },
  ],

  'python-objects-functions': [
    {
      term: 'tags=[]',
      description:
        'Default expression выполняется один раз при создании function object, поэтому один mutable list разделяется вызовами.',
    },
    {
      term: 'function.__defaults__',
      description:
        'Tuple с positional default objects функции; через него можно буквально увидеть сохранённую ссылку на общий list.',
    },
    {
      term: 'tags is None',
      description:
        'Использует immutable singleton как сигнал, что вызывающая сторона не передала собственную collection.',
    },
    {
      term: 'list(tags)',
      description:
        'Создаёт shallow copy iterable, чтобы append helper-а не изменял исходный list вызывающей стороны.',
    },
    {
      term: 'result.append(tag)',
      description:
        'Мутирует конкретный result list на месте и возвращает None; поэтому append не присваивают обратно переменной.',
    },
  ],

  'cpython-runtime-asyncio': [
    {
      term: 'async def',
      description:
        'Определяет coroutine function. Вызов создаёт coroutine object, но body выполняется только под управлением await/scheduler.',
    },
    {
      term: 'asyncio.to_thread(...)',
      description:
        'Запускает sync callable в thread pool и возвращает coroutine для ожидания результата без блокировки loop thread.',
    },
    {
      term: 'ProcessPoolExecutor',
      description:
        'Управляет ограниченным набором child processes с отдельными interpreters и heaps для CPU parallelism.',
    },
    {
      term: 'get_running_loop()',
      description:
        'Возвращает event loop текущего async context и выбрасывает RuntimeError, если active loop отсутствует.',
    },
    {
      term: 'run_in_executor(...)',
      description:
        'Передаёт sync callable executor-у и связывает его concurrent result с asyncio Future для await.',
    },
    {
      term: 'max_workers=2',
      description:
        'Задаёт bounded concurrency: не позволяет одному process бесконтрольно создавать workers на каждый request.',
    },
  ],

  'docker-foundations': [
    {
      term: 'FROM ... AS stage',
      description:
        'Начинает именованную build stage. Финальный image содержит только ancestry последней stage и явно скопированные artifacts.',
    },
    {
      term: 'RUN --mount=type=secret',
      description:
        'BuildKit временно монтирует secret на время одной RUN-инструкции, не сохраняя его как ENV или обычный filesystem layer.',
    },
    {
      term: 'npm ci',
      description:
        'Устанавливает точное дерево из package-lock.json и завершается ошибкой при рассинхронизации manifests.',
    },
    {
      term: 'COPY --from=build',
      description:
        'Переносит выбранные файлы из предыдущей stage вместо включения всего build environment в runtime image.',
    },
    {
      term: 'COPY --chown=node:node',
      description:
        'Сразу назначает владельца copied files, чтобы непривилегированный runtime user мог читать необходимые artifacts.',
    },
    {
      term: 'CMD ["node", "server.js"]',
      description:
        'Exec-форма запускает Node без shell-wrapper, поэтому signal доходит до application process напрямую.',
    },
  ],

  'kubernetes-foundations': [
    {
      term: 'replicas: 3',
      description:
        'Задаёт желаемое количество Pods; controllers асинхронно создают или удаляют instances для достижения этого состояния.',
    },
    {
      term: 'matchLabels',
      description:
        'Selector связывает Deployment с управляемыми Pods; те же labels позволяют Service найти traffic backends.',
    },
    {
      term: 'startupProbe',
      description:
        'Даёт медленно запускающемуся container отдельное окно и не активирует liveness/readiness до первого успеха.',
    },
    {
      term: 'livenessProbe',
      description:
        'После последовательных failures сообщает kubelet, что container нужно restart-нуть для восстановления progress.',
    },
    {
      term: 'readinessProbe',
      description:
        'Управляет готовностью Pod к новому traffic; failure убирает endpoint из Service без обязательного restart.',
    },
    {
      term: 'resources.requests / limits',
      description:
        'Requests участвуют в scheduling и capacity accounting, limits задают верхнюю runtime-границу CPU/memory.',
    },
    {
      term: 'maxUnavailable / maxSurge',
      description:
        'Ограничивают число недоступных и дополнительных Pods во время постепенной замены Deployment revision.',
    },
  ],
};
