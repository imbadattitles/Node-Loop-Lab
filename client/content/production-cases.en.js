export const productionCasesEnglish = {
  'event-loop-order': [
    {
      title: 'An order event is published before the required audit record',
      situation:
        'A checkout endpoint stores an order, schedules event publishing with setImmediate, and then waits for the audit write. The author assumed that source-code order also guaranteed the order of every side effect.',
      problem:
        'After await, the current stack is released. While audit.write is waiting on I/O, the check phase may run setImmediate, so a downstream consumer can observe OrderCreated before the required audit record exists.',
      badCode: `async function checkout(input) {
  const order = await orders.insert(input);

  setImmediate(() => {
    broker.publish('OrderCreated', order);
  });

  await audit.write('order.created', order.id);
  return order;
}`,
      badWhy:
        'Source order defines when work is registered, but the setImmediate callback and the await continuation use different scheduling mechanisms. There is no business ordering guarantee between them.',
      fixedCode: `async function checkout(input) {
  const order = await orders.insert(input);

  await audit.write('order.created', order.id);
  await broker.publish('OrderCreated', order);

  return order;
}

// If INSERT and event creation must be atomic,
// write the order and an outbox row
// in the same database transaction.`,
      fixedWhy:
        'The required dependency is expressed with await. When the order and event must succeed together, a transactional outbox provides that guarantee instead of relying on Event Loop phases.',
      takeaway:
        'The Event Loop decides when a callback gets the stack; it should not encode business sequencing. Chain dependent effects explicitly and run only truly independent operations concurrently.',
      signals: [
        'OrderCreated appears in the broker before the matching audit row.',
        'Rare race failures become reproducible when audit storage is artificially delayed.',
        'The integration test becomes flaky only under I/O load.',
      ],
    },
  ],

  'event-demultiplexer': [
    {
      title: 'An API aggregator waits for independent services sequentially',
      situation:
        'A product page combines catalog, inventory, and pricing data. The requests do not depend on one another, but the endpoint waits for each one in sequence and has no deadline.',
      problem:
        'Total latency becomes the sum of three I/O operations. One stalled upstream also keeps the HTTP request and its resources open indefinitely, even though Node can wait for all sources concurrently.',
      badCode: `async function productPage(id) {
  const product = await catalog.get(id);
  const stock = await inventory.get(id);
  const price = await pricing.get(id);

  return { product, stock, price };
}`,
      badWhy:
        'Each following I/O operation is registered only after the previous one completes. With 120, 90, and 160 ms calls, the endpoint needs roughly 370 ms before its own overhead.',
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
        'All independent operations are registered immediately, and their readiness notifications are demultiplexed back to JavaScript. A shared deadline limits how long resources are retained.',
      takeaway:
        'Concurrent waiting shortens the critical path to the slowest required upstream. Production code also needs timeouts, concurrency limits, a retry budget, and an explicit partial-result policy.',
      signals: [
        'Endpoint latency is close to the sum of its upstream latencies.',
        'Long-lived outbound sockets accumulate when one service degrades.',
        'Promise.all lowers p95 latency but increases simultaneous upstream load.',
      ],
    },
  ],

  'callback-queue': [
    {
      title: 'Synchronous password hashing delays every request in the process',
      situation:
        'A registration endpoint uses bcrypt.hashSync. One call looks acceptable in development, but concurrent registrations force callbacks from unrelated routes to wait for the stack.',
      problem:
        'Ready timers, HTTP callbacks, and even the health check cannot execute while hashSync owns the main thread. Autoscaling reacts late because CPU and Event Loop lag have already raised tail latency.',
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
        'The synchronous CPU/native operation runs inside the current callback to completion. A queue of ready HTTP callbacks is not a parallel executor.',
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
        'Asynchronous bcrypt delegates the work and releases the main stack. The route still needs rate limiting because the native pool and CPU remain finite resources.',
      takeaway:
        'The fix preserves Event Loop responsiveness; it does not create infinite capacity. Control admission rate, pool saturation, and the number of concurrent expensive registrations.',
      signals: [
        'Event Loop delay rises together with registration traffic.',
        'Even /health responds slowly while the database remains healthy.',
        'CPU is high and the number of active requests grows in waves.',
      ],
    },
  ],

  'blocking-vs-worker': [
    {
      title: 'PDF generation runs inside a Nest controller handler',
      situation:
        'A NestJS B2B service generates a multipage invoice with charts. The first implementation computes layout and compresses images directly inside the controller handler.',
      problem:
        'CPU-bound rendering occupies the main isolate for seconds. One large document increases latency for every client of that Node process and can fail its readiness probe.',
      badCode: `@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get(':id/pdf')
  @Header('Content-Type', 'application/pdf')
  async download(@Param('id') id: string) {
    const invoice = await this.invoices.get(id);

    // CPU-bound layout and image compression
    const pdf = renderInvoicePdf(invoice);
    return new StreamableFile(pdf);
  }
}`,
      badWhy:
        'Marking a handler async does not move synchronous renderInvoicePdf work to another thread. Until it returns, this isolate cannot serve other callbacks.',
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
      { jobId: 'invoice-' + id },
    );

    return {
      jobId: job.id,
      statusUrl: '/exports/' + job.id,
    };
  }
}

