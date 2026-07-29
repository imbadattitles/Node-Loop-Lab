const cachingLayers = [
  { title: 'CLIENT / CDN', detail: 'Cache-Control · ETag' },
  { title: 'NODE / NEST', detail: 'Map · CacheModule', active: true },
  { title: 'DISTRIBUTED', detail: 'Redis · shared keys' },
  { title: 'PRIMARY', detail: 'PostgreSQL · external API' },
];

export const cachingLearningRu = {
  'caching-strategies': {
    plain:
      'Кэш похож на маленькую полку рядом с рабочим столом. Часто нужную книгу выгодно держать на полке, а не каждый раз идти в архив. Но полка ограничена, копия может устареть, а после перестановки архива нужно знать, какую книгу с полки убрать.',
    foundation:
      'Cache хранит производную копию данных или результата вычисления ближе к consumer-у. Hit экономит обращение к медленному primary source, miss добавляет cache lookup перед обычной загрузкой. Корректный дизайн определяет key, lifetime, size bound, invalidation, concurrency behavior, source of truth и допустимую staleness.',
    why:
      'Кэш снижает latency, database/network load и стоимость повторяемых вычислений, но создаёт вторую версию состояния. Senior-разработчик должен уметь доказать пользу через hit ratio и latency, не допустить stale security data, memory leak, stampede и превращение Redis в обязательную точку отказа.',
    resources: [
      {
        label: 'NestJS caching',
        href: 'https://docs.nestjs.com/techniques/caching',
        description:
          'Официальные CacheModule, CACHE_MANAGER, CacheInterceptor, TTL и alternative stores.',
      },
      {
        label: 'Redis cache-aside',
        href: 'https://redis.io/docs/latest/develop/use-cases/cache-aside/',
        description:
          'Read-heavy workload, TTL-bounded staleness, invalidation и защита primary database.',
      },
      {
        label: 'Redis cache-aside for Node.js',
        href: 'https://redis.io/docs/latest/develop/use-cases/cache-aside/nodejs/',
        description:
          'Node.js flow с hit/miss, single-flight, write invalidation и Redis keys.',
      },
      {
        label: 'HTTP caching',
        href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching',
        description:
          'Browser/shared cache, Cache-Control, validators, freshness и revalidation.',
      },
    ],
    runtimeLayers: cachingLayers,
    terms: [
      {
        name: 'Cache hit',
        description:
          'Key найден, и результат возвращается из cache без обращения к primary source.',
      },
      {
        name: 'Cache miss',
        description:
          'Key отсутствует или истёк; приложение загружает значение из primary source и обычно сохраняет копию.',
      },
      {
        name: 'Hit ratio',
        description:
          'Доля чтений, обслуженных cache: hits / (hits + misses). Высокое число бесполезно, если кэшируются неправильные или опасно устаревшие данные.',
      },
      {
        name: 'TTL',
        description:
          'Time To Live — срок жизни entry, после которого она становится miss и должна быть загружена заново.',
      },
      {
        name: 'Eviction',
        description:
          'Удаление entries из ограниченного cache по TTL, LRU/LFU или другой policy, чтобы память не росла бесконечно.',
      },
      {
        name: 'Invalidation',
        description:
          'Явное удаление или обновление cached copy после изменения source of truth.',
      },
      {
        name: 'Cache-aside',
        description:
          'Application сначала делает GET cache, при miss читает primary и делает SET; при write обновляет primary и удаляет key.',
      },
      {
        name: 'Cache stampede',
        description:
          'Множество callers одновременно получают miss популярного key и повторяют один дорогой loader.',
      },
      {
        name: 'Single-flight',
        description:
          'Concurrent misses одного key разделяют один in-flight Promise или distributed lock вместо запуска одинаковой работы.',
      },
      {
        name: 'Stale data',
        description:
          'Cached value больше не совпадает с source of truth, но ещё доступно consumer-у.',
      },
      {
        name: 'Cache key',
        description:
          'Стабильный identity результата, включающий все параметры, влияющие на данные: entity, id, tenant, locale, filters и version.',
      },
      {
        name: 'CDN',
        description:
          'Content Delivery Network — распределённый shared HTTP cache ближе к пользователям.',
      },
    ],
    steps: [
      {
        title: 'Найдите повторяемую дорогую работу',
        description:
          'Измерьте database queries, external calls или CPU computation. Не добавляйте cache к дешёвому уникальному запросу.',
      },
      {
        title: 'Назовите source of truth',
        description:
          'PostgreSQL, upstream API или immutable artifact остаётся authoritative; cache должен быть восстановим из primary.',
      },
      {
        title: 'Спроектируйте key',
        description:
          'Key включает все dimensions ответа. Пропущенный tenantId или permission scope способен смешать данные пользователей.',
      },
      {
        title: 'Обработайте hit и miss',
        description:
          'Hit сразу возвращает copy; miss вызывает loader и сохраняет результат только после успешной загрузки.',
      },
      {
        title: 'Ограничьте lifetime и size',
        description:
          'TTL ограничивает время staleness, а max entries/bytes и eviction защищают память независимо от TTL.',
      },
      {
        title: 'Определите write policy',
        description:
          'Cache-aside обычно сначала commit-ит primary, затем удаляет key. Write-through обновляет cache синхронно; write-behind требует durable queue и сложнее.',
      },
      {
        title: 'Защитите hot miss',
        description:
          'Single-flight, lock, stale-while-revalidate или TTL jitter не дают всем replicas одновременно атаковать primary.',
      },
      {
        title: 'Выберите уровень',
        description:
          'Local memory быстрее, Redis разделяется replicas, HTTP cache/CDN может вообще не довести request до Node.',
      },
      {
        title: 'Измерьте результат',
        description:
          'Наблюдайте hits, misses, hit ratio, load latency, evictions, memory, Redis errors, stale age и primary load.',
      },
    ],
    nuances: [
      {
        title: 'Нет cache — не всегда ошибка',
        description:
          'Редкий запрос с высокой cardinality не даст повторных hits, зато cache lookup, serialization и invalidation добавят стоимость.',
      },
      {
        title: 'Local cache не общий',
        description:
          'Каждый Node process, Worker или Kubernetes Pod имеет свою память. Два Pods могут вернуть разные revisions до expiration/invalidation.',
      },
      {
        title: 'TTL не ограничивает количество keys',
        description:
          'За TTL можно создать миллионы уникальных entries. Нужен отдельный maximum size и eviction policy.',
      },
      {
        title: '0 и false являются валидными values',
        description:
          'Miss проверяют через undefined/null согласно cache API, а не через if (!value), иначе falsy result загружается повторно.',
      },
      {
        title: 'Negative caching бывает полезен',
        description:
          'Короткое кеширование «не найдено» защищает БД от повторных запросов несуществующего id, но мешает увидеть только что созданный object без invalidation.',
      },
      {
        title: 'TTL jitter распределяет expiry',
        description:
          'Небольшая случайная добавка не даёт тысячам keys истечь в одну секунду и создать synchronized load spike.',
      },
      {
        title: 'Cache errors часто можно пережить',
        description:
          'Для производной копии timeout Redis обычно ведёт к bounded fallback в primary, а не к падению всего request. Но fallback нужно ограничить, иначе outage cache перегрузит БД.',
      },
      {
        title: 'Authorization требует особой строгости',
        description:
          'Долгий TTL permission data может сохранить отозванный доступ. Нужны короткий lifetime, versioned key или надёжная invalidation.',
      },
      {
        title: 'HTTP cache видит представление',
        description:
          'Cache-Control управляет freshness, ETag валидирует version, Vary разделяет варианты. Private personalized response нельзя случайно отдать shared cache.',
      },
    ],
    pitfalls: [
      {
        myth: 'Cache всегда ускоряет приложение.',
        fact: 'При низком hit ratio lookup, serialization, network и invalidation могут сделать путь медленнее.',
      },
      {
        myth: 'Достаточно положить результат в глобальный Map.',
        fact: 'Без TTL, maximum size и eviction Map превращается в memory leak и исчезает при restart.',
      },
      {
        myth: 'TTL полностью решает consistency.',
        fact: 'TTL лишь задаёт верхнее окно staleness; критичные writes обычно требуют invalidation или versioning.',
      },
      {
        myth: 'Redis является source of truth.',
        fact: 'Обычный cache должен быть восстановим; durable business state хранится в предназначенной для этого системе.',
      },
      {
        myth: 'Один miss означает один database query.',
        fact: 'При concurrency сотни callers могут одновременно увидеть miss; нужен single-flight или distributed coordination.',
      },
      {
        myth: 'Можно кэшировать POST для защиты от повторной оплаты.',
        fact: 'Cache не заменяет idempotency key и database constraints для business side effects.',
      },
    ],
    codeIntro:
      'Runtime поднимает настоящий Nest application context с CacheModule. ProductCacheService использует cache-aside, проверяет hit без ошибки на falsy values, ограничивает TTL, объединяет concurrent misses одним Promise и удаляет key после update primary.',
    codeNotes: [
      'CacheModule.register создаёт Nest provider для cache store.',
      'CACHE_MANAGER — DI token стандартного cache-manager instance.',
      'cache.get возвращает cached value либо undefined/null при miss.',
      'cache.set(key, value, ttl) сохраняет copy на ограниченный срок в миллисекундах.',
      'inFlight Map хранит только незавершённые loaders и очищается в finally.',
      'Promise.all создаёт burst, чтобы увидеть stampede protection.',
      'cache.del выполняется после успешной записи source of truth.',
      'Application context закрывается в finally и не оставляет ресурсов.',
    ],
    examples: [
      {
        title: 'Node.js: минимальный cache-aside',
        goal:
          'Не выполнять один тяжёлый loader при каждом последовательном чтении.',
        code: `const cache = new Map();

async function getProduct(id) {
  const key = \`product:\${id}\`;
  const entry = cache.get(key);

  if (entry && entry.expiresAt > Date.now()) {
    return entry.value;
  }

  const product = await repository.findById(id);
  cache.set(key, {
    value: product,
    expiresAt: Date.now() + 30_000,
  });
  return product;
}`,
        notes: [
          'Без cache каждое чтение занимает DB connection и платит полную latency.',
          'Этот учебный Map всё ещё требует max-size eviction.',
          'В multi-process deployment у каждого process будет своя копия.',
        ],
      },
      {
        title: 'Nest: CacheModule и CACHE_MANAGER',
        goal:
          'Получить cache store через dependency injection, а не создавать глобальный singleton вручную.',
        code: `@Module({
  imports: [CacheModule.register({ ttl: 30_000 })],
  providers: [ProductsService],
})
export class ProductsModule {}

@Injectable()
export class ProductsService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  get(id: string) {
    return this.cache.get(\`product:v1:\${id}\`);
  }
}`,
        notes: [
          'CacheModule управляет provider lifecycle.',
          'TTL в актуальном cache-manager задаётся в миллисекундах.',
          'Version v1 позволяет сменить schema cached value.',
        ],
      },
      {
        title: 'Nest: cache-aside с invalidation',
        goal:
          'Не возвращать старую цену после успешного update.',
        code: `async findOne(id: string) {
  const key = \`product:v1:\${id}\`;
  const hit = await this.cache.get<Product>(key);
  if (hit !== undefined && hit !== null) return hit;

  const product = await this.products.findById(id);
  await this.cache.set(key, product, 30_000);
  return product;
}

async update(id: string, dto: UpdateProductDto) {
  const product = await this.products.update(id, dto);
  await this.cache.del(\`product:v1:\${id}\`);
  return product;
}`,
        notes: [
          'Primary update выполняется до eviction.',
          'Следующее чтение repopulate-ит cache новой revision.',
          'Нужна стратегия для ошибки cache.del после успешного DB commit.',
        ],
      },
      {
        title: 'Nest CacheInterceptor для простого GET',
        goal:
          'Кэшировать безопасное representation без ручного get/set в controller.',
        code: `@Controller('public/catalog')
@UseInterceptors(CacheInterceptor)
export class CatalogController {
  @Get()
  @CacheTTL(15_000)
  findAll() {
    return this.catalog.findPublicItems();
  }
}`,
        notes: [
          'Официальный interceptor автоматически кэширует GET response.',
          'Personalized response требует корректного key/trackBy.',
          'Business commands и side effects так кэшировать нельзя.',
        ],
      },
      {
        title: 'Single-flight против stampede',
        goal:
          'Пусть пять concurrent misses разделят один database Promise.',
        code: `const inFlight = new Map<string, Promise<Product>>();

async function loadOnce(key: string) {
  const running = inFlight.get(key);
  if (running) return running;

  const promise = repository
    .findById(key)
    .finally(() => inFlight.delete(key));

  inFlight.set(key, promise);
  return promise;
}`,
        notes: [
          'finally удаляет только coordination state, не cached value.',
          'Local single-flight защищает один process.',
          'Для нескольких replicas нужна Redis lock/early refresh или другой distributed mechanism.',
        ],
      },
      {
        title: 'Redis cache-aside',
        goal:
          'Разделить горячий cache между несколькими Node/Nest replicas.',
        code: `async function getProduct(id) {
  const key = \`product:v1:\${id}\`;
  const cached = await redis.get(key);
  if (cached !== null) return JSON.parse(cached);

  const product = await repository.findById(id);
  await redis.set(key, JSON.stringify(product), {
    EX: 30 + Math.floor(Math.random() * 6),
  });
  return product;
}`,
        notes: [
          'Redis добавляет network hop, но даёт общую copy.',
          'EX задаёт seconds; API конкретного client нужно проверять.',
          'Random jitter рассинхронизирует expiration.',
        ],
      },
      {
        title: 'External API: короткий cache',
        goal:
          'Не исчерпать rate limit одинаковыми запросами курсов валют или доставки.',
        code: `const key = \`shipping:v2:\${country}:\${postalCode}:\${weight}\`;
const cached = await cache.get(key);
if (cached) return cached;

const quote = await shippingProvider.quote(input);
await cache.set(key, quote, 60_000);
return quote;`,
        notes: [
          'Без cache spike повторяет network latency и расходует provider quota.',
          'Key обязан включать все параметры расчёта.',
          'TTL выбирается из допустимой свежести business response.',
        ],
      },
      {
        title: 'HTTP browser/CDN cache',
        goal:
          'Не отправлять неизменившийся публичный response через Node для каждого пользователя.',
        code: `response.setHeader(
  'Cache-Control',
  'public, max-age=60, s-maxage=300, stale-while-revalidate=30',
);
response.setHeader('ETag', versionHash);`,
        notes: [
          'max-age относится к browser freshness.',
          's-maxage управляет shared cache/CDN.',
          'ETag позволяет получить 304 без повторной передачи body.',
          'Personalized data обычно использует private/no-store.',
        ],
      },
      {
        title: 'Что наблюдать',
        goal:
          'Доказать, что cache помогает и не скрывает инцидент.',
        code: `cache_requests_total{result="hit"}
cache_requests_total{result="miss"}
cache_load_duration_seconds
cache_evictions_total
cache_entries
cache_stale_served_total
primary_queries_total`,
        notes: [
          'Hit ratio читают вместе с primary load и end-to-end latency.',
          'Entries/memory обнаруживают отсутствие bounds.',
          'Miss storm после expiry виден как одновременный рост loaders.',
        ],
      },
    ],
    questions: [
      'Когда отсутствие cache действительно создаёт проблему, а когда cache только усложняет путь?',
      'Чем TTL отличается от maximum size и eviction?',
      'Почему local Map не даёт общей copy для двух Kubernetes Pods?',
      'Какие поля должны попасть в cache key personalized endpoint?',
      'Почему if (!cached) неверно для cached value 0?',
      'Как single-flight защищает primary от stampede?',
      'В каком порядке cache-aside обновляет primary и удаляет key?',
      'Чем CacheInterceptor отличается от ручного CACHE_MANAGER?',
      'Когда HTTP/CDN cache полезнее Redis?',
      'Какие метрики доказывают реальную пользу cache?',
    ],
  },
};
