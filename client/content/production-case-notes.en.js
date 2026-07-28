export const productionCaseNotesEnglish = {
  'event-loop-order': [
    {
      term: 'orders.insert(input)',
      description:
        'An asynchronous repository method: writes the order to the database and returns a Promise with the created order.',
    },
    {
      term: 'setImmediate(callback)',
      description:
        'Registers a callback for the Event Loop check phase. It does not mean “run strictly after the next source line.”',
    },
    {
      term: 'await promise',
      description:
        'Pauses only the current async function. After settlement, its continuation is queued as a microtask.',
    },
    {
      term: 'broker.publish(...)',
      description:
        'Sends an event to a message broker. A well-designed API returns a Promise so the caller can await acknowledgement.',
    },
    {
      term: 'transactional outbox',
      description:
        'Stores the order and a future-event row in one DB transaction; a separate publisher sends the event later.',
    },
  ],

  'event-demultiplexer': [
    {
      term: 'catalog.get(id)',
      description:
        'A representative HTTP client or repository method: starts I/O and returns a Promise with an upstream response.',
    },
    {
      term: 'AbortSignal.timeout(800)',
      description:
        'Creates a cancellation signal that fires after 800 ms. The client must support AbortSignal for it to cancel work.',
    },
    {
      term: 'Promise.all([...])',
      description:
        'Subscribes to every input Promise immediately and fulfills when all finish; the first rejection rejects the aggregate.',
    },
    {
      term: '[product, stock, price]',
      description:
        'Result destructuring. Promise.all preserves input order, not the order in which the requests actually completed.',
    },
  ],

  'callback-queue': [
    {
      term: '@Controller / @Post',
      description:
        'Nest decorators that map a class to a route group and a method to an HTTP POST endpoint.',
    },
    {
      term: '@Body() input',
      description:
        'Nest extracts the HTTP request body into a method parameter. A DTO describes the expected data shape.',
    },
    {
      term: 'bcrypt.hashSync(...)',
      description:
        'Computes a password hash synchronously and owns the main JavaScript thread until it returns.',
    },
    {
      term: 'cost = 12',
      description:
        'The bcrypt work factor; each next step increases computation exponentially, so it must be selected from measurements.',
    },
    {
      term: 'await bcrypt.hash(...)',
      description:
        'The asynchronous version delegates expensive native work to a thread pool and returns a Promise with the hash.',
    },
    {
      term: 'constructor(private users: UsersService)',
      description:
        'Nest constructor injection: the IoC container creates UsersService and supplies it to the controller.',
    },
  ],

  'blocking-vs-worker': [
    {
      term: '@Get / @Param',
      description:
        'Nest registers a GET route, while @Param extracts the dynamic :id segment from the URL.',
    },
    {
      term: 'new StreamableFile(buffer)',
      description:
        'A Nest wrapper for sending a Buffer or Stream as a file. It does not move file generation to another thread.',
    },
    {
      term: 'renderInvoicePdf(invoice)',
      description:
        'A representative synchronous CPU-heavy function that builds and returns a PDF Buffer while blocking its isolate.',
    },
    {
      term: 'queue.add(name, data, options)',
      description:
        'BullMQ stores a job in Redis. data is serializable input, while options configure identity, retries, and other rules.',
    },
    {
      term: '@InjectQueue(name)',
      description:
        'Nest BullMQ injects the Queue registered under this name through the DI container.',
    },
    {
      term: '@Processor / WorkerHost',
      description:
        'Nest BullMQ registers a queue consumer; process receives a Job and performs background work.',
    },
  ],

  'libuv-thread-pool': [
    {
      term: 'pbkdf2Async(...)',
      description:
        'A Promise wrapper around crypto.pbkdf2; its native computation runs in the shared libuv thread pool.',
    },
    {
      term: 'users.map(...)',
      description:
        'Synchronously walks the whole array and creates one Promise per user immediately; map does not limit concurrency.',
    },
    {
      term: 'pLimit(4)',
      description:
        'Creates a limiter that starts at most four supplied asynchronous functions at the same time.',
    },
    {
      term: 'chunks(users, 25)',
      description:
        'A teaching helper that splits a large array into groups of 25 to bound temporary Promises and memory.',
    },
  ],

  'memory-leak': [
    {
      term: '@Body() input',
      description:
        'Nest passes the request DTO. If a closure captures input, its entire related payload remains reachable.',
    },
    {
      term: 'emitter.on(event, listener)',
      description:
        'Adds a persistent EventEmitter listener. It remains registered until off or removeListener is called.',
    },
    {
      term: 'parseCsv(input.csv)',
      description:
        'A representative parser that expands a large CSV into objects; retaining this array is easy to spot in a heap snapshot.',
    },
    {
      term: 'queue.add(...)',
      description:
        'Stores a small background-job description in Redis instead of retaining a request closure in the HTTP process.',
    },
    {
      term: 'objectKey',
      description:
        'A small identifier for a file in S3-compatible object storage; the worker downloads the CSV through this key later.',
    },
    {
      term: '@HttpCode(HttpStatus.ACCEPTED)',
      description:
        'Makes Nest return HTTP 202: the work was accepted but will finish asynchronously.',
    },
  ],

  'promises-immediate-bullmq': [
    {
      term: 'ids.map(async (...) => ...)',
      description:
        'Creates an array of Promises immediately. map neither awaits its async callback nor aggregates completion.',
    },
    {
      term: 'await <plain array>',
      description:
        'Returns the array almost immediately: await adopts a thenable, and an array of Promises is not itself thenable.',
    },
    {
      term: 'Promise.all(promises)',
      description:
        'Creates one Promise for the whole batch and preserves result order according to the input array.',
    },
    {
      term: 'pLimit(10)',
      description:
        'Prevents the batch from opening more than ten simultaneous database or upstream operations.',
    },
    {
      term: '@HttpCode(204)',
      description:
        'Nest sends No Content only after the Promise returned by the controller method has actually completed.',
    },
  ],

  'runtime-models': [
    {
      term: 'ledger.history(userId)',
      description:
        'A representative I/O call for transaction history. await releases the stack while a database or service responds.',
    },
    {
      term: 'calculateRisk(history)',
      description:
        'A representative synchronous CPU-heavy function. An async controller does not make it parallel automatically.',
    },
    {
      term: 'workerPool.run(data)',
      description:
        'Sends a serializable task to an available Worker Thread and returns a Promise with the result.',
    },
    {
      term: 'maxQueue',
      description:
        'The maximum number of waiting worker tasks. On overflow, reject quickly instead of growing memory without a bound.',
    },
    {
      term: '@Inject(RISK_POOL)',
      description:
        'Nest injects the pool by DI token, letting a module control its size, lifecycle, and test replacement.',
    },
  ],

  'memory-diagnostics': [
    {
      term: 'setTimeout(callback, delay)',
      description:
        'Creates a Timer that retains its callback and every captured reference until it fires or is cancelled.',
    },
    {
      term: 'closure',
      description:
        'A function together with access to outer variables. Here the callback continues to retain the webhook payload.',
    },
    {
      term: 'retryQueue.add(...)',
      description:
        'Stores a retry as a durable job that survives process restarts and does not depend on a live Timer.',
    },
    {
      term: 'parseAndEnrich(...)',
      description:
        'A representative parser and enrichment function whose large result should not be captured by a Timer.',
    },
    {
      term: 'retryStore.insert(...)',
      description:
        'Writes retry state to durable storage and returns a small record containing its id and calculated delay.',
    },
    {
      term: 'delay / jobId',
      description:
        'delay postpones the job, while a stable jobId helps prevent the same retry from being enqueued twice.',
    },
  ],

  'production-observability': [
    {
      term: 'NestInterceptor',
      description:
        'A Nest component that wraps the selected controller handler before and after its execution.',
    },
    {
      term: 'ExecutionContext',
      description:
        'Gives the interceptor access to the controller, handler, and transport context of the current request.',
    },
    {
      term: 'next.handle()',
      description:
        'Continues the Nest pipeline and returns an RxJS Observable containing the handler result.',
    },
    {
      term: 'finalize(callback)',
      description:
        'An RxJS operator that invokes the callback on success or error, making it suitable for recording duration.',
    },
    {
      term: 'histogram.observe(labels, value)',
      description:
        'Adds a Prometheus histogram measurement. Every unique label combination creates a separate time series.',
    },
    {
      term: 'context.getClass() / getHandler()',
      description:
        'Return the selected Nest controller class and method; their names form a bounded set of metric labels.',
    },
    {
      term: 'logger.info(fields, message)',
      description:
        'Writes a structured log, keeping high-cardinality request and user IDs searchable without creating Prometheus series.',
    },
  ],

  'nest-dependency-injection': [
    {
      term: '@Injectable()',
      description:
        'Marks a class as a provider whose instance and dependencies can be managed by the Nest IoC container.',
    },
    {
      term: 'new Pool(...)',
      description:
        'Creates a PostgreSQL connection pool manually. Hidden inside a service, it escapes module lifecycle and test replacement.',
    },
    {
      term: 'Symbol("USERS_REPOSITORY")',
      description:
        'Creates a unique DI token for an abstract repository contract without tying it to one concrete class.',
    },
    {
      term: '@Inject(USERS_REPOSITORY)',
      description:
        'Asks Nest to resolve a provider by token and pass it to the constructor parameter.',
    },
    {
      term: 'useClass',
      description:
        'A custom provider that maps a token to the implementation class created and owned by the container.',
    },
    {
      term: '@Module({ providers })',
      description:
        'Declares the module composition root where Nest learns which tokens and classes belong to the DI graph.',
    },
  ],

  'nest-request-lifecycle': [
    {
      term: 'NestInterceptor / next.handle()',
      description:
        'An interceptor runs around a handler; next.handle starts the next pipeline stage and returns an Observable.',
    },
    {
      term: 'lastValueFrom(observable)',
      description:
        'Converts an RxJS Observable into a Promise of its last value; the bad example uses it to flatten the natural interceptor pipeline.',
    },
    {
      term: '@UseGuards(JwtAuthGuard)',
      description:
        'A guard decides whether the request may continue. On denial, the controller and its parameter pipes do not run.',
    },
    {
      term: 'ValidationPipe',
      description:
        'Validates an input DTO and, with transform enabled, converts accepted values to expected types.',
    },
    {
      term: '@UseInterceptors(...)',
      description:
        'Attaches a wrapper for logging, timing, caching, or response transformation to the selected handler.',
    },
    {
      term: '@UseFilters(...)',
      description:
        'Attaches an exception filter that maps an otherwise unhandled exception to a controlled HTTP response.',
    },
  ],

  'database-sql-foundations': [
    {
      term: 'db.query(sql, [values])',
      description:
        'Sends SQL and parameters separately. $1 receives the first value without concatenating user input into SQL syntax.',
    },
    {
      term: 'rowCount',
      description:
        'The number of rows found or changed; the old version uses it for an application-level check.',
    },
    {
      term: 'UNIQUE INDEX ON lower(email)',
      description:
        'Prevents two emails equal under case folding, even when their INSERT statements race.',
    },
    {
      term: 'SQLSTATE 23505',
      description:
        'PostgreSQL’s stable machine code for unique_violation, translated by the application into HTTP 409.',
    },
  ],

  'database-indexes-explain': [
    {
      term: 'CREATE INDEX',
      description:
        'Builds an additional access structure. Every index consumes storage and must be updated when the table changes.',
    },
    {
      term: '(tenant_id, created_at)',
      description:
        'A composite B-tree that groups rows by tenant and then keeps them ordered by created_at.',
    },
    {
      term: 'WHERE status = pending',
      description:
        'A partial-index predicate: only the queried subset is indexed, making the structure smaller.',
    },
    {
      term: 'INCLUDE (id)',
      description:
        'Stores id in leaf pages for a possible index-only scan without adding it to the ordering key.',
    },
    {
      term: 'EXPLAIN (ANALYZE, BUFFERS)',
      description:
        'Actually executes the SELECT and reports real rows, timing, and cache or disk buffer activity.',
    },
  ],

  'database-transactions-locks': [
    {
      term: 'SELECT balance',
      description:
        'Reads a snapshot of the value but does not reserve it against another transaction unless a lock is requested.',
    },
    {
      term: 'UPDATE ... balance = balance - $1',
      description:
        'Computes the new value inside PostgreSQL against the current locked row version.',
    },
    {
      term: 'AND balance >= $1',
      description:
        'Moves the invariant check into the same atomic statement as the mutation.',
    },
    {
      term: 'RETURNING balance',
      description:
        'Returns the new value directly from UPDATE without another SELECT.',
    },
    {
      term: 'result.rowCount === 0',
      description:
        'Means the account did not exist or the sufficient-balance predicate did not pass.',
    },
  ],

  'database-joins-materialized-views': [
    {
      term: 'repository.findRecent(100)',
      description:
        'A representative ORM list call. With lazy relations, related customers have not been loaded yet.',
    },
    {
      term: 'orders.map(async ...)',
      description:
        'Starts a separate customer load for every row, creating the N+1 query pattern.',
    },
    {
      term: 'JOIN customers ...',
      description:
        'Combines orders and customers inside one SQL statement through the matching foreign key.',
    },
    {
      term: 'jsonb_build_object(...)',
      description:
        'A PostgreSQL function that assembles selected customer fields into a JSON object in the query result.',
    },
    {
      term: 'LIMIT $1',
      description:
        'A parameterized row limit; its value is supplied separately from SQL as the first parameter.',
    },
  ],
};