// A separate Nest worker application/container:
@Processor('invoice-export')
export class InvoiceExportProcessor extends WorkerHost {
  process(job: Job<{ invoiceId: string }>) {
    return renderAndStorePdf(job.data.invoiceId);
  }
}`,
      fixedWhy:
        'The HTTP process validates and enqueues a bounded job. A separate worker process performs the CPU work and can be scaled or restarted independently.',
      takeaway:
        'A Worker Thread suits short CPU work that must return quickly. A durable queue suits long work that must survive an HTTP-process restart. The SLA and durability requirement determine the choice.',
      signals: [
        'Heartbeat gaps coincide with exports of large documents.',
        'p99 rises on every route although their dependencies are fast.',
        'Restarting the HTTP process loses an unfinished PDF.',
      ],
    },
  ],

  'libuv-thread-pool': [
    {
      title: 'A bulk PBKDF2 job starves file and DNS work in the libuv pool',
      situation:
        'After a user import, the service recalculates 200 password hashes at once. The same process also loads files and performs dns.lookup calls.',
      problem:
        'All native jobs enter the shared libuv pool. A few occupy its threads while the rest queue up, and unrelated file or DNS operations receive unexpected latency.',
      badCode: `async function rehashUsers(users) {
  await Promise.all(
    users.map((user) =>
      pbkdf2Async(user.password, user.salt),
    ),
  );
}`,
      badWhy:
        'Promise.all does not limit submission. It immediately sends the whole batch to a finite native pool and creates head-of-line blocking for other APIs.',
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
        'Backpressure bounds both submitted jobs and batch memory. A large migration is better moved to a separate worker service so it does not share the HTTP process pool.',
      takeaway:
        'UV_THREADPOOL_SIZE can be tuned after measurement, but a larger pool does not replace admission control. Bound concurrency first, then size the pool for the actual CPU and latency budget.',
      signals: [
        'fs and dns.lookup become slow during a password migration.',
        'The JavaScript Event Loop looks responsive while request latency still rises.',
        'A larger pool shifts the bottleneck to CPU instead of removing it.',
      ],
    },
  ],

  'memory-leak': [
    {
      title: 'A request listener retains the entire upload after the response',
      situation:
        'A Nest controller subscribes to a shared EventEmitter to record import completion. Its closure captures the DTO and a large parsed CSV after the response has finished.',
      problem:
        'The shared emitter remains reachable for the lifetime of the process. Every forgotten listener therefore retains its closure, request, and payload, so heap usage grows after each import.',
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
        'on creates a persistent subscription. Nobody calls off after return, so the closure retains input and the expanded rows array.',
      fixedCode: `@Controller('imports')
export class ImportsController {
  constructor(
    @InjectQueue('csv-import')
    private readonly importQueue: Queue,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async start(@Body() input: StartImportDto) {
    // The CSV is already stored in object storage.
    const job = await this.importQueue.add(
      'import',
      { objectKey: input.objectKey },
      { jobId: 'import-' + input.id },
    );

    return {
      jobId: job.id,
      statusUrl: '/imports/' + job.id,
    };
  }
}`,
      fixedWhy:
        'The HTTP controller no longer creates a long-lived listener. Redis holds a small job with an objectKey, while object storage owns the CSV and a separate worker processes it.',
      takeaway:
        'Garbage collection cannot free a reachable object. For long production work, a durable queue is usually safer than a listener owned by a short HTTP request.',
      signals: [
        'Heap used does not return to its baseline after imports finish.',
        'EventEmitter reports MaxListenersExceededWarning.',
        'Snapshot comparison shows many request objects retained by listeners.',
      ],
    },
  ],

  'promises-immediate-bullmq': [
    {
      title: 'A bulk endpoint responds before its asynchronous writes finish',
      situation:
        'A handler starts one asynchronous update per ID with map and awaits the resulting array. The response says “done,” but some writes are still running and their rejections become unhandled.',
      problem:
        'Array.map returns Promise objects, while await on a plain array returns that same array immediately. There is no aggregate Promise representing completion of the batch.',
      badCode: `@Injectable()
export class UsersService {
  constructor(
    private readonly users: UserRepository,
    private readonly audit: AuditService,
  ) {}

