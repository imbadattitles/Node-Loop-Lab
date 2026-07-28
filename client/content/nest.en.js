const nestDocumentation = {
  label: 'Official NestJS documentation',
  href: 'https://docs.nestjs.com/',
  description:
    'Start with Overview, then read Fundamentals, Techniques, and the relevant Microservices sections completely.',
};

export const nestEnglish = {
  'nest-dependency-injection': {
    title: 'NestJS Dependency Injection and IoC',
    eyebrow: 'Module metadata → tokens → instances',
    summary:
      'Build a real Nest application context and inspect class, value, factory, alias, singleton, and request-scoped providers.',
    theory:
      'Dependency Injection passes dependencies into a consumer instead of creating them inside it. Inversion of Control is broader: Nest owns object construction, relationship resolution, scopes, and lifecycle. Modules describe visibility, runtime tokens identify dependencies, and the IoC container builds the application graph.',
    watchFor:
      'The actual Nest container resolves a config value, class provider, injected factory, and alias. DEFAULT get calls share one instance; REQUEST resolution shares within one ContextId and creates another instance for a different context.',
    expected: [
      'Nest builds a provider graph from module metadata.',
      'A class, string, or Symbol can be a runtime injection token.',
      'useFactory can inject other providers before returning its value.',
      'useExisting adds an alias without constructing another instance.',
      'DEFAULT scope is shared for the application lifecycle.',
      'REQUEST scope creates one instance for each request context.',
      'Closing the application context runs managed lifecycle cleanup.',
    ],
    code: `export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

@Injectable()
class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
  ) {}
}

@Module({
  providers: [
    UsersService,
    { provide: USER_REPOSITORY, useClass: SqlUserRepository },
  ],
  exports: [UsersService],
})
class UsersModule {}`,
    learning: {
      plain:
        'Without a container, a class constructs everything it needs: a repository, logger, and configuration. With a container, the class declares dependencies while Nest assembles the object graph. Think of a workshop where tools are requested by tokens and a central catalog decides the implementation, lifetime, and construction method.',
      foundation:
        'Dependency Injection supplies dependencies from outside a consumer. Inversion of Control also gives the framework responsibility for component construction, relationships, and lifecycle. Nest builds an application graph from module metadata and provider tokens, resolves constructor dependencies, and caches providers according to scope. The ideas resemble Angular DI and Spring IoC but execute inside the Node.js and TypeScript runtime.',
      why:
        'Understanding DI beyond decorators helps design module boundaries, replace infrastructure in tests, diagnose resolution errors, manage lifetimes, and avoid turning the container into a hidden global service locator.',
      resources: [
        nestDocumentation,
        {
          label: 'Providers',
          href: 'https://docs.nestjs.com/providers',
          description:
            'Provider fundamentals, constructor injection, and module registration.',
        },
        {
          label: 'Custom providers',
          href: 'https://docs.nestjs.com/fundamentals/custom-providers',
          description:
            'useValue, useClass, useFactory, useExisting, and runtime tokens.',
        },
        {
          label: 'Injection scopes',
          href: 'https://docs.nestjs.com/fundamentals/injection-scopes',
          description:
            'DEFAULT, REQUEST, and TRANSIENT lifetimes and their cost.',
        },
      ],
      runtimeLayers: [
        {
          title: 'MODULE METADATA',
          detail: 'imports · providers · exports',
          active: true,
        },
        { title: 'DI TOKENS', detail: 'class · Symbol · string' },
        { title: 'NEST IoC', detail: 'graph · resolve · scopes' },
        { title: 'INSTANCES', detail: 'service · repo · adapters' },
      ],
      terms: [
        ['Dependency', 'An object or value a consumer needs to perform its work.'],
        ['Dependency Injection', 'Supplying dependencies from outside instead of constructing them inside the class.'],
        ['Inversion of Control', 'The broader principle where a framework controls component creation and invocation.'],
        ['Provider', 'A token-to-value recipe that can produce a class instance, value, factory result, or alias.'],
        ['Injection token', 'A runtime dependency identifier: class, string, or Symbol. A TypeScript interface is erased and cannot be a token by itself.'],
        ['Application graph', 'The graph of modules, providers, and dependencies Nest builds during bootstrap.'],
        ['Scope', 'Provider lifetime: application singleton, one instance per request, or transient per consumer.'],
        ['Composition root', 'The place where infrastructure implementations are bound to application contracts; Nest module metadata fills this role.'],
      ],
      steps: [
        ['Read module metadata', 'imports expose modules, providers define local registrations, and exports define the public module API.'],
        ['Build the token graph', 'Each constructor dependency becomes a request for a runtime token.'],
        ['Find a provider', 'The container searches the current module context and exports of imported modules.'],
        ['Resolve provider dependencies', 'Factories and constructors can depend on other tokens, producing a recursive order.'],
        ['Create or reuse an instance', 'DEFAULT is cached for the app, REQUEST for a request ContextId, and TRANSIENT for each consumer.'],
        ['Close the lifecycle', 'app.close invokes the appropriate lifecycle hooks of managed providers.'],
      ],
      nuances: [
        ['DI and IoC are not exact synonyms', 'DI is one technique for implementing IoC. Nest also controls request dispatch and lifecycle hooks.'],
        ['A module is a visibility boundary', '@Injectable alone does not make a provider global; registration, exports, and imports determine access.'],
        ['Interfaces disappear at runtime', 'Use a class, Symbol, string, or abstract class when Nest needs a runtime token.'],
        ['REQUEST scope bubbles upward', 'A controller consuming a request-scoped service also becomes request-scoped, adding allocations and latency.'],
        ['Circular dependencies are design signals', 'forwardRef may unblock resolution, but first look for an incorrect dependency direction or missing orchestration service.'],
        ['Do not turn the container into a service locator', 'ModuleRef and NestApplication.get() have edge-case uses, while explicit constructor dependencies keep normal business code honest.'],
      ],
      pitfalls: [
        ['@Injectable makes a service available everywhere.', 'It attaches metadata; module providers, imports, and exports define visibility.'],
        ['DI exists only for unit tests.', 'Test replacement is a benefit; explicit dependencies and controlled lifetimes are the architectural value.'],
        ['Every request gets new instances of every service.', 'DEFAULT is an application singleton. REQUEST must be selected explicitly.'],
        ['A TypeScript interface can be passed directly to @Inject.', 'The interface does not exist in JavaScript runtime, so Nest needs a real token.'],
        ['forwardRef fixes any circular architecture.', 'It fixes graph resolution but does not remove coupling or ambiguous construction order.'],
      ],
      codeIntro:
        'The runtime creates a real Nest application context without HTTP. It binds a useValue config, class provider, useFactory logger, and useExisting alias, then compares DEFAULT and REQUEST scopes through ContextId.',
      codeNotes: [
        'DI_CONFIG and AUDIT_LOGGER are Symbols because TypeScript interfaces do not exist at runtime.',
        'DatabaseConnection receives configuration through constructor injection.',
        'The useFactory arguments are themselves resolved from its inject array.',
        'useExisting points to the same UsersService instead of creating another one.',
        'The same ContextId shares a request provider; a new ContextId gets a new instance.',
        'createApplicationContext applies Nest DI without starting an HTTP server.',
      ],
      examples: [
        {
          title: '01 · Regular class provider',
          goal:
            'The consumer declares a dependency and the module registers its implementation.',
          code: `@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository) {}
}

@Module({
  providers: [UsersRepository, UsersService],
  exports: [UsersService],
})
export class UsersModule {}`,
          notes: [
            'A controller should not construct UsersService with new.',
            'UsersRepository stays private until it is exported.',
          ],
        },
        {
          title: '02 · Symbol token for an application port',
          goal:
            'Business logic depends on a contract while the composition root selects an adapter.',
          code: `export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

@Injectable()
class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
  ) {}
}

const provider = {
  provide: USER_REPOSITORY,
  useClass: PostgresUserRepository,
};`,
          notes: [
            'The database section can later provide the PostgreSQL adapter.',
            'Tests replace the token with an in-memory implementation.',
          ],
        },
        {
          title: '03 · Async factory provider',
          goal:
            'Create a connection or pool before any dependent provider is constructed.',
          code: `const databaseProvider = {
  provide: DATABASE,
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const pool = new Pool({
      connectionString: config.getOrThrow('DATABASE_URL'),
    });
    await pool.query('select 1');
    return pool;
  },
};`,
          notes: [
            'Nest awaits the factory Promise before creating consumers.',
            'A connection pool is normally a singleton, not request-scoped.',
          ],
        },
        {
          title: '04 · Select scope from data lifetime',
          goal:
            'Use request scope only for genuinely request-local state.',
          code: `@Injectable({ scope: Scope.REQUEST })
class RequestContext {
  constructor(@Inject(REQUEST) readonly request: Request) {}
}

@Injectable({ scope: Scope.TRANSIENT })
class OperationTimer {
  readonly startedAt = performance.now();
}`,
          notes: [
            'DEFAULT is recommended for most services.',
            'A request-scoped dependency changes the entire consumer chain.',
          ],
        },
        {
          title: '05 · Override a provider in tests',
          goal:
            'Exercise a use case without a network or real database.',
          code: `const module = await Test.createTestingModule({
  imports: [UsersModule],
})
  .overrideProvider(USER_REPOSITORY)
  .useValue(new InMemoryUserRepository())
  .compile();

const service = module.get(UsersService);`,
          notes: [
            'The test double uses the same token as the production adapter.',
            'A difficult override can reveal an overly broad module boundary.',
          ],
        },
      ],
      questions: [
        'How is IoC broader than Dependency Injection?',
        'How does Nest find a provider exported by another feature module?',
        'Why can an interface not be an injection token after compilation?',
        'When does useExisting differ from useClass?',
        'How can a request-scoped provider change a controller lifetime?',
        'What would you try before forwardRef in a UsersService and OrdersService cycle?',
      ],
    },
  },
  'nest-request-lifecycle': {
    title: 'NestJS request lifecycle',
    eyebrow: 'Middleware → policy → handler → outcome',
    summary:
      'Send real requests through Nest middleware, guards, interceptors, pipes, a controller, service, and exception filter.',
    theory:
      'Nest builds a request pipeline over an HTTP platform adapter such as Express or Fastify. A successful request generally flows through middleware, guards, pre-controller interceptors, pipes, controller and service, then post-controller interceptors. An unhandled exception skips the remaining normal path and goes to the matching exception filter.',
    watchFor:
      'The runtime sends three requests to a real ephemeral Nest server. Success traverses the complete normal path; an invalid id leaves from the pipe; a denied request stops at the guard before any interceptor, pipe, or controller.',
    expected: [
      'Middleware runs before route-aware Nest components.',
      'A guard allows or denies the selected handler.',
      'An interceptor wraps the handler before and after next.handle().',
      'A pipe validates and transforms controller arguments.',
      'The controller delegates application work to an injected service.',
      'Exception filters appear only on an uncaught error path.',
      'Middleware and interceptors solve different problems.',
    ],
    code: `@Controller('users')
@UseGuards(AuthGuard)
@UseInterceptors(TimingInterceptor)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.users.getOne(id);
  }
}`,
    learning: {
      plain:
        'An HTTP request crosses checkpoints with different responsibilities, not one list of identical callbacks. Middleware works at the HTTP adapter entrance, a guard decides whether the handler may run, an interceptor wraps the handler, a pipe prepares arguments, and the controller invokes a use case. An unhandled error leaves the normal route and goes directly to a matching exception filter.',
      foundation:
        'Nest builds a request pipeline over Express or Fastify. A general success order is middleware, guards, interceptors before, pipes, controller and service, interceptors after, and response. Interceptors return RxJS Observables, so the post-handler side unwinds in reverse order. An unhandled exception from a guard, pipe, controller, or service skips the rest of the normal path and enters the exceptions layer.',
      why:
        'Knowing the pipeline puts validation, authorization, logging, response mapping, and error translation in the correct layer. A senior explanation includes the reason middleware does not replace a guard and an interceptor does not replace an exception filter.',
      resources: [
        nestDocumentation,
        {
          label: 'Request lifecycle',
          href: 'https://docs.nestjs.com/faq/request-lifecycle',
          description:
            'Official global, controller, route, success, and error ordering.',
        },
        {
          label: 'Interceptors',
          href: 'https://docs.nestjs.com/interceptors',
          description:
            'ExecutionContext, CallHandler, RxJS wrapping, and response mapping.',
        },
        {
          label: 'Kafka transporter',
          href: 'https://docs.nestjs.com/microservices/kafka',
          description:
            'Message and event patterns, consumer groups, reply topics, and Kafka context.',
        },
      ],
      runtimeLayers: [
        {
          title: 'HTTP ADAPTER',
          detail: 'Express/Fastify · middleware',
          active: true,
        },
        { title: 'POLICY', detail: 'guards · interceptors' },
        { title: 'ARGUMENTS', detail: 'pipes · controller' },
        { title: 'OUTCOME', detail: 'post-interceptor · filter' },
      ],
      terms: [
        ['Middleware', 'An HTTP-level request, response, and next function that runs before route-aware Nest components.'],
        ['ExecutionContext', 'A Nest wrapper exposing the current handler, controller class, and transport-specific context.'],
        ['Guard', 'A route-aware policy deciding whether a request can enter a handler, commonly for authorization.'],
        ['Interceptor', 'A wrapper with code before next.handle() and an Observable pipeline after it.'],
        ['Pipe', 'Validation or transformation of controller method arguments before invocation.'],
        ['Exception filter', 'A handler that converts an unhandled exception into a transport-specific response.'],
        ['Controller', 'A transport boundary receiving prepared arguments and delegating to an application service or use case.'],
        ['Platform adapter', 'The Nest integration with an HTTP engine, usually Express or Fastify.'],
      ],
      steps: [
        ['Middleware', 'Global then module-bound middleware can normalize raw HTTP, attach request IDs, or terminate a response.'],
        ['Guards', 'Global, controller, then route guards use ExecutionContext and metadata for authentication and authorization.'],
        ['Interceptors — inbound', 'Global, controller, then route interceptors start timing, tracing, caching, or handler wrapping.'],
        ['Pipes', 'Controller arguments are validated and transformed; a pipe error prevents controller execution.'],
        ['Controller and service', 'The controller handles the transport boundary and delegates application logic to providers.'],
        ['Interceptors — outbound', 'Route, controller, then global interceptors can map the result or handle Observable errors.'],
        ['Exception filter — error only', 'An uncaught exception stops normal flow; filters resolve from route to controller to global.'],
      ],
      nuances: [
        ['Middleware does not know the final handler', 'It has raw HTTP objects but not the handler metadata exposed by ExecutionContext, so @Roles authorization belongs in a guard.'],
        ['An interceptor works on both sides', 'It can time, map, cache, timeout, or catch the handler Observable; code after middleware next is not the same abstraction.'],
        ['Filters are not a normal chain', 'The nearest filter that catches an exception completes processing; the same exception is not automatically passed onward.'],
        ['Global registration affects DI', 'A manually constructed global guard lives outside module DI, while APP_GUARD or APP_INTERCEPTOR providers keep full injection.'],
        ['Parameter pipes have extra ordering', 'After global, controller, and route pipes, parameter-specific pipes run from the last method parameter toward the first.'],
        ['Microservices change the boundary, not every concept', 'DI, guards, pipes, interceptors, and filters also apply to message handlers, while HTTP middleware becomes transport context and message patterns.'],
      ],
      pitfalls: [
        ['An exception filter always runs after the controller.', 'It runs only for an uncaught exception; successful requests never enter it.'],
        ['Middleware and interceptors differ only in naming.', 'Middleware belongs to the HTTP adapter and next(); an interceptor is route-aware and wraps a CallHandler Observable.'],
        ['A guard validates DTOs.', 'A guard decides handler access; pipes validate and transform arguments.'],
        ['A controller should contain business logic and SQL.', 'A controller is a transport boundary; use cases and persistence belong to injected providers.'],
        ['Kafka microservices automatically make a pet project senior-level.', 'Without bounded contexts, ownership, delivery semantics, idempotency, and observability, a broker only adds distributed failures.'],
      ],
      codeIntro:
        'The runtime starts a real Nest HTTP server on an ephemeral loopback port. The success trace shows normal flow, an invalid id moves from the pipe to a filter, and a denied request stops in the guard before later layers.',
      codeNotes: [
        'Middleware appends a trace before Nest enters route-aware components.',
        'The guard reads ExecutionContext and either allows or throws ForbiddenException.',
        'The interceptor records before next.handle() and after the controller through RxJS map.',
        'A request-scoped pipe transforms id or throws BadRequestException.',
        'The filter serializes error responses and is absent from success.',
        'The ephemeral server always closes in finally.',
      ],
      examples: [
        {
          title: '01 · Middleware and interceptor',
          goal:
            'Create a request ID at the HTTP boundary and measure one selected route handler.',
          code: `// middleware
use(req, res, next) {
  req.id = req.headers['x-request-id'] ?? randomUUID();
  next();
}

// interceptor
intercept(context: ExecutionContext, next: CallHandler) {
  const startedAt = performance.now();
  return next.handle().pipe(
    finalize(() => recordLatency(context.getHandler(), startedAt)),
  );
}`,
          notes: [
            'Middleware fits raw HTTP normalization.',
            'The interceptor knows the class and handler and observes Observable completion.',
          ],
        },
        {
          title: '02 · Guard with route metadata',
          goal:
            'Authorization policy reads @Roles from the selected handler.',
          code: `@Injectable()
class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    return roles?.some(role => currentUser(context).roles.includes(role))
      ?? true;
  }
}`,
          notes: [
            'Authentication can attach the current user earlier.',
            'The guard answers access policy; it does not transform the DTO.',
          ],
        },
        {
          title: '03 · ValidationPipe at the boundary',
          goal:
            'Keep invalid and unknown fields out of the application service.',
          code: `app.useGlobalPipes(new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
}));

@Post()
create(@Body() command: CreateUserDto) {
  return this.createUser.execute(command);
}`,
          notes: [
            'DTO validation does not replace business invariants.',
            'transform can convert primitive route and query values.',
          ],
        },
        {
          title: '04 · Exception filter translation',
          goal:
            'Define one transport representation for a domain error.',
          code: `@Catch(UserAlreadyExistsError)
class UserConflictFilter implements ExceptionFilter {
  catch(error: UserAlreadyExistsError, host: ArgumentsHost) {
    host.switchToHttp().getResponse().status(409).json({
      code: 'USER_ALREADY_EXISTS',
      message: error.message,
    });
  }
}`,
          notes: [
            'The domain error does not need to import HttpException.',
            'Do not hide unexpected exceptions without logging and a correlation ID.',
          ],
        },
        {
          title: '05 · Pet project as a modular monolith',
          goal:
            'Establish boundaries that could later become separate services.',
          code: `AppModule
├── IdentityModule       // users, sessions, access
├── CatalogModule        // products, prices
├── OrdersModule         // checkout, order state
├── NotificationsModule  // email/push adapters
└── ObservabilityModule  // logs, metrics, tracing

// Each feature exports use cases while owning
// its repository ports and database tables.`,
          notes: [
            'One deployment is easier to debug while learning.',
            'Module boundaries remain useful without a network boundary.',
            'The database section can add repository adapters and transactions.',
          ],
        },
        {
          title: '06 · Kafka follows a requirement',
          goal:
            'Separate a local database transaction from asynchronous event delivery.',
          code: `// Inside the Orders DB transaction:
await orders.save(order, transaction);
await outbox.append({
  id: eventId,
  topic: 'order.created.v1',
  key: order.id,
  payload: { orderId: order.id, userId: order.userId },
}, transaction);

// A relay publishes the outbox to Kafka.
// The consumer stores processed eventId for idempotency.`,
          notes: [
            'A direct DB commit plus Kafka publish creates a dual-write problem.',
            'Event schema versioning and ownership matter more than a Nest decorator.',
            'Kafka retries require idempotent consumers.',
          ],
        },
      ],
      questions: [
        'Why is the exception filter absent from the successful trace?',
        'Which component should enforce @Roles authorization and why?',
        'How does an interceptor after next.handle differ from middleware after next?',
        'What happens to the controller when a pipe throws BadRequestException?',
        'Why can APP_GUARD be preferable to a manually constructed global guard?',
        'Which problems should exist before splitting a modular monolith into Kafka microservices?',
      ],
    },
  },
};
