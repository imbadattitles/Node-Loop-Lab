export const productionCasesRu = {
  'event-loop-order': [
    {
      title: 'Событие заказа публикуется раньше обязательного аудита',
      situation:
        'Checkout endpoint сохраняет заказ, регистрирует публикацию события через setImmediate и затем ждёт запись аудита. Автор рассчитывал, что строки исходника задают порядок всех действий.',
      problem:
        'После await стек освобождается. Пока audit.write ждёт I/O, check-фаза может выполнить setImmediate, и downstream consumer увидит OrderCreated раньше обязательной audit-записи.',
      badCode: `async function checkout(input) {
  const order = await orders.insert(input);

  setImmediate(() => {
    broker.publish('OrderCreated', order);
  });

  await audit.write('order.created', order.id);
  return order;
}`,
      badWhy:
        'Порядок строк определяет регистрацию, но callback setImmediate и продолжение await попадают в разные механизмы планирования. Между ними нет бизнес-гарантии порядка.',
      fixedCode: `async function checkout(input) {
  const order = await orders.insert(input);

  await audit.write('order.created', order.id);
  await broker.publish('OrderCreated', order);

  return order;
}

// Если нужна атомарность с INSERT:
// order + outbox event записываются
// одной DB-транзакцией.`,
      fixedWhy:
        'Обязательная зависимость выражена через await. Для гарантии «заказ и событие вместе» используется transactional outbox, а не порядок фаз Event Loop.',
      takeaway:
        'Event Loop определяет, когда callback получает стек, но не должен кодировать бизнес-последовательность. Зависимые эффекты связывают Promise-цепочкой или транзакционным протоколом; независимые запускают явно через Promise.all.',
      signals: [
        'OrderCreated присутствует в broker раньше строки аудита.',
        'Редкие race failures исчезают при искусственной задержке audit storage.',
        'Интеграционный тест нестабилен только под I/O-нагрузкой.',
      ],
    },
  ],

  'event-demultiplexer': [
    {
      title: 'API-агрегатор последовательно ждёт независимые сервисы',
      situation:
        'Страница товара собирается из каталога, остатков и цен. Запросы не зависят друг от друга, но endpoint ждёт их по очереди и не ограничивает время ожидания.',
      problem:
        'Итоговая latency становится суммой трёх I/O, а один зависший upstream удерживает HTTP-запрос и соединение к нему. Node умеет ждать источники одновременно, но код не использует эту возможность.',
      badCode: `async function productPage(id) {
  const product = await catalog.get(id);
  const stock = await inventory.get(id);
  const price = await pricing.get(id);

  return { product, stock, price };
}`,
      badWhy:
        'Каждый следующий I/O регистрируется только после завершения предыдущего. При 120 + 90 + 160 ms endpoint отвечает примерно через 370 ms без учёта накладных расходов.',
      fixedCode: `async function productPage(id) {
  const signal = AbortSignal.timeout(800);

  const [product, stock, price] = await Promise.all([
    catalog.get(id, { signal }),
    inventory.get(id, { signal }),
    pricing.get(id, { signal }),
  ]);

  return { product, stock, price };
}`,
      fixedWhy:
        'Все независимые операции регистрируются сразу, а demultiplexer возвращает callbacks по готовности. Общий deadline ограничивает время удержания ресурсов.',
      takeaway:
        'Параллельное ожидание уменьшает critical path до самого медленного обязательного upstream. В production к нему добавляют timeout, ограничение concurrency, retry budget и явную политику частичных результатов.',
      signals: [
        'Endpoint latency близка сумме latency upstream-сервисов.',
        'Много длительных outbound sockets при деградации одного сервиса.',
        'После Promise.all p95 снижается, но нагрузка на upstream возрастает.',
      ],
    },
  ],

  'callback-queue': [
    {
      title: 'Синхронный password hash задерживает все запросы процесса',
      situation:
        'В endpoint регистрации используется bcrypt.hashSync. На тестовой машине один вызов кажется приемлемым, но под параллельной регистрацией callbacks остальных маршрутов ждут свободный стек.',
      problem:
        'Готовые timers, HTTP callbacks и healthcheck не могут выполняться, пока hashSync держит main thread. Autoscaling реагирует поздно, потому что CPU и Event Loop lag уже подняли tail latency.',
      badCode: `@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  create(@Body() input: CreateUserDto) {
    const passwordHash = bcrypt.hashSync(
      input.password,
      12,
    );

    return this.users.create({
      email: input.email,
      passwordHash,
    });
  }
}`,
      badWhy:
        'Синхронная CPU/native операция выполняется внутри текущего callback по run-to-completion. Очередь готовых HTTP callbacks не является параллельным executor.',
      fixedCode: `@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  async create(@Body() input: CreateUserDto) {
    const passwordHash = await bcrypt.hash(
      input.password,
      12,
    );

    return this.users.create({
      email: input.email,
      passwordHash,
    });
  }
}`,
      fixedWhy:
        'Асинхронный bcrypt делегирует работу native pool и освобождает main stack. На входе всё равно нужен rate limit, потому что pool и CPU остаются конечными ресурсами.',
      takeaway:
        'Исправление сохраняет отзывчивость Event Loop, но не создаёт бесконечную мощность. Для дорогих вычислений контролируют очередь, pool saturation и максимальное число одновременных регистраций.',
      signals: [
        'Event Loop delay растёт одновременно с регистрационным трафиком.',
        'Даже /health отвечает медленно при свободной базе данных.',
        'CPU высокий, а число активных запросов растёт волнами.',
      ],
    },
  ],

  'blocking-vs-worker': [
    {
      title: 'Генерация PDF выполняется внутри Nest controller handler',
      situation:
        'NestJS-сервис формирует многостраничный счёт с графиками. Первоначальная реализация строит layout и сжимает изображения непосредственно внутри controller handler.',
      problem:
        'CPU-bound генерация занимает main isolate на секунды. Один большой документ увеличивает latency всех клиентов этого Node-процесса и может сорвать readiness probe.',
      badCode: `@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get(':id/pdf')
  @Header('Content-Type', 'application/pdf')
  async download(@Param('id') id: string) {
    const invoice = await this.invoices.get(id);

    // CPU-bound layout + image compression
    const pdf = renderInvoicePdf(invoice);
    return new StreamableFile(pdf);
  }
}`,
      badWhy:
        'async у handler не переносит синхронное тело renderInvoicePdf в другой поток. До возврата функции Event Loop этого isolate не обслуживает другие callbacks.',
      fixedCode: `@Controller('invoices')
export class InvoicesController {
  constructor(
    @InjectQueue('invoice-export')
    private readonly exportQueue: Queue,
  ) {}

  @Post(':id/export')
  @HttpCode(HttpStatus.ACCEPTED)
  async startExport(@Param('id') id: string) {
    const job = await this.exportQueue.add(
      'invoice-pdf',
      { invoiceId: id },
      { jobId: \`invoice-\${id}\` },
    );

    return {
      jobId: job.id,
      statusUrl: \`/exports/\${job.id}\`,
    };
  }
}

// Отдельное Nest worker-приложение / container:
@Processor('invoice-export')
export class InvoiceExportProcessor extends WorkerHost {
  process(job: Job<{ invoiceId: string }>) {
    return renderAndStorePdf(job.data.invoiceId);
  }
}`,
      fixedWhy:
        'HTTP-процесс только валидирует и ставит bounded job. CPU выполняется отдельным worker-процессом, который масштабируется и перезапускается независимо.',
      takeaway:
        'Worker Thread подходит короткой CPU-задаче с быстрым ответом, durable queue — длительной работе, которую нельзя потерять при рестарте HTTP-процесса. Выбор определяется SLA и требованием надёжности.',
      signals: [
        'Провалы heartbeat совпадают с экспортом крупных документов.',
        'p99 всех маршрутов растёт, хотя их собственные зависимости быстрые.',
        'Перезапуск HTTP-процесса обрывает незавершённый PDF.',
      ],
    },
  ],

  'libuv-thread-pool': [
    {
      title: 'Массовый PBKDF2 вытесняет файловые операции из libuv pool',
      situation:
        'После импорта пользователей сервис одновременно пересчитывает 200 password hashes. В том же процессе находятся загрузка конфигурации, fs и dns.lookup.',
      problem:
        'Все 200 native jobs ставятся в общий libuv pool. Первые четыре занимают threads, остальные образуют очередь, а несвязанные fs/DNS-задачи получают неожиданную задержку.',
      badCode: `async function rehashUsers(users) {
  await Promise.all(
    users.map((user) =>
      pbkdf2Async(user.password, user.salt),
    ),
  );
}`,
      badWhy:
        'Promise.all не ограничивает регистрацию. Он мгновенно отправляет весь batch в конечный native pool и создаёт head-of-line blocking для других API.',
      fixedCode: `import pLimit from 'p-limit';

const nativeLimit = pLimit(4);

async function rehashUsers(users) {
  const results = [];

  for (const chunk of chunks(users, 25)) {
    results.push(...await Promise.all(
      chunk.map((user) =>
        nativeLimit(() =>
          pbkdf2Async(user.password, user.salt),
        ),
      ),
    ));
  }
  return results;
}`,
      fixedWhy:
        'Backpressure ограничивает число одновременно отправленных jobs и память batch. Для большой миграции ещё лучше отдельный worker service, чтобы общий pool HTTP-процесса не участвовал.',
      takeaway:
        'UV_THREADPOOL_SIZE можно настраивать после измерений, но увеличение размера не заменяет admission control. Главная production-гарантия — ограниченное число работ на конечный ресурс.',
      signals: [
        'fs.readFile и dns.lookup медленные только во время password batch.',
        'Завершения PBKDF2 приходят волнами размера UV_THREADPOOL_SIZE.',
        'Рост UV_THREADPOOL_SIZE перемещает bottleneck в CPU.',
      ],
    },
  ],

  'memory-leak': [
    {
      title: 'EventEmitter хранит request closures после завершения запроса',
      situation:
        'Nest controller подписывается на глобальный emitter, чтобы записать статус импорта. Listener остаётся после ответа и удерживает DTO и большой parsed CSV.',
      problem:
        'Каждый timeout добавляет долгоживущую ссылку. GC видит объекты достижимыми через emitter → listener → closure и не имеет права освобождать их.',
      badCode: `@Controller('imports')
export class ImportsController {
  constructor(private readonly importer: ImportService) {}

  @Post()
  async start(@Body() input: ImportCsvDto) {
    const rows = parseCsv(input.csv);

    this.importer.events.on('finished', (event) => {
      if (event.id === input.id) {
        this.importer.audit(input.id, rows.length);
      }
    });

    await this.importer.start(input);
    return { status: 'accepted' };
  }
}`,
      badWhy:
        'on создаёт постоянную подписку. После return никто не вызывает off; closure удерживает input и развёрнутый rows.',
      fixedCode: `@Controller('imports')
export class ImportsController {
  constructor(
    @InjectQueue('csv-import')
    private readonly importQueue: Queue,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async start(@Body() input: StartImportDto) {
    // CSV уже загружен в object storage.
    const job = await this.importQueue.add(
      'import',
      { objectKey: input.objectKey },
      { jobId: \`import-\${input.id}\` },
    );

    return {
      jobId: job.id,
      statusUrl: \`/imports/\${job.id}\`,
    };
  }
}`,
      fixedWhy:
        'HTTP controller больше не создаёт долгоживущий listener. В Redis хранится маленькая job с objectKey, а CSV принадлежит object storage и обрабатывается отдельным worker.',
      takeaway:
        'У каждой подписки, timer и cache entry должен быть lifetime. Для долгой production-задачи durable queue обычно надёжнее listener, привязанного к короткому HTTP request.',
      signals: [
        'Количество emitter listeners монотонно растёт.',
        'heapUsed не возвращается к baseline после завершения импортов.',
        'Heap snapshot показывает retaining path через EventEmitter._events.',
      ],
    },
  ],

  'promises-immediate-bullmq': [
    {
      title: 'map(async) отправляет ответ до завершения операций',
      situation:
        'Admin endpoint блокирует список пользователей и должен записать audit для каждого. Разработчик использует await перед map, но map возвращает обычный массив Promise.',
      problem:
        'Handler отвечает 204 немедленно. Ошибки update превращаются в unhandled rejections, часть операций продолжает выполняться после закрытия request scope.',
      badCode: `@Injectable()
export class UsersService {
  constructor(
    private readonly users: UserRepository,
    private readonly audit: AuditService,
  ) {}

  async suspendMany(ids: string[]) {
    await ids.map(async (id) => {
      await this.users.suspend(id);
      await this.audit.write('user.suspended', id);
    });
  }
}

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post('suspend')
  @HttpCode(HttpStatus.NO_CONTENT)
  async suspend(@Body() input: SuspendUsersDto) {
    await this.users.suspendMany(input.ids);
  }
}`,
      badWhy:
        'await видит Array, а не Promise, поэтому не ждёт элементы. async callback создал promises, но вызывающий код их потерял.',
      fixedCode: `@Injectable()
export class UsersService {
  private readonly limit = pLimit(8);

  constructor(
    private readonly users: UserRepository,
    private readonly audit: AuditService,
  ) {}

  async suspendMany(ids: string[]) {
    await Promise.all(
      ids.map((id) =>
        this.limit(async () => {
          await this.users.suspend(id);
          await this.audit.write('user.suspended', id);
        }),
      ),
    );
  }
}

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post('suspend')
  @HttpCode(HttpStatus.NO_CONTENT)
  async suspend(@Body() input: SuspendUsersDto) {
    await this.users.suspendMany(input.ids);
  }
}`,
      fixedWhy:
        'Promise.all представляет завершение всего batch, а limiter задаёт backpressure. Теперь rejection проходит в handler и не теряется.',
      takeaway:
        'Каждая запущенная Promise должна иметь владельца: await, return, aggregate или намеренный background supervisor. Для частичного успеха используют allSettled и явно сохраняют результат каждой операции.',
      signals: [
        'HTTP 204 появляется раньше audit-записей.',
        'Логи unhandledRejection возникают уже после завершения запроса.',
        'Большой batch создаёт всплеск соединений без limiter.',
      ],
    },
  ],

  'runtime-models': [
    {
      title: 'CPU-heavy scoring ошибочно размещён в Node API',
      situation:
        'Fintech API вычисляет риск по большому набору транзакций. Команда выбрала Node за высокий I/O throughput и предположила, что async handler автоматически использует несколько CPU cores.',
      problem:
        'Синхронный scoring блокирует один V8 isolate. Реплики помогают распределять запросы, но каждый тяжёлый запрос по-прежнему блокирует свой экземпляр и ухудшает tail latency.',
      badCode: `@Controller('risk')
export class RiskController {
  constructor(private readonly ledger: LedgerService) {}

  @Post('score')
  async score(@Body() input: RiskScoreDto) {
    const history = await this.ledger.history(input.userId);

    // 700-1200 ms CPU in the main isolate
    const score = calculateRisk(history);

    return { score };
  }
}`,
      badWhy:
        'async оптимизирует ожидание ledger I/O, но не распараллеливает JavaScript calculation. Модель Node эффективна для ожидания, а не для длинного CPU callback.',
      fixedCode: `@Injectable()
export class RiskService {
  constructor(
    private readonly ledger: LedgerService,
    @Inject(RISK_POOL)
    private readonly workerPool: RiskWorkerPool,
  ) {}

  async score(input: RiskScoreDto) {
    const history = await this.ledger.history(input.userId);

    return this.workerPool.run({
      history,
      modelVersion: CURRENT_MODEL,
    });
  }
}

@Controller('risk')
export class RiskController {
  constructor(private readonly risk: RiskService) {}

  @Post('score')
  async score(@Body() input: RiskScoreDto) {
    return { score: await this.risk.score(input) };
  }
}`,
      fixedWhy:
        'Вычисление получает отдельный V8 isolate через bounded Worker pool. Main Event Loop продолжает принимать HTTP, а очередь pool-а создаёт контролируемый backpressure.',
      takeaway:
        'Выбор runtime зависит от workload. Go/Java могут предложить другую модель потоков, но CPU всё равно конечен; Python/Node часто выносят расчёты в processes. Архитектура важнее ярлыка языка.',
      signals: [
        'Высокий ELU при нормальной latency базы и сети.',
        'Один запрос создаёт длинный провал в Event Loop heartbeat.',
        'Добавление replicas улучшает throughput, но не latency одного scoring.',
      ],
    },
  ],

  'memory-diagnostics': [
    {
      title: 'Retry closure удерживает многомегабайтный payload',
      situation:
        'Webhook gateway повторяет доставку через setTimeout. Closure захватывает весь parsed payload и headers на время многочасового retry window.',
      problem:
        'Тысячи ожидающих timers удерживают большие object graphs. В heap snapshot доминируют Timeout и closures, хотя активной обработки уже нет.',
      badCode: `function scheduleRetry(webhook) {
  const parsedPayload = parseAndEnrich(webhook.body);

  setTimeout(async () => {
    await deliver({
      headers: webhook.headers,
      payload: parsedPayload,
    });
  }, retryDelay(webhook.attempt));
}`,
      badWhy:
        'Timer является GC root-путём к callback, callback — к lexical environment, а environment удерживает webhook и enriched payload до выполнения timer.',
      fixedCode: `async function scheduleRetry(webhook) {
  const retry = await retryStore.insert({
    webhookId: webhook.id,
    attempt: webhook.attempt + 1,
    runAt: nextRetryAt(webhook.attempt),
  });

  await retryQueue.add(
    'deliver-webhook',
    { retryId: retry.id },
    {
      delay: retry.delayMs,
      jobId: \`retry-\${retry.id}\`,
    },
  );
}`,
      fixedWhy:
        'Долгоживущее состояние хранится в durable storage, а память процесса содержит только небольшой job identifier. После запроса payload перестаёт быть достижимым.',
      takeaway:
        'Heap snapshot отвечает не «какой объект большой», а «кто его удерживает». Исправляют lifetime и retaining path, а не вызывают GC чаще.',
      signals: [
        'Количество Timeout коррелирует с retained heap.',
        'Dominator tree ведёт от Timeout к parsedPayload.',
        'После очистки timers heap резко падает, RSS может снижаться медленнее.',
      ],
    },
  ],

  'production-observability': [
    {
      title: 'userId в Prometheus label ломает monitoring',
      situation:
        'Команда хочет быстро находить медленных пользователей и добавляет userId и requestId в labels HTTP histogram.',
      problem:
        'Каждая новая комбинация label создаёт time series. Prometheus тратит память на миллионы рядов, scrape и запросы Grafana замедляются, а dashboard становится частью инцидента.',
      badCode: `@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const startedAt = performance.now();

    return next.handle().pipe(finalize(() => {
      httpDuration.observe({
        method: request.method,
        path: request.url,
        userId: request.user.id,
        requestId: request.id,
      }, (performance.now() - startedAt) / 1_000);
    }));
  }
}`,
      badWhy:
        'userId, requestId и raw URL имеют практически неограниченную cardinality. Metrics backend предназначен для агрегированных dimensions, а не для поиска единичного запроса.',
      fixedCode: `@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();
    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    const startedAt = performance.now();

    return next.handle().pipe(finalize(() => {
      const duration = (performance.now() - startedAt) / 1_000;
      httpDuration.observe({
        method: request.method,
        controller,
        handler,
        statusClass: \`\${Math.floor(response.statusCode / 100)}xx\`,
      }, duration);

      logger.info({
        requestId: request.id,
        userId: request.user?.id,
        traceId: spanContext.traceId,
        duration,
      });
    }));
  }
}`,
      fixedWhy:
        'Метрики используют bounded labels, а high-cardinality identity уходит в structured logs и distributed traces. Между системами остаётся traceId.',
      takeaway:
        'Metrics показывают масштаб и тренд, logs — конкретные события, traces — путь одного запроса, profiles/snapshots — внутреннюю причину. Один инструмент не должен изображать все остальные.',
      signals: [
        'Число active series растёт вместе с пользователями и трафиком.',
        'Prometheus RSS и длительность scrape монотонно увеличиваются.',
        'Grafana queries timeout-ятся во время основного инцидента.',
      ],
    },
  ],

  'nest-dependency-injection': [
    {
      title: 'Domain service сам создаёт PostgreSQL client',
      situation:
        'UsersService напрямую читает env и вызывает new Pool. Unit tests подключаются к настоящей базе, shutdown не знает о pool, а смена адаптера требует изменения бизнес-класса.',
      problem:
        'Класс одновременно выполняет use case, конфигурирует инфраструктуру и управляет lifecycle соединений. Nest container видит UsersService, но не видит скрытую зависимость.',
      badCode: `@Injectable()
export class UsersService {
  private readonly db = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  async getUser(id: number) {
    const result = await this.db.query(
      'SELECT * FROM users WHERE id = $1',
      [id],
    );
    return result.rows[0];
  }
}`,
      badWhy:
        'new внутри consumer обходит IoC container. Нельзя централизованно заменить provider, контролировать scope, закрыть pool через lifecycle hook или подставить fake в тесте.',
      fixedCode: `export const USER_REPOSITORY =
  Symbol('USER_REPOSITORY');

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
  ) {}

  getUser(id: number) {
    return this.users.findById(id);
  }
}

@Module({
  providers: [
    UsersService,
    {
      provide: USER_REPOSITORY,
      useClass: PostgresUserRepository,
    },
  ],
})
export class UsersModule {}`,
      fixedWhy:
        'Composition root выбирает adapter, service зависит от port, а Nest управляет graph и lifecycle. В тесте token переопределяется in-memory provider-ом.',
      takeaway:
        'DI не требует интерфейса для каждого класса. Абстракция оправдана на границе, где нужна замена инфраструктуры, изоляция теста или отдельный lifecycle.',
      signals: [
        'Unit tests требуют DATABASE_URL.',
        'При hot reload появляются лишние database connections.',
        'Nest shutdown завершается, но Node-процесс удерживается скрытым pool.',
      ],
    },
  ],

  'nest-request-lifecycle': [
    {
      title: 'Один interceptor делает auth, validation и обработку ошибок',
      situation:
        'Чтобы «не размазывать код», команда помещает проверку JWT, DTO и преобразование всех исключений в один глобальный interceptor.',
      problem:
        'Компонент запускается не на том этапе, знает слишком много и превращает 4xx/5xx в одинаковый 200 response. Guards и pipes невозможно переиспользовать по metadata, observability теряет настоящий outcome.',
      badCode: `@Injectable()
export class EverythingInterceptor {
  async intercept(context, next) {
    const req = context.switchToHttp().getRequest();

    req.user = await verifyJwt(req.headers.authorization);
    validateCreateOrder(req.body);

    try {
      return await lastValueFrom(next.handle());
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }
}`,
      badWhy:
        'Auth policy, argument transformation, around-handler logic и exception mapping имеют разные lifecycle contracts. Возврат объекта из catch также меняет HTTP error на успешный response.',
      fixedCode: `@Controller('orders')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TracingInterceptor)
export class OrdersController {
  @Post()
  create(
    @Body(new ValidationPipe({
      whitelist: true,
      transform: true,
    }))
    dto: CreateOrderDto,
  ) {
    return this.orders.create(dto);
  }
}

// Domain errors → global ExceptionFilter
// Correlation id → middleware
// Timing/trace → interceptor`,
      fixedWhy:
        'Каждая задача находится в компоненте с подходящим ExecutionContext и порядком. Filter сохраняет HTTP status, interceptor видит реальный success/error, guard блокирует handler до pipes.',
      takeaway:
        'Lifecycle — это архитектурные точки расширения, а не список декораторов. Компонент выбирают по задаче: raw HTTP, authorization decision, argument validation, around-handler behavior или error representation.',
      signals: [
        'Ошибки авторизации возвращаются HTTP 200.',
        'Метрика success считает responses с { ok: false }.',
        'Interceptor невозможно применить к transport без HTTP request.',
      ],
    },
  ],

  'database-sql-foundations': [
    {
      title: 'Проверка уникального email существует только в сервисе',
      situation:
        'Перед регистрацией endpoint выполняет SELECT, а затем INSERT. В schema нет UNIQUE, потому что приложение «уже всё проверило».',
      problem:
        'Два параллельных запроса одновременно не находят email и вставляют дубликаты. DTO validation не может защитить состояние между двумя database sessions.',
      badCode: `async function register(email) {
  const existing = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email],
  );
  if (existing.rowCount) {
    throw new EmailAlreadyExistsError();
  }

  return db.query(
    'INSERT INTO users(email) VALUES ($1)',
    [email],
  );
}`,
      badWhy:
        'SELECT и INSERT не являются одной атомарной проверкой. Между ними другой transaction успевает вставить ту же строку.',
      fixedCode: `ALTER TABLE users
ADD CONSTRAINT users_email_unique UNIQUE (email);

async function register(email) {
  try {
    return await db.query(
      \`INSERT INTO users(email)
       VALUES ($1)
       RETURNING id, email\`,
      [email],
    );
  } catch (error) {
    if (error.code === '23505') {
      throw new EmailAlreadyExistsError(email);
    }
    throw error;
  }
}`,
      fixedWhy:
        'UNIQUE сериализует конфликт в самой точке изменения данных. Один INSERT побеждает, второй получает стабильный SQLSTATE 23505, который service переводит в domain error.',
      takeaway:
        'Application validation улучшает UX, database constraint обеспечивает целостность. Важный invariant дублируют на правильных уровнях, потому что у них разные задачи.',
      signals: [
        'Редкие duplicate users появляются только при всплеске регистраций.',
        'Предварительный SELECT увеличивает database round trips.',
        'После UNIQUE часть запросов получает контролируемый conflict.',
      ],
    },
  ],

  'database-indexes-explain': [
    {
      title: 'Набор одиночных индексов не обслуживает очередь заказов',
      situation:
        'Worker постоянно выбирает pending orders одного tenant по времени. Команда добавила отдельные индексы на tenant_id, status и created_at, но запрос всё ещё сортирует тысячи строк.',
      problem:
        'Planner может объединить bitmap indexes, но не получает нужный порядок и фильтрует большую часть heap rows. Три индекса также увеличивают стоимость каждой записи.',
      badCode: `CREATE INDEX orders_tenant_idx
  ON orders (tenant_id);
CREATE INDEX orders_status_idx
  ON orders (status);
CREATE INDEX orders_created_idx
  ON orders (created_at);

SELECT id
FROM orders
WHERE tenant_id = $1
  AND status = 'pending'
ORDER BY created_at
LIMIT 100;`,
      badWhy:
        'Индексы проектировались по колонкам, а не по форме запроса. Bitmap combination теряет index ordering, и низкоселективный status создаёт много лишних entries.',
      fixedCode: `CREATE INDEX CONCURRENTLY
  orders_pending_tenant_created_idx
ON orders (tenant_id, created_at)
INCLUDE (id)
WHERE status = 'pending';

EXPLAIN (ANALYZE, BUFFERS)
SELECT id
FROM orders
WHERE tenant_id = $1
  AND status = 'pending'
ORDER BY created_at
LIMIT 100;`,
      fixedWhy:
        'Partial composite index содержит только рабочую очередь, начинает с equality tenant и уже отсортирован по created_at. INCLUDE может позволить index-only access.',
      takeaway:
        'Индекс проектируют от predicate, join и order конкретного workload. Решение принимают по EXPLAIN, cardinality и write cost; старые перекрывающиеся индексы удаляют только после проверки usage.',
      signals: [
        'План содержит Sort и много Rows Removed by Filter.',
        'INSERT latency выросла после трёх индексов.',
        'Новый partial index намного меньше полного created_at index.',
      ],
    },
  ],

  'database-transactions-locks': [
    {
      title: 'Два списания теряют изменение баланса',
      situation:
        'Payment service сначала читает balance, вычисляет новое значение в JavaScript и записывает абсолютное число. Два запроса работают в READ COMMITTED.',
      problem:
        'Оба запроса читают 1000. Первый записывает 900, второй на основе старого snapshot записывает 800. Итог 800 вместо 700 — lost update.',
      badCode: `async function debit(accountId, amount) {
  const { rows: [account] } = await db.query(
    'SELECT balance FROM accounts WHERE id = $1',
    [accountId],
  );

  if (account.balance < amount) {
    throw new InsufficientFundsError();
  }

  await db.query(
    'UPDATE accounts SET balance = $1 WHERE id = $2',
    [account.balance - amount, accountId],
  );
}`,
      badWhy:
        'Read-modify-write разделён между statements. READ COMMITTED не запрещает другому transaction изменить строку между SELECT и UPDATE.',
      fixedCode: `async function debit(accountId, amount) {
  const result = await db.query(
    \`UPDATE accounts
     SET balance = balance - $1
     WHERE id = $2
       AND balance >= $1
     RETURNING balance\`,
    [amount, accountId],
  );

  if (result.rowCount === 0) {
    throw new InsufficientFundsError();
  }
  return result.rows[0].balance;
}`,
      fixedWhy:
        'Проверка и изменение выполняются одним atomic statement под row lock PostgreSQL. Конкурентный UPDATE переоценивает WHERE после ожидания и не использует stale balance из JavaScript.',
      takeaway:
        'Сначала ищут atomic SQL. Для многострочного перевода используют transaction, единый порядок SELECT FOR UPDATE и retry deadlock/serialization failures.',
      signals: [
        'Ledger показывает два списания, balance отражает только одно.',
        'Проблема воспроизводится только параллельными sessions.',
        'После atomic UPDATE rowCount становится частью domain protocol.',
      ],
    },
  ],

  'database-joins-materialized-views': [
    {
      title: 'ORM serializer создаёт N+1 на списке заказов',
      situation:
        'Endpoint получает 100 orders, а serializer для каждого вызывает customerRepository.findById. Локально с пятью строками проблема незаметна.',
      problem:
        'Один HTTP request создаёт 101 последовательный query round trip. Database CPU может быть низким, но connection pool занят и p95 растёт пропорционально размеру страницы.',
      badCode: `const orders = await orderRepository.findRecent(100);

return Promise.all(
  orders.map(async (order) => ({
    ...order,
    customer: await customerRepository.findById(
      order.customerId,
    ),
  })),
);`,
      badWhy:
        'Abstraction скрыла число SQL-запросов. Даже индексный lookup имеет protocol, pool и network overhead; Promise.all дополнительно создаёт burst concurrency.',
      fixedCode: `const result = await db.query(
  \`SELECT
     o.id,
     o.amount,
     o.created_at,
     jsonb_build_object(
       'id', c.id,
       'name', c.name
     ) AS customer
   FROM orders AS o
   JOIN customers AS c
     ON c.id = o.customer_id
   ORDER BY o.created_at DESC
   LIMIT $1\`,
  [100],
);

return result.rows;`,
      fixedWhy:
        'Один set-based query формирует нужную shape и использует один round trip. Planner выбирает join algorithm по статистике и индексам.',
      takeaway:
        'Не каждый relation нужно eager-join-ить: альтернативой бывает batch WHERE id = ANY($1). Для тяжёлой повторяемой аналитики рассматривают Materialized View с явным freshness SLA.',
      signals: [
        'Queries per request равно 1 + размер страницы.',
        'Pool wait растёт раньше database CPU.',
        'APM trace содержит десятки одинаковых SELECT by primary key.',
      ],
    },
  ],

  'database-sql-basics': [
    {
      title: 'Фильтр каталога склеивает пользовательский ввод с SQL',
      situation:
        'Nest repository строит список products по query parameters. Category и sort кажутся обычными строками, поэтому разработчик вставляет их прямо в template literal.',
      problem:
        'Значение category может изменить синтаксис запроса, а произвольный sort превращается в неконтролируемый identifier. SELECT * также незаметно меняет API-контракт при добавлении columns.',
      badCode: `@Injectable()
export class ProductsRepository {
  async find(query: ProductQueryDto) {
    const sql = \`
      SELECT *
      FROM products
      WHERE category = '\${query.category}'
      ORDER BY \${query.sort}
      LIMIT \${query.limit}
    \`;

    return (await this.db.query(sql)).rows;
  }
}`,
      badWhy:
        'Template literal смешивает SQL grammar и недоверенные values. Driver не может отличить данные от operators, quotes или identifiers, потому что получает уже готовую строку.',
      fixedCode: `const SORT_COLUMNS = {
  price: 'price',
  name: 'name',
  newest: 'created_at',
} as const;

@Injectable()
export class ProductsRepository {
  async find(query: ProductQueryDto) {
    const sortColumn =
      SORT_COLUMNS[query.sort] ?? SORT_COLUMNS.newest;
    const limit = Math.min(query.limit ?? 20, 100);

    const result = await this.db.query(
      \`SELECT id, name, category, price, stock
       FROM products
       WHERE category = $1
       ORDER BY \${sortColumn} DESC, id DESC
       LIMIT $2\`,
      [query.category, limit],
    );

    return result.rows;
  }
}`,
      fixedWhy:
        'Category и limit передаются как protocol parameters. Имя column нельзя передать через $1, поэтому оно выбирается только из локального allowlist. Явный SELECT list фиксирует shape результата.',
      takeaway:
        'Parameters используют для values; динамические identifiers выбирают из allowlist. DTO validation полезна для ответа клиенту, но не заменяет parameterized query.',
      signals: [
        'В database logs видны SQL-команды с неожиданными comments или operators.',
        'Добавление внутренней column внезапно меняет JSON endpoint.',
        'Одинаковые по форме запросы не переиспользуют plan из-за разного SQL text.',
      ],
    },
  ],

  'microservices-foundations': [
    {
      title: 'Checkout строит длинную синхронную цепочку из четырёх сервисов',
      situation:
        'Nest CheckoutService создаёт order, затем последовательно ждёт Inventory, Payments и Notifications. Каждый remote call является обязательным для HTTP 200.',
      problem:
        'Latency складывается, availability перемножается, а timeout после успешного payment оставляет неизвестный outcome. Повтор всего HTTP-запроса может списать деньги или зарезервировать stock второй раз.',
      badCode: `@Injectable()
export class CheckoutService {
  async checkout(input: CheckoutDto) {
    const order = await this.orders.create(input);

    await firstValueFrom(
      this.inventory.send('reserve', order),
    );
    await firstValueFrom(
      this.payments.send('charge', order),
    );
    await firstValueFrom(
      this.notifications.send('email', order),
    );

    return { ...order, status: 'completed' };
  }
}`,
      badWhy:
        'HTTP request владеет распределённой цепочкой без общего transaction manager. Успех remote side effect и потерянный response неразличимы для producer-а.',
      fixedCode: `@Injectable()
export class CheckoutService {
  async checkout(input: CheckoutDto) {
    return this.db.transaction(async (tx) => {
      const order = await this.orders.createPending(tx, input);
      const eventId = randomUUID();

      await this.outbox.add(tx, {
        eventId,
        type: 'order.placed.v1',
        payload: { orderId: order.id },
      });

      return { orderId: order.id, status: 'pending' };
    });
  }
}

@Controller()
export class InventoryEvents {
  @EventPattern('order.placed.v1')
  handle(@Payload() event: OrderPlacedV1) {
    return this.idempotency.once(
      event.eventId,
      () => this.inventory.reserve(event.orderId),
    );
  }
}`,
      fixedWhy:
        'Order и outbox event commit-ятся атомарно. Relay повторяет publish, а consumer принимает возможные duplicates через eventId. HTTP возвращает pending, потому что workflow сходится асинхронно.',
      takeaway:
        'Это не универсальный рецепт: критический мгновенный ответ может требовать bounded request-response. Но email не должен удлинять checkout, а multi-service workflow требует saga/compensation и явных states.',
      signals: [
        'p99 checkout равен сумме p99 всех downstream calls.',
        'Timeout клиента сопровождается успешным charge в payment logs.',
        'Один correlationId проходит через длинную последовательную trace-цепочку.',
      ],
    },
  ],

  'caching-strategies': [
    {
      title: 'Главная страница повторяет тяжёлый запрос для каждого посетителя',
      situation:
        'Nest endpoint популярного каталога выполняет один и тот же JOIN с агрегацией. Данные меняются несколько раз в минуту, но каждый HTTP request снова занимает PostgreSQL connection.',
      problem:
        'Без cache рост трафика почти линейно увеличивает database queries. Сначала растёт pool wait и p95, затем timeouts создают retries и ещё большую нагрузку на primary.',
      badCode: `@Injectable()
export class FeaturedProductsQuery {
  constructor(private readonly db: Database) {}

  async execute(locale: string) {
    return this.db.query(
      \`SELECT p.id, t.name, avg(r.score) AS rating
       FROM products p
       JOIN translations t ON t.product_id = p.id
       LEFT JOIN reviews r ON r.product_id = p.id
       WHERE p.featured AND t.locale = $1
       GROUP BY p.id, t.name
       ORDER BY rating DESC NULLS LAST
       LIMIT 24\`,
      [locale],
    );
  }
}`,
      badWhy:
        'Запрос корректен, но одинаковая работа повторяется для тысяч consumers. Даже быстрый plan расходует connection time, CPU и buffers; traffic spike может исчерпать небольшой pool.',
      fixedCode: `@Injectable()
export class FeaturedProductsQuery {
  private readonly inFlight = new Map<string, Promise<Product[]>>();

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    private readonly repository: ProductsRepository,
  ) {}

  async execute(locale: string) {
    const key = \`featured:v2:\${locale}\`;
    const hit = await this.cache.get<Product[]>(key);
    if (hit !== undefined && hit !== null) return hit;

    const running = this.inFlight.get(key);
    if (running) return running;

    const loading = this.repository
      .findFeatured(locale)
      .then(async (rows) => {
        await this.cache.set(key, rows, 10_000);
        return rows;
      })
      .finally(() => this.inFlight.delete(key));

    this.inFlight.set(key, loading);
    return loading;
  }

  invalidate(locale: string) {
    return this.cache.del(\`featured:v2:\${locale}\`);
  }
}`,
      fixedWhy:
        'Cache key разделяет locale и schema version. TTL ограничивает staleness, invalidation вызывается после изменения featured data, а in-flight Promise не даёт concurrent misses размножить один SQL query внутри process.',
      takeaway:
        'Кэшировать стоит измеримую повторяемую работу. После внедрения сравнивают hit ratio, p95 и primary query rate. Если почти каждый key уникален, этот слой следует удалить, а не продолжать увеличивать TTL.',
      signals: [
        'Одинаковый query fingerprint доминирует в pg_stat_statements.',
        'Database pool wait растёт вместе с RPS главной страницы.',
        'После expiry возникает узкий burst одинаковых SQL-запросов.',
      ],
    },
    {
      title: 'Расчёт доставки на каждый ввод исчерпывает quota внешнего API',
      situation:
        'Checkout frontend уточняет корзину и повторяет запрос цены доставки. Nest service каждый раз вызывает платного provider-а, хотя country, postal code, weight и cart revision не изменились.',
      problem:
        'Без cache пользователь платит network latency на каждом запросе, а общий traffic быстро достигает provider rate limit. При 429 retries могут синхронно усилить нагрузку.',
      badCode: `@Injectable()
export class ShippingService {
  constructor(private readonly provider: ShippingProvider) {}

  quote(input: ShippingQuoteDto) {
    return this.provider.quote({
      country: input.country,
      postalCode: input.postalCode,
      weight: input.weight,
      items: input.items,
    });
  }
}`,
      badWhy:
        'Детерминированный для короткого окна result не переиспользуется. Endpoint становится полностью зависим от latency, quota и краткого outage upstream provider-а.',
      fixedCode: `@Injectable()
export class ShippingService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    private readonly provider: ShippingProvider,
    private readonly singleFlight: SingleFlight,
  ) {}

  async quote(input: ShippingQuoteDto) {
    const dimensions = {
      country: input.country,
      postalCode: input.postalCode.trim().toUpperCase(),
      weight: input.weight,
      cartRevision: input.cartRevision,
    };
    const key = \`shipping:v3:\${stableHash(dimensions)}\`;
    const hit = await this.cache.get<ShippingQuote>(key);
    if (hit !== undefined && hit !== null) return hit;

    return this.singleFlight.do(key, async () => {
      const quote = await this.provider.quote(input);
      await this.cache.set(key, quote, 60_000 + ttlJitter(5_000));
      return quote;
    });
  }
}`,
      fixedWhy:
        'Key включает все dimensions результата без персональных raw data. Короткий TTL соответствует допустимой свежести quote, jitter распределяет expiry, а single-flight сокращает параллельные upstream calls.',
      takeaway:
        'Для внешнего API cache одновременно уменьшает latency, стоимость и зависимость от quota. Но tax, inventory, permissions и другие критичные данные требуют отдельной freshness policy; нельзя выдавать старое значение только потому, что upstream упал.',
      signals: [
        'Provider request count значительно выше числа уникальных корзин.',
        '429 и provider p95 напрямую повторяются в checkout p95.',
        'Одновременный expiry создаёт burst одинаковых outbound spans.',
      ],
    },
  ],

  'docker-foundations': [
    {
      title: 'Production image содержит dev dependencies, секрет и root process',
      situation:
        'Команда собирает Nest/Next приложение одним stage, копирует всю рабочую директорию и передаёт registry token через ENV. Тот же тяжёлый image запускается в production от root.',
      problem:
        'Любой файл из build context может попасть в layer, секрет остаётся в image metadata/history, а compiler и dev dependencies увеличивают размер и поверхность атаки. Захваченный root process получает лишние права.',
      badCode: `FROM node:24
WORKDIR /app

COPY . .
ENV NPM_TOKEN=production-secret
RUN npm install

EXPOSE 3000
CMD npm run start`,
      badWhy:
        'Один stage смешивает supply, build и runtime. COPY зависит от всего context, shell-форма CMD добавляет промежуточный process, а container запускается с default root user.',
      fixedCode: `# syntax=docker/dockerfile:1
FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \\
    npm ci

FROM dependencies AS build
COPY . .
RUN npm run build

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --chown=node:node --from=build \\
  /app/.next/standalone ./
COPY --chown=node:node --from=build \\
  /app/.next/static ./.next/static
USER node
CMD ["node", "server.js"]`,
      fixedWhy:
        'Secret mount существует только во время RUN, lockfile даёт воспроизводимую установку, multi-stage переносит минимальный artifact, а exec CMD запускает Node напрямую под непривилегированным user.',
      takeaway:
        'Image нужно считать production artifact и проверять отдельно: pin base image, сканировать vulnerabilities/SBOM, не хранить credentials в layers и регулярно пересобирать даже без изменения application code.',
      signals: [
        'Image занимает сотни лишних мегабайт и содержит test/build packages.',
        'docker history или inspect показывает чувствительное ENV.',
        'Проверка container сообщает uid=0.',
      ],
    },
  ],

  'kubernetes-foundations': [
    {
      title: 'Один общий health endpoint превращает сбой БД в restart storm',
      situation:
        'Deployment использует image:latest, не задаёт requests и направляет liveness/readiness на endpoint, который возвращает 500 при кратком outage PostgreSQL.',
      problem:
        'Kubelet одновременно перезапускает все Pods из-за внешней зависимости. Оставшиеся replicas получают больше трафика, а scheduler без requests может плотно разместить приложение на перегруженном node.',
      badCode: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: api
          image: ghcr.io/example/api:latest
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            periodSeconds: 2`,
      badWhy:
        'Liveness отвечает не на вопрос «process необратимо завис?», а на вопрос «доступна ли сейчас БД?». Moving tag скрывает точную revision, а отсутствие requests/strategy делает размещение и rollout непредсказуемее.',
      fixedCode: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  strategy:
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: ghcr.io/example/api:1.7.3
          startupProbe:
            httpGet: { path: /health/live, port: 3000 }
            failureThreshold: 30
            periodSeconds: 2
          livenessProbe:
            httpGet: { path: /health/live, port: 3000 }
            periodSeconds: 10
            failureThreshold: 3
          readinessProbe:
            httpGet: { path: /health/ready, port: 3000 }
            periodSeconds: 5
          resources:
            requests: { cpu: 250m, memory: 256Mi }
            limits: { cpu: "1", memory: 1Gi }`,
      fixedWhy:
        'Live endpoint проверяет способность process продвигаться без требования доступности всего мира. Ready endpoint снимает Pod с трафика при временной неспособности обслуживать запросы. Version, strategy и resources делают rollout и placement наблюдаемыми.',
      takeaway:
        'Probe contract проектируется как часть приложения. Перед production load-test измеряет startup/p99 и memory, PodDisruptionBudget и topology spread защищают от planned/node failures, а alerts следят за restarts и unavailable replicas.',
      signals: [
        'Краткий database outage совпадает со всплеском container restarts.',
        'Pods имеют статус OOMKilled или CPU throttling без capacity baseline.',
        'Нельзя определить, какое содержимое было запущено под latest.',
      ],
    },
  ],
};