  async activateMany(ids: string[]) {
    await ids.map(async (id) => {
      await this.users.activate(id);
      await this.audit.write('user.activated', id);
    });
  }
}

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post('activate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async activate(@Body() input: ActivateUsersDto) {
    await this.users.activateMany(input.ids);
  }
}`,
      badWhy:
        'await does not recursively wait for values inside an array. It only adopts a thenable, and an array is not one.',
      fixedCode: `@Injectable()
export class UsersService {
  private readonly limit = pLimit(10);

  constructor(
    private readonly users: UserRepository,
    private readonly audit: AuditService,
  ) {}

  async activateMany(ids: string[]) {
    await Promise.all(
      ids.map((id) =>
        this.limit(async () => {
          await this.users.activate(id);
          await this.audit.write('user.activated', id);
        }),
      ),
    );
  }
}

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post('activate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async activate(@Body() input: ActivateUsersDto) {
    await this.users.activateMany(input.ids);
  }
}`,
      fixedWhy:
        'Promise.all creates one completion Promise, and p-limit prevents an unbounded burst against the database. If partial success is valid, Promise.allSettled and an explicit result contract are preferable.',
      takeaway:
        'Choose the combinator from business semantics: fail fast, collect every result, take the first completion, or take the first success. Then add a concurrency limit and cancellation policy.',
      signals: [
        'The HTTP 200 timestamp precedes the final database update.',
        'Unhandled rejection logs appear after the response.',
        'Large batches exhaust the connection pool even after Promise.all is added.',
      ],
    },
  ],

  'runtime-models': [
    {
      title: 'CPU-heavy risk scoring erases Node.js I/O throughput',
      situation:
        'A gateway efficiently handles many network requests, then adds a synchronous fraud model that evaluates thousands of rules for every checkout.',
      problem:
        'Node is efficient while the main isolate mostly coordinates I/O. The new CPU phase runs to completion and serializes unrelated requests behind it.',
      badCode: `@Controller('checkout')
export class CheckoutController {
  constructor(private readonly customers: CustomerService) {}

  @Post()
  async checkout(@Body() input: CheckoutDto) {
    const customer = await this.customers.get(input.userId);
    const score = evaluateRiskRules(customer, input);

    return { approved: score < 70 };
  }
}`,
      badWhy:
        'The asynchronous fetch releases the stack, but evaluateRiskRules is ordinary synchronous JavaScript. More open sockets do not create CPU parallelism.',
      fixedCode: `@Injectable()
export class RiskService {
  constructor(
    private readonly customers: CustomerService,
    @Inject(RISK_POOL)
    private readonly workerPool: RiskWorkerPool,
  ) {}

