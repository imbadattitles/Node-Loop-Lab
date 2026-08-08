const nestDocumentation = {
  label: 'Официальная документация NestJS',
  href: 'https://docs.nestjs.com/',
  description:
    'Начните с Overview, затем полностью пройдите Fundamentals, Techniques и нужные разделы Microservices.',
};

export const nestLearningRu = {
  'nest-dependency-injection': {
    plain:
      'Без контейнера класс сам создаёт всё, что ему нужно: new Repository(), new Logger(), чтение config. С контейнером класс только объявляет зависимости, а Nest собирает граф объектов. Это похоже на мастерскую: инструмент заказывается по жетону, а конкретный экземпляр, его lifetime и способ создания определяет центральный каталог.',
    foundation:
      'Dependency Injection — способ передать объекту его зависимости извне. Inversion of Control шире: код отдаёт framework контроль над созданием объектов, их связями и lifecycle. Nest строит application graph из metadata модулей и provider tokens, разрешает constructor dependencies и кэширует providers согласно scope. Идеи знакомы по Angular DI и Spring IoC, но исполняются внутри Node.js и TypeScript runtime.',
    why:
      'Глубокое понимание DI отделяет архитектуру от набора декораторов. Оно позволяет проектировать module boundaries, заменять инфраструктуру в тестах, диагностировать «Nest can’t resolve dependencies», управлять lifetime и не превращать приложение в скрытый global service locator.',
    resources: [
      nestDocumentation,
      {
        label: 'Providers',
        href: 'https://docs.nestjs.com/providers',
        description:
          'Базовая модель providers, constructor injection и регистрация в module.',
      },
      {
        label: 'Custom providers',
        href: 'https://docs.nestjs.com/fundamentals/custom-providers',
        description:
          'useValue, useClass, useFactory, useExisting и runtime tokens.',
      },
      {
        label: 'Injection scopes',
        href: 'https://docs.nestjs.com/fundamentals/injection-scopes',
        description:
          'DEFAULT, REQUEST и TRANSIENT lifetime и их стоимость.',
      },
    ],
    runtimeLayers: [
      {
        title: 'MODULE METADATA',
        detail: 'imports · providers · exports',
        active: true,
      },
      {
        title: 'DI TOKENS',
        detail: 'class · Symbol · string',
      },
      {
        title: 'NEST IoC',
        detail: 'graph · resolve · scopes',
      },
      {
        title: 'INSTANCES',
        detail: 'service · repo · adapters',
      },
    ],
    terms: [
      {
        name: 'Dependency',
        description:
          'Объект или значение, без которого consumer не может выполнить свою работу.',
      },
      {
        name: 'Dependency Injection',
        description:
          'Передача dependencies consumer-у извне вместо их создания внутри класса.',
      },
      {
        name: 'Inversion of Control',
        description:
          'Архитектурный принцип, при котором framework управляет созданием и вызовом пользовательских компонентов.',
      },
      {
        name: 'Provider',
        description:
          'Регистрация token → способ получить значение. Provider может возвращать class instance, value, factory result или alias.',
      },
      {
        name: 'Injection token',
        description:
          'Runtime-идентификатор dependency: class, string или Symbol. TypeScript interface сам token-ом быть не может, потому что стирается при компиляции.',
      },
      {
        name: 'Application graph',
        description:
          'Граф модулей, providers и зависимостей, который Nest строит при bootstrap.',
      },
      {
        name: 'Scope',
        description:
          'Lifetime provider: singleton DEFAULT, один instance на request или TRANSIENT instance на consumer.',
      },
      {
        name: 'Composition root',
        description:
          'Место, где инфраструктурные реализации связываются с application contracts; в Nest эту роль выполняет module graph.',
      },
    ],
    steps: [
      {
        title: 'Nest читает Module metadata',
        description:
          'imports определяют доступные модули, providers — локальные регистрации, exports — публичный API модуля.',
      },
      {
        title: 'Строится граф tokens',
        description:
          'Каждая constructor dependency превращается в запрос runtime token.',
      },
      {
        title: 'Container ищет provider',
        description:
          'Сначала в текущем module context, затем среди exports импортированных модулей.',
      },
      {
        title: 'Разрешаются зависимости provider-а',
        description:
          'Factory или constructor может сам зависеть от других tokens; контейнер рекурсивно строит порядок.',
      },
      {
        title: 'Создаётся или возвращается instance',
        description:
          'DEFAULT кэшируется на lifecycle приложения, REQUEST — на ContextId запроса, TRANSIENT — на consumer.',
      },
      {
        title: 'Lifecycle закрывается',
        description:
          'При app.close Nest вызывает соответствующие lifecycle hooks управляемых providers.',
      },
    ],
    nuances: [
      {
        title: 'DI и IoC — не полные синонимы',
        description:
          'DI является техникой реализации IoC. Framework также инвертирует контроль над request pipeline, lifecycle hooks и route dispatch.',
      },
      {
        title: 'Module — граница видимости',
        description:
          'Provider не становится глобальным только из-за @Injectable. Его нужно зарегистрировать, экспортировать из owner module и импортировать там, где он требуется.',
      },
      {
        title: 'Интерфейс исчезает в runtime',
        description:
          'TypeScript interface полезен для типов, но Nest нужен существующий runtime token. Для ports обычно используют Symbol или abstract class.',
      },
      {
        title: 'REQUEST scope распространяется вверх',
        description:
          'Если singleton controller зависит от request-scoped service, controller тоже должен создаваться на запрос. Это увеличивает allocations и latency.',
      },
      {
        title: 'Circular dependency — сигнал дизайна',
        description:
          'forwardRef может разблокировать контейнер, но сначала ищите неверное направление зависимости или недостающий третий orchestration service.',
      },
      {
        title: 'Container не должен стать service locator',
        description:
          'NestApplication.get() и ModuleRef полезны в composition/lifecycle edge cases. В обычном business code явный constructor лучше показывает контракт.',
      },
    ],
    pitfalls: [
      {
        myth: '@Injectable автоматически делает service доступным везде.',
        fact: 'Decorator добавляет metadata. Доступность определяется providers/imports/exports module graph.',
      },
      {
        myth: 'DI нужен только для unit-тестов.',
        fact: 'Тестируемость — следствие. Основная ценность — явные зависимости, заменяемая инфраструктура и контролируемый lifecycle.',
      },
      {
        myth: 'Каждый request получает новые экземпляры всех services.',
        fact: 'DEFAULT scope является singleton на application lifecycle. REQUEST нужно выбирать явно.',
      },
      {
        myth: 'TypeScript interface можно напрямую передать в @Inject.',
        fact: 'Interface отсутствует в JavaScript runtime; нужен class, Symbol, string или другой существующий token.',
      },
      {
        myth: 'forwardRef нормально решает любую циклическую архитектуру.',
        fact: 'Он решает техническое разрешение graph, но не устраняет сильную связанность и неопределённый порядок создания.',
      },
    ],
    codeIntro:
      'Запускаемый пример создаёт настоящий Nest application context без HTTP. Container связывает useValue config, class provider, useFactory logger и useExisting alias, затем сравнивает DEFAULT и REQUEST scopes через ContextId.',
    codeNotes: [
      '`DI_CONFIG` и `AUDIT_LOGGER` — Symbols, потому что TypeScript interfaces не существуют в runtime.',
      '`DatabaseConnection` получает config через constructor injection.',
      '`useFactory` тоже использует container: её аргументы перечислены в `inject`.',
      '`useExisting` не создаёт второй UsersService, а добавляет alias к тому же instance.',
      'Два resolve с одним ContextId возвращают один request-scoped instance; новый ContextId — новый instance.',
      '`createApplicationContext` позволяет применять Nest DI без HTTP-сервера.',
    ],
    examples: [
      {
        title: '01 · Обычный class provider',
        goal:
          'Consumer объявляет dependency, а module регистрирует доступную реализацию.',
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
          'Controller не должен создавать UsersService через new.',
          'UsersRepository остаётся внутренним, пока не добавлен в exports.',
        ],
      },
      {
        title: '02 · Symbol token для application port',
        goal:
          'Business service зависит от контракта, а composition root выбирает adapter.',
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
          'Реальный Postgres adapter и параметризованный SQL разобраны в следующем блоке баз данных.',
          'В unit-тесте token заменяется in-memory implementation.',
        ],
      },
      {
        title: '03 · Async factory provider',
        goal:
          'Один раз создать connection/pool до providers, которые от него зависят.',
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
          'Nest дождётся Promise factory до создания consumers.',
          'Pool обычно singleton, а не request-scoped provider.',
        ],
      },
      {
        title: '04 · Scope выбирается по lifetime данных',
        goal:
          'Использовать request scope только для действительно request-local state.',
        code: `@Injectable({ scope: Scope.REQUEST })
class RequestContext {
  constructor(@Inject(REQUEST) readonly request: Request) {}
}

@Injectable({ scope: Scope.TRANSIENT })
class OperationTimer {
  readonly startedAt = performance.now();
}`,
        notes: [
          'DEFAULT рекомендуется для большинства services.',
          'Request-scoped dependency делает request-scoped всю цепочку consumers.',
        ],
      },
      {
        title: '05 · Override provider в тесте',
        goal:
          'Проверить use case без сети и настоящей базы данных.',
        code: `const module = await Test.createTestingModule({
  imports: [UsersModule],
})
  .overrideProvider(USER_REPOSITORY)
  .useValue(new InMemoryUserRepository())
  .compile();

const service = module.get(UsersService);`,
        notes: [
          'Mock привязан к тому же token, что production adapter.',
          'Если override сложен, module boundary, возможно, слишком широкий.',
        ],
      },
    ],
    questions: [
      'Чем IoC шире Dependency Injection?',
      'Как Nest найдёт provider из другого feature module?',
      'Почему interface не работает как injection token после компиляции?',
      'Когда useExisting отличается от useClass?',
      'Как request-scoped provider способен незаметно изменить lifetime controller?',
      'Что вы сначала попробуете вместо forwardRef при цикле UsersService ↔ OrdersService?',
    ],
  },
  'nest-request-lifecycle': {
    plain:
      'HTTP-запрос проходит не через одну цепочку одинаковых функций, а через контрольные пункты с разной ответственностью. Middleware работает у входа на уровне HTTP adapter. Guard решает, разрешён ли конкретный handler. Interceptor оборачивает handler. Pipe готовит аргументы. Controller вызывает use case. При необработанной ошибке поезд сходит с обычного маршрута и сразу идёт к подходящему exception filter.',
    foundation:
      'Nest строит request pipeline поверх platform adapter — обычно Express или Fastify. Для success path общий порядок: middleware → guards → interceptors before → pipes → controller/service → interceptors after → response. Interceptors возвращают RxJS Observable, поэтому post-handler часть разматывается в обратном порядке. Если guard, pipe, controller или service бросает необработанное исключение, оставшийся normal flow пропускается и exceptions layer выбирает filter.',
    why:
      'Понимание pipeline позволяет положить validation, authorization, logging, mapping и error handling в правильные места. На собеседовании важен не только заученный порядок, но и способность объяснить, почему middleware не заменяет guard, а interceptor — exception filter.',
    resources: [
      nestDocumentation,
      {
        label: 'Request lifecycle',
        href: 'https://docs.nestjs.com/faq/request-lifecycle',
        description:
          'Официальный порядок global/controller/route components и error path.',
      },
      {
        label: 'Interceptors',
        href: 'https://docs.nestjs.com/interceptors',
        description:
          'ExecutionContext, CallHandler, RxJS wrapping и response mapping.',
      },
      {
        label: 'Kafka transporter',
        href: 'https://docs.nestjs.com/microservices/kafka',
        description:
          'Message/event patterns, consumer groups, reply topics и Kafka context.',
      },
    ],
    runtimeLayers: [
      {
        title: 'HTTP ADAPTER',
        detail: 'Express/Fastify · middleware',
        active: true,
      },
      {
        title: 'POLICY',
        detail: 'guards · interceptors',
      },
      {
        title: 'ARGUMENTS',
        detail: 'pipes · controller',
      },
      {
        title: 'OUTCOME',
        detail: 'post-interceptor · filter',
      },
    ],
    terms: [
      {
        name: 'Middleware',
        description:
          'HTTP-level функция request/response/next, исполняемая до route-aware Nest components.',
      },
      {
        name: 'ExecutionContext',
        description:
          'Обёртка Nest над текущим handler, controller class и transport-specific context.',
      },
      {
        name: 'Guard',
        description:
          'Route-aware policy, решающая, может ли запрос войти в handler; типичный use case — authorization.',
      },
      {
        name: 'Interceptor',
        description:
          'Компонент вокруг handler: код до `next.handle()` и Observable pipeline после него.',
      },
      {
        name: 'Pipe',
        description:
          'Validation или transformation конкретных аргументов до вызова controller method.',
      },
      {
        name: 'Exception filter',
        description:
          'Обработчик необработанных exceptions, переводящий их в transport-specific response.',
      },
      {
        name: 'Controller',
        description:
          'Transport boundary, который получает подготовленные аргументы и делегирует application service/use case.',
      },
      {
        name: 'Platform adapter',
        description:
          'Связка Nest с конкретным HTTP engine, обычно Express или Fastify.',
      },
    ],
    steps: [
      {
        title: 'Middleware',
        description:
          'Выполняется global, затем module-bound порядок. Может читать raw headers, добавить request id или завершить response.',
      },
      {
        title: 'Guards',
        description:
          'Global → controller → route. Используют ExecutionContext и metadata handler-а для authentication/authorization policy.',
      },
      {
        title: 'Interceptors — вход',
        description:
          'Global → controller → route. Запускают timing, tracing, caching или оборачивают следующий этап.',
      },
      {
        title: 'Pipes',
        description:
          'Проверяют и преобразуют controller arguments. Ошибка pipe не допускает controller.',
      },
      {
        title: 'Controller и service',
        description:
          'Controller оркестрирует transport boundary и вызывает application logic через injected providers.',
      },
      {
        title: 'Interceptors — выход',
        description:
          'Разматываются route → controller → global и могут изменить result или обработать Observable error.',
      },
      {
        title: 'Exception filter — только error path',
        description:
          'При uncaught exception normal flow прекращается. Поиск filter идёт от route к controller и global.',
      },
    ],
    nuances: [
      {
        title: 'Middleware не знает конечный handler',
        description:
          'У него есть URL и raw HTTP objects, но нет route metadata через ExecutionContext. Поэтому authorization по @Roles обычно относится к Guard.',
      },
      {
        title: 'Interceptor работает с обеих сторон',
        description:
          'Он может измерить handler, преобразовать response, добавить timeout/cache или перехватить Observable error. Middleware после next не эквивалентен этой Nest abstraction.',
      },
      {
        title: 'Filters не образуют обычную цепочку',
        description:
          'Самый близкий filter, поймавший exception, завершает обработку; тот же exception не передаётся следующим filters автоматически.',
      },
      {
        title: 'Global registration влияет на DI',
        description:
          'Component, созданный вручную через app.useGlobalGuards(new Guard()), находится вне module provider graph. APP_GUARD/APP_INTERCEPTOR providers сохраняют полноценную injection.',
      },
      {
        title: 'Parameter pipes имеют дополнительный порядок',
        description:
          'После global/controller/route pipes parameter-specific pipes запускаются от последнего параметра method к первому.',
      },
      {
        title: 'Microservice transport меняет boundary, не все концепции',
        description:
          'DI, guards, pipes, interceptors и filters применимы и к message handlers, но HTTP middleware/request/response заменяются transport context и message patterns.',
      },
    ],
    pitfalls: [
      {
        myth: 'Exception filter всегда выполняется после controller.',
        fact: 'Он запускается только для uncaught exception. Успешный request вообще не проходит через filter.',
      },
      {
        myth: 'Middleware и interceptor отличаются только названием.',
        fact: 'Middleware относится к HTTP adapter и next(); interceptor route-aware и оборачивает CallHandler Observable до и после handler.',
      },
      {
        myth: 'Guard нужен для валидации DTO.',
        fact: 'Guard отвечает за допуск к handler. Валидация/transform аргументов — задача Pipe.',
      },
      {
        myth: 'Controller должен содержать бизнес-логику и SQL.',
        fact: 'Controller является transport boundary; use cases и persistence делегируются providers.',
      },
      {
        myth: 'Микросервисы с Kafka автоматически делают pet-project senior-level.',
        fact: 'Без bounded contexts, ownership, delivery semantics, idempotency и observability broker лишь добавляет распределённые отказы.',
      },
    ],
    codeIntro:
      'Runtime поднимает настоящий Nest HTTP server на случайном loopback-порту и после события server ready последовательно делает три независимых запроса. Для каждого trace заранее показывает номер, method, URL, значимый header и ожидаемый статус: 1/3 — HTTP 200, 2/3 — ожидаемый HTTP 400 из Pipe, 3/3 — ожидаемый HTTP 403 из Guard.',
    codeNotes: [
      'Middleware добавляет trace до того, как Nest выбрал route-aware components.',
      'Guard читает ExecutionContext и либо пропускает, либо бросает ForbiddenException.',
      'Interceptor добавляет событие до `next.handle()` и через RxJS map — после controller.',
      'Request-scoped Pipe преобразует id и бросает BadRequestException при ошибке.',
      'Filter сериализует error response; на success path он не появляется.',
      'После всех запросов finally штатно закрывает временный server. Зелёное teardown-событие с exitCode 0 означает нормальное завершение сценария, а не падение приложения.',
    ],
    examples: [
      {
        title: '01 · Middleware и Interceptor решают разные задачи',
        goal:
          'Request id создаётся на HTTP boundary, а timing измеряет конкретный route handler.',
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
          'Middleware хорошо подходит для raw HTTP normalization.',
          'Interceptor знает class/handler и видит завершение Observable.',
        ],
      },
      {
        title: '02 · Guard использует route metadata',
        goal:
          'Authorization policy зависит от @Roles конкретного handler.',
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
          'Authentication может подготовить user раньше.',
          'Guard отвечает на вопрос допуска, а не изменяет DTO.',
        ],
      },
      {
        title: '03 · ValidationPipe на system boundary',
        goal:
          'Не пускать невалидные и лишние поля в application service.',
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
          'DTO validation не заменяет business invariants.',
          'transform может превратить primitive route/query values.',
        ],
      },
      {
        title: '04 · Filter переводит domain/HTTP error',
        goal:
          'Централизованно задать transport representation ошибки.',
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
          'Domain error не обязан импортировать HttpException.',
          'Не скрывайте unexpected exception без logging/correlation id.',
        ],
      },
      {
        title: '05 · Pet-project как modular monolith',
        goal:
          'Сначала закрепить boundaries, которые позже можно вынести в services.',
        code: `AppModule
├── IdentityModule       // users, sessions, access
├── CatalogModule        // products, prices
├── OrdersModule         // checkout, order state
├── NotificationsModule  // email/push adapters
└── ObservabilityModule  // logs, metrics, tracing

// Каждый feature module экспортирует use cases,
// но владеет своими repository ports и таблицами.`,
        notes: [
          'Один deploy проще отлаживать во время обучения.',
          'Module boundary полезен даже без network boundary.',
          'Будущий раздел БД добавит repository adapters и transactions.',
        ],
      },
      {
        title: '06 · Kafka появляется из требования, не из моды',
        goal:
          'Отделить local transaction от асинхронной доставки event.',
        code: `// В transaction Orders DB:
await orders.save(order, transaction);
await outbox.append({
  id: eventId,
  topic: 'order.created.v1',
  key: order.id,
  payload: { orderId: order.id, userId: order.userId },
}, transaction);

// Отдельный relay публикует outbox в Kafka.
// Consumer хранит processed eventId для idempotency.`,
        notes: [
          'Прямой DB commit + Kafka publish создаёт dual-write problem.',
          'Event schema versioning и ownership важнее Nest decorator.',
          'Kafka retries означают, что consumer обязан быть idempotent.',
        ],
      },
    ],
    questions: [
      'Почему exception filter отсутствует в successful trace?',
      'Какой компонент выберете для @Roles authorization и почему?',
      'Чем post-handler часть interceptor отличается от кода middleware после next?',
      'Что произойдёт с controller, если Pipe бросит BadRequestException?',
      'Почему global APP_GUARD лучше manually constructed guard при dependency injection?',
      'Какие проблемы должны появиться, прежде чем modular monolith стоит разделить на Kafka microservices?',
    ],
  },
};
