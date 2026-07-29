export const cachingEnglish = {
  'caching-strategies': {
    title: 'Caching in Node.js, NestJS, Redis, and HTTP',
    eyebrow: 'Key → hit/miss → invalidation',
    summary:
      'Learn where caching removes repeated work, how cache-aside behaves, and how stale data, stampedes, and unbounded memory cause incidents.',
    theory:
      'A cache stores a derived copy of data or computation closer to its consumer. A hit avoids the slower primary source, while a miss adds a cache lookup before ordinary loading. A correct design defines key identity, lifetime, size bounds, invalidation, concurrency, the source of truth, and acceptable staleness.',
    watchFor:
      'A real Nest application context uses CacheModule and CACHE_MANAGER. The trace compares uncached reads with cache-aside, waits for TTL expiry, coalesces five concurrent misses, and invalidates after a primary update.',
    expected: [
      'Without caching, every identical read consumes primary capacity and latency.',
      'The first cache-aside read misses and later reads hit.',
      'TTL bounds freshness but does not bound the number of keys.',
      'Single-flight makes concurrent local misses share one loader.',
      'A write invalidates the derived cached copy.',
      'An in-memory cache belongs to one Node process.',
      'Redis can share cache state across replicas but adds a network dependency.',
      'HTTP or CDN caching can prevent a request from reaching Node at all.',
    ],
    code: `@Injectable()
export class ProductsService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    private readonly products: ProductsRepository,
  ) {}

  async findOne(id: string) {
    const key = \`product:v1:\${id}\`;
    const hit = await this.cache.get<Product>(key);
    if (hit !== undefined && hit !== null) return hit;

    const product = await this.products.findById(id);
    await this.cache.set(key, product, 30_000);
    return product;
  }
}`,
    learning: {
      plain:
        'A cache is like a small shelf next to your desk. Keeping a frequently used book there is cheaper than walking to the archive every time. The shelf is limited, its copy can become outdated, and an archive update must tell you which shelf copy to remove.',
      foundation:
        'A cache stores a derived copy of data or computation closer to its consumer. A hit avoids the slower primary source, while a miss adds cache lookup before ordinary loading. A correct design defines key identity, lifetime, size bounds, invalidation, concurrency behavior, source of truth, and acceptable staleness.',
      why:
        'Caching reduces latency, database or network load, and repeated-computation cost, but introduces a second state version. Senior engineers must prove the benefit through hit ratio and latency while preventing stale security data, memory leaks, stampedes, and Redis becoming a mandatory failure point.',
      resources: [
        {
          label: 'NestJS caching',
          href: 'https://docs.nestjs.com/techniques/caching',
          description:
            'Official CacheModule, CACHE_MANAGER, CacheInterceptor, TTL, and alternative-store documentation.',
        },
        {
          label: 'Redis cache-aside',
          href: 'https://redis.io/docs/latest/develop/use-cases/cache-aside/',
          description:
            'Read-heavy workloads, TTL-bounded staleness, invalidation, and primary-database protection.',
        },
        {
          label: 'Redis cache-aside for Node.js',
          href: 'https://redis.io/docs/latest/develop/use-cases/cache-aside/nodejs/',
          description:
            'A Node.js flow with hits, misses, single-flight, write invalidation, and Redis keys.',
        },
        {
          label: 'HTTP caching',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching',
          description:
            'Browser and shared caches, Cache-Control, validators, freshness, and revalidation.',
        },
      ],
      runtimeLayers: [
        { title: 'CLIENT / CDN', detail: 'Cache-Control · ETag' },
        { title: 'NODE / NEST', detail: 'Map · CacheModule', active: true },
        { title: 'DISTRIBUTED', detail: 'Redis · shared keys' },
        { title: 'PRIMARY', detail: 'PostgreSQL · external API' },
      ],
      terms: [
        ['Cache hit', 'The key exists and the result is returned without contacting the primary source.'],
        ['Cache miss', 'The key is absent or expired, so the application loads from primary and usually stores a copy.'],
        ['Hit ratio', 'The share served from cache: hits divided by hits plus misses; it matters only with latency and correctness.'],
        ['TTL', 'Time To Live, after which an entry expires and the next access becomes a miss.'],
        ['Eviction', 'Removal under a TTL, LRU, LFU, or other policy so bounded cache memory can admit new entries.'],
        ['Invalidation', 'Explicit removal or replacement of a cached copy after its source of truth changes.'],
        ['Cache-aside', 'The app reads cache first, loads primary on a miss, stores a copy, and deletes the key after a write.'],
        ['Cache stampede', 'Many callers miss one hot key simultaneously and repeat the same expensive loader.'],
        ['Single-flight', 'Concurrent misses for one key share an in-flight Promise or coordinated lock.'],
        ['Stale data', 'A cached value no longer matches the source of truth but is still visible to a consumer.'],
        ['Cache key', 'Stable result identity containing every relevant dimension such as entity, tenant, locale, filters, and version.'],
        ['CDN', 'A Content Delivery Network: distributed shared HTTP caches close to users.'],
      ],
      steps: [
        ['Find repeated expensive work', 'Measure database queries, external calls, or CPU computation; do not cache a cheap unique lookup.'],
        ['Name the source of truth', 'PostgreSQL, an upstream API, or an immutable artifact remains authoritative and can rebuild the cache.'],
        ['Design the key', 'Include every response dimension; omitting tenant or permission scope can mix user data.'],
        ['Handle hit and miss', 'A hit returns immediately; a miss starts the loader and stores only a successful result.'],
        ['Bound lifetime and size', 'TTL bounds staleness while maximum entries or bytes and eviction bound memory independently.'],
        ['Define write policy', 'Cache-aside normally commits primary and then deletes the key; write-through and write-behind have different costs.'],
        ['Protect a hot miss', 'Single-flight, locks, stale-while-revalidate, or TTL jitter prevent synchronized primary load.'],
        ['Choose a cache level', 'Local memory is fastest, Redis is shared by replicas, and HTTP or CDN caching can bypass Node entirely.'],
        ['Measure the result', 'Observe hits, misses, load duration, evictions, memory, Redis errors, stale age, and primary load.'],
      ],
      nuances: [
        ['No cache is not always a defect', 'A rare high-cardinality query gets few hits while lookup, serialization, and invalidation add overhead.'],
        ['Local cache is not shared', 'Every Node process, Worker, or Kubernetes Pod owns memory and can temporarily expose a different revision.'],
        ['TTL does not bound key count', 'Millions of unique entries can be created during one TTL window, so maximum size and eviction remain necessary.'],
        ['Zero and false are valid values', 'Check miss with undefined or null according to the API rather than if (!value).'],
        ['Negative caching can help', 'Short-lived “not found” entries protect the database but can hide a newly created object until invalidated.'],
        ['TTL jitter distributes expiry', 'A small random offset prevents thousands of keys from expiring in the same second.'],
        ['Cache errors can often degrade', 'A derived cache timeout can fall back to primary, but fallback must be bounded so cache failure does not overload it.'],
        ['Authorization needs stricter freshness', 'A long permission TTL can preserve revoked access, requiring short lifetime, versioned keys, or reliable invalidation.'],
        ['HTTP caching stores representations', 'Cache-Control controls freshness, ETag validates versions, and Vary separates response variants.'],
      ],
      pitfalls: [
        ['A cache always makes an application faster.', 'At low hit ratio, lookup, serialization, network, and invalidation can make the path slower.'],
        ['A global Map is enough.', 'Without TTL, maximum size, and eviction, it becomes a memory leak and disappears on restart.'],
        ['TTL completely solves consistency.', 'TTL only bounds a stale window; critical writes usually need invalidation or versioning.'],
        ['Redis is the source of truth.', 'An ordinary cache must be rebuildable while durable business state belongs in an appropriate primary store.'],
        ['One miss produces one database query.', 'Hundreds of concurrent callers can all miss; use single-flight or distributed coordination.'],
        ['Caching POST prevents double payment.', 'Business side effects need idempotency keys and database constraints rather than a response cache.'],
      ],
      codeIntro:
        'The runtime starts a real Nest application context with CacheModule. ProductCacheService implements cache-aside, handles falsy values correctly, uses bounded TTL, coalesces concurrent misses through one Promise, and deletes the key after updating primary.',
      codeNotes: [
        'CacheModule.register creates the Nest cache-store provider.',
        'CACHE_MANAGER is the dependency-injection token for the cache-manager instance.',
        'cache.get returns a cached value or undefined or null on a miss.',
        'cache.set(key, value, ttl) stores a copy for a millisecond lifetime.',
        'The inFlight Map stores only unfinished loaders and clears them in finally.',
        'Promise.all creates a burst that exposes stampede protection.',
        'cache.del runs after a successful source-of-truth update.',
        'The application context closes in finally without leaving resources.',
      ],
      examples: [
        {
          title: 'Node.js: minimal cache-aside',
          goal: 'Avoid running one expensive loader on every sequential read.',
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
            'Without cache, every read holds a database connection and pays full latency.',
            'This teaching Map still needs maximum-size eviction.',
            'Each process has a separate copy in a multi-process deployment.',
          ],
        },
        {
          title: 'Nest: CacheModule and CACHE_MANAGER',
          goal: 'Obtain a managed cache store through dependency injection.',
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
            'CacheModule owns provider lifecycle.',
            'Current cache-manager TTL is expressed in milliseconds.',
            'v1 allows a future cached-value schema change.',
          ],
        },
        {
          title: 'Nest: cache-aside with invalidation',
          goal: 'Avoid returning an old price after a successful update.',
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
            'Primary update happens before eviction.',
            'The next read repopulates the new revision.',
            'Define behavior for cache.del failure after a successful database commit.',
          ],
        },
        {
          title: 'Nest CacheInterceptor for a simple GET',
          goal: 'Cache a safe representation without manual controller get and set calls.',
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
            'The official interceptor automatically caches GET responses.',
            'Personalized responses need correct key tracking.',
            'Never response-cache business commands and side effects.',
          ],
        },
        {
          title: 'Single-flight against a stampede',
          goal: 'Let five concurrent misses share one database Promise.',
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
            'finally removes coordination state, not the cached value.',
            'Local single-flight protects only one process.',
            'Multiple replicas need a Redis lock, early refresh, or other distributed mechanism.',
          ],
        },
        {
          title: 'Redis cache-aside',
          goal: 'Share a hot cache across multiple Node or Nest replicas.',
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
            'Redis adds a network hop but provides a shared copy.',
            'EX is in seconds; verify the API of the chosen client.',
            'Random jitter spreads expiration.',
          ],
        },
        {
          title: 'External API: short cache',
          goal: 'Avoid exhausting a provider rate limit with identical calls.',
          code: `const key = \`shipping:v2:\${country}:\${postalCode}:\${weight}\`;
const cached = await cache.get(key);
if (cached) return cached;

const quote = await shippingProvider.quote(input);
await cache.set(key, quote, 60_000);
return quote;`,
          notes: [
            'Without cache, a traffic spike repeats network latency and consumes quota.',
            'The key must contain every calculation input.',
            'TTL follows the business freshness requirement.',
          ],
        },
        {
          title: 'HTTP browser and CDN cache',
          goal: 'Avoid sending an unchanged public response through Node for every user.',
          code: `response.setHeader(
  'Cache-Control',
  'public, max-age=60, s-maxage=300, stale-while-revalidate=30',
);
response.setHeader('ETag', versionHash);`,
          notes: [
            'max-age controls browser freshness.',
            's-maxage controls shared cache or CDN freshness.',
            'ETag enables 304 without retransmitting the body.',
            'Personalized data usually needs private or no-store.',
          ],
        },
        {
          title: 'What to observe',
          goal: 'Prove that caching helps and does not conceal an incident.',
          code: `cache_requests_total{result="hit"}
cache_requests_total{result="miss"}
cache_load_duration_seconds
cache_evictions_total
cache_entries
cache_stale_served_total
primary_queries_total`,
          notes: [
            'Read hit ratio alongside primary load and end-to-end latency.',
            'Entries and memory expose missing bounds.',
            'A miss storm appears as a synchronized loader spike.',
          ],
        },
      ],
      questions: [
        'When does missing cache cause a problem, and when does cache only add complexity?',
        'How do TTL, maximum size, and eviction differ?',
        'Why does a local Map not share values between two Kubernetes Pods?',
        'Which fields belong in the key of a personalized endpoint?',
        'Why is if (!cached) wrong when zero is a valid cached value?',
        'How does single-flight protect the primary from a stampede?',
        'In which order does cache-aside update primary and delete the key?',
        'How does CacheInterceptor differ from manual CACHE_MANAGER use?',
        'When is HTTP or CDN caching more useful than Redis?',
        'Which metrics prove that caching actually helps?',
      ],
    },
  },
};