  async evaluate(input: CheckoutDto) {
    const customer = await this.customers.get(input.userId);
    return this.workerPool.run({ customer, checkout: input });
  }
}

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly risk: RiskService) {}

  @Post()
  async checkout(@Body() input: CheckoutDto) {
    const score = await this.risk.evaluate(input);
    return { approved: score < 70 };
  }
}`,
      fixedWhy:
        'A bounded Worker pool uses additional CPU cores without blocking the HTTP isolate. A maximum queue makes overload visible and enables fast rejection instead of unlimited memory growth.',
      takeaway:
        'Node, Go, Java, and Python offer different concurrency primitives, but none removes finite CPU. Pick a runtime and isolation model from the workload, failure boundaries, and operational constraints.',
      signals: [
        'Event Loop utilization and delay rise while outbound I/O remains fast.',
        'Throughput stops scaling before network or database limits are reached.',
        'An unbounded worker queue turns CPU overload into a memory incident.',
      ],
    },
  ],

  'memory-diagnostics': [
    {
      title: 'A retry timer retains multi-megabyte request payloads',
      situation:
        'When an external API fails, the service schedules a retry with setTimeout. The retry closure captures the parsed webhook payload and headers for several minutes.',
      problem:
        'Each pending timer is a GC root path to the captured data. During a long upstream outage, thousands of retries retain far more memory than their small callback functions suggest.',
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
        'The Timer is a retaining path to the callback and its lexical environment, including the enriched payload. The retry has no durable owner.',
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
      jobId: 'retry-' + retry.id,
    },
  );
}`,
      fixedWhy:
        'Durable storage owns the long-lived retry state, while process memory and the queue job retain only a small identifier. A restart does not discard pending work.',
      takeaway:
        'Use heap-snapshot comparison to find growing constructor counts and inspect their retaining paths. RSS alone tells you that memory grew, not which reference owns it.',
      signals: [
        'Heap grows in proportion to the number of scheduled retries.',
        'Snapshots show Timeout objects retaining IncomingMessage instances.',
        'Memory remains high after the upstream recovers until timers fire.',
      ],
    },
  ],

  'production-observability': [
    {
      title: 'Prometheus labels create one time series per user',
      situation:
        'A team wants detailed latency diagnostics and adds userId and requestId to an HTTP histogram. The dashboard is useful in staging but overloads the metrics backend in production.',
      problem:
        'Every unique label combination creates a new time series. Unbounded identifiers multiply cardinality, memory, storage, and query cost.',
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
        'User and request identifiers are effectively unbounded. Raw URLs may also contain IDs, making each request a new route label.',
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
        statusClass: String(response.statusCode)[0] + 'xx',
      }, duration);

      logger.info({
        requestId: request.id,
        userId: request.user?.id,
        duration,
      }, 'request completed');
    }));
  }
}`,
      fixedWhy:
        'Metrics keep bounded dimensions for aggregation and alerts. High-cardinality context belongs in structured logs and traces connected through a correlation ID.',
      takeaway:
        'Metrics answer “is the system unhealthy?”, traces answer “where is time spent?”, and logs explain a specific event. Do not force one signal to do all three jobs.',
      signals: [
        'The number of active series grows with traffic rather than deployment size.',
        'Prometheus memory and dashboard query latency rise continuously.',
        'Replacing raw URLs and IDs with bounded labels stabilizes cardinality.',
      ],
    },
  ],

  'nest-dependency-injection': [
    {
      title: 'A Nest service creates its database client internally',
      situation:
        'UsersService constructs a PostgreSQL Pool itself. Unit tests unexpectedly need a real database, connection settings are duplicated, and shutdown cannot reliably close every pool.',
      problem:
        'The class depends on a concrete infrastructure implementation that the IoC container does not own. Replacing it for tests or another storage adapter requires editing business code.',
      badCode: `@Injectable()
export class UsersService {
  private readonly db = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  findById(id: number) {
    return this.db.query(
      'SELECT * FROM users WHERE id = $1',
      [id],
    );
  }
}`,
      badWhy:
        'Construction, configuration, resource lifecycle, SQL, and use-case logic are coupled inside one class. Nest cannot substitute or dispose of the hidden dependency.',
      fixedCode: `export const USERS_REPOSITORY =
  Symbol('USERS_REPOSITORY');

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly users: UsersRepository,
  ) {}

  findById(id: number) {
    return this.users.findById(id);
  }
}

@Module({
  providers: [
    UsersService,
    {
      provide: USERS_REPOSITORY,
      useClass: PostgresUsersRepository,
    },
  ],
})
export class UsersModule {}`,
      fixedWhy:
        'The service depends on a token and a narrow port. The module chooses the PostgreSQL adapter, tests can provide an in-memory fake, and the container owns lifecycle hooks.',
      takeaway:
        'DI is more than avoiding new. It makes dependency direction, ownership, scope, replacement, and lifecycle explicit in the application graph.',
      signals: [
        'Unit tests require infrastructure unrelated to the tested rule.',
        'The process opens multiple pools after modules are imported.',
        'Changing the storage adapter touches business-service source files.',
      ],
    },
  ],

  'nest-request-lifecycle': [
    {
      title: 'One Nest interceptor handles authentication, validation, and errors',
      situation:
        'A team centralizes every cross-cutting concern in one interceptor. It reads tokens, mutates input, maps exceptions, records timing, and invokes the controller.',
      problem:
        'Responsibilities run at different lifecycle stages. The oversized interceptor has ambiguous ordering, is hard to reuse, and may execute work before access is rejected.',
      badCode: `@Injectable()
