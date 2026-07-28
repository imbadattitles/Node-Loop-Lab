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
};