export class EverythingInterceptor
  implements NestInterceptor {
  async intercept(context, next) {
    validateToken(context);
    context.switchToHttp()
      .getRequest().body = validateBody(context);

    try {
      return await lastValueFrom(next.handle());
    } catch (error) {
      throw mapToHttpError(error);
    }
  }
}`,
      badWhy:
        'Authorization, transformation, handler wrapping, and exception mapping have different contracts. Combining them hides the request order and makes unit tests depend on the entire pipeline.',
      fixedCode: `@UseFilters(DomainExceptionFilter)
@UseInterceptors(LoggingInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  @Post()
  create(
    @Body(new ValidationPipe({
      transform: true,
      whitelist: true,
    }))
    input: CreateOrderDto,
  ) {
    return this.orders.create(input);
  }
}

// Middleware: raw HTTP context/correlation ID
// Guard: may this request continue?
// Pipe: validate and transform arguments
// Interceptor: wrap handler before and after
// Filter: map uncaught exceptions`,
      fixedWhy:
        'Each concern uses the Nest extension point designed for its timing and contract. The order is visible, each component can be tested separately, and rejected requests never reach the controller.',
      takeaway:
        'Middleware and interceptors are not interchangeable: middleware works with raw HTTP before route execution, while an interceptor knows the selected handler and wraps its result stream.',
      signals: [
        'Unauthorized requests still execute validation or database work.',
        'Changing error mapping unexpectedly changes authentication behavior.',
        'End-to-end tests are the only practical way to test one concern.',
      ],
    },
  ],

  'database-sql-foundations': [
    {
      title: 'Application-level uniqueness allows duplicate accounts',
      situation:
        'Registration first checks whether an email exists and inserts a user only when the SELECT returns nothing. It works in manual testing but fails when two requests arrive together.',
      problem:
        'Both transactions can observe “not found” before either INSERT commits. Application checks improve messages but do not enforce integrity under concurrency.',
      badCode: `async function register(email) {
  const existing = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email],
  );

  if (existing.rowCount > 0) {
    throw new ConflictError('Email already exists');
  }

  return db.query(
    'INSERT INTO users(email) VALUES ($1) RETURNING *',
    [email],
  );
}`,
      badWhy:
        'The SELECT and INSERT are separate decisions. READ COMMITTED does not reserve the absence of a row for this request.',
      fixedCode: `CREATE UNIQUE INDEX users_email_unique
  ON users (lower(email));

async function register(email) {
  try {
    return await db.query(
      \`INSERT INTO users(email)
       VALUES ($1)
       RETURNING *\`,
      [email],
    );
  } catch (error) {
    if (error.code === '23505') {
      throw new ConflictError('Email already exists');
    }
    throw error;
  }
}`,
      fixedWhy:
        'PostgreSQL serializes competing writes through the unique index. The application translates SQLSTATE 23505 into a domain response instead of trying to reproduce database concurrency rules.',
      takeaway:
        'Put invariants in constraints: UNIQUE, NOT NULL, CHECK, FOREIGN KEY, and exclusion constraints. Validate in the application for usability, not as the final integrity boundary.',
      signals: [
        'Duplicate rows appear only under concurrent load.',
        'A SELECT-before-INSERT query pair is visible in traces.',
        'Adding a unique constraint reveals previously hidden conflict traffic.',
      ],
    },
  ],

  'database-indexes-explain': [
    {
      title: 'Three single-column indexes do not serve a queue query',
      situation:
        'A worker fetches the oldest pending jobs for one tenant. The table has separate indexes on tenant_id, status, and created_at, yet latency grows with table size.',
      problem:
        'PostgreSQL may combine indexes, but it still has to filter or sort many rows. The useful access path must reflect equality predicates, ordering, and the subset queried.',
      badCode: `CREATE INDEX jobs_tenant_idx
  ON jobs (tenant_id);
CREATE INDEX jobs_status_idx
  ON jobs (status);
CREATE INDEX jobs_created_idx
  ON jobs (created_at);

SELECT id, payload
FROM jobs
WHERE tenant_id = $1
  AND status = 'pending'
ORDER BY created_at
LIMIT 100;`,
      badWhy:
        'Independent indexes do not provide one ordered stream of pending rows for a tenant. EXPLAIN ANALYZE often shows extra filtering, bitmap work, or a sort.',
      fixedCode: `CREATE INDEX CONCURRENTLY jobs_pending_pick_idx
  ON jobs (tenant_id, created_at)
  INCLUDE (id)
  WHERE status = 'pending';

EXPLAIN (ANALYZE, BUFFERS)
SELECT id, payload
FROM jobs
WHERE tenant_id = $1
  AND status = 'pending'
ORDER BY created_at
LIMIT 100;`,
      fixedWhy:
        'The partial composite index contains only pending jobs and returns them in the required tenant/time order. EXPLAIN ANALYZE and BUFFERS verify the real plan and I/O rather than an assumption.',
      takeaway:
        'Indexes accelerate selected reads at the cost of write amplification, storage, cache pressure, and maintenance. Design them from real query shapes and measured plans.',
      signals: [
        'Rows Removed by Filter and sort cost grow with table size.',
        'The query is fast for small tenants but slow for large ones.',
        'After the index, read latency falls while INSERT cost and index size rise.',
      ],
    },
  ],

  'database-transactions-locks': [
    {
      title: 'A read-modify-write debit loses a concurrent update',
      situation:
        'Two workers debit the same wallet. Each reads the balance, checks it in JavaScript, subtracts an amount, and writes the computed value.',
      problem:
        'Both transactions can read the same starting balance and overwrite each other. Funds may be spent twice or one valid update may disappear.',
      badCode: `async function debit(client, walletId, amount) {
  const { rows: [wallet] } = await client.query(
    'SELECT balance FROM wallets WHERE id = $1',
    [walletId],
  );

  if (wallet.balance < amount) {
    throw new Error('Insufficient funds');
  }

  await client.query(
    'UPDATE wallets SET balance = $1 WHERE id = $2',
    [wallet.balance - amount, walletId],
  );
}`,
      badWhy:
        'The business decision is split across a read and a later write. At READ COMMITTED, another transaction may change the row between them.',
      fixedCode: `async function debit(client, walletId, amount) {
  const result = await client.query(
    \`UPDATE wallets
     SET balance = balance - $1
     WHERE id = $2
       AND balance >= $1
     RETURNING balance\`,
    [amount, walletId],
  );

  if (result.rowCount === 0) {
    throw new Error('Insufficient funds or missing wallet');
  }

  return result.rows[0].balance;
}`,
      fixedWhy:
        'The predicate and update are one atomic statement, and PostgreSQL locks the changed row. More complex multi-row invariants may need SELECT FOR UPDATE, deterministic lock order, or SERIALIZABLE with retries.',
      takeaway:
        'Prefer atomic SQL when the invariant fits one statement. Use pessimistic locking for scarce contested state and optimistic version checks when conflicts are uncommon.',
      signals: [
        'The final balance differs from the sum of accepted operations.',
        'The bug appears only when requests overlap.',
        'Lock-wait and deadlock metrics rise after pessimistic locking is added carelessly.',
      ],
    },
  ],

  'database-joins-materialized-views': [
    {
      title: 'An ORM serializer produces an N+1 query storm',
      situation:
        'An orders endpoint loads 100 orders and then lazily requests the customer for each serialized row. Local tests contain only a few rows, so the extra round trips are easy to miss.',
      problem:
        'One list request becomes 101 database queries. Network round trips and pool contention dominate even though each individual query is fast.',
      badCode: `const orders = await orderRepository.find({
  take: 100,
  order: { createdAt: 'DESC' },
});

return Promise.all(
  orders.map(async (order) => ({
    id: order.id,
    total: order.total,
    customer: await order.customer,
  })),
);`,
      badWhy:
        'Lazy relation loading hides I/O behind property access. Application code no longer makes the number or shape of SQL queries obvious.',
      fixedCode: `const { rows } = await db.query(
  \`SELECT
     o.id,
     o.total,
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

return rows;`,
      fixedWhy:
        'One visible, parameterized query performs the join where the data lives. The team can inspect its plan, indexes, selected columns, and transaction boundary.',
      takeaway:
        'ORMs are useful when their generated SQL remains observable. Use eager loading, a query builder, or raw SQL for critical paths, and test the query count as well as the returned data.',
      signals: [
        'Database query count grows linearly with response row count.',
        'Most queries are individually fast while endpoint p95 is high.',
        'Pool wait time drops sharply after replacing N+1 with one JOIN.',
      ],
    },
  ],
};
