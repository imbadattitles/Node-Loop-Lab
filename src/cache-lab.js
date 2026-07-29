import 'reflect-metadata';
import {
  Dependencies,
  Injectable,
  Module,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  CACHE_MANAGER,
  CacheModule,
} from '@nestjs/cache-manager';
import { performance } from 'node:perf_hooks';

const CACHE_TRACE = Symbol('CACHE_TRACE');
const PRODUCT_TTL_MS = 120;

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

class ProductRepository {
  constructor() {
    this.readCount = 0;
    this.products = new Map([
      [
        'book-42',
        {
          id: 'book-42',
          name: 'Node.js Runtime',
          price: 4200,
          revision: 1,
        },
      ],
    ]);
  }

  async findById(id) {
    this.readCount += 1;
    await wait(35);
    const product = this.products.get(id);
    return product ? structuredClone(product) : null;
  }

  async updatePrice(id, price) {
    const current = this.products.get(id);
    const updated = {
      ...current,
      price,
      revision: current.revision + 1,
    };
    this.products.set(id, updated);
    return structuredClone(updated);
  }
}
Injectable()(ProductRepository);

class ProductCacheService {
  constructor(cache, products, trace) {
    this.cache = cache;
    this.products = products;
    this.trace = trace;
    this.inFlight = new Map();
  }

  key(id) {
    return `product:v1:${id}`;
  }

  async getById(id) {
    const key = this.key(id);
    const cached = await this.cache.get(key);
    if (cached !== undefined && cached !== null) {
      this.trace.emit('cache', 'hit', `HIT ${key}: repository не вызывается`);
      return cached;
    }

    if (this.inFlight.has(key)) {
      this.trace.emit(
        'single-flight',
        'join',
        `MISS ${key}: запрос присоединён к уже выполняющемуся loader`,
      );
      return this.inFlight.get(key);
    }

    this.trace.emit(
      'cache',
      'miss',
      `MISS ${key}: выполняется repository.findById`,
    );
    const loading = this.products
      .findById(id)
      .then(async (product) => {
        await this.cache.set(key, product, PRODUCT_TTL_MS);
        return product;
      })
      .finally(() => {
        this.inFlight.delete(key);
      });
    this.inFlight.set(key, loading);
    return loading;
  }

  async updatePrice(id, price) {
    const updated = await this.products.updatePrice(id, price);
    await this.cache.del(this.key(id));
    this.trace.emit(
      'invalidation',
      'delete',
      `UPDATE записан в primary; ключ ${this.key(id)} удалён`,
    );
    return updated;
  }
}
Dependencies(CACHE_MANAGER, ProductRepository, CACHE_TRACE)(
  ProductCacheService,
);
Injectable()(ProductCacheService);

class CacheLabModule {}

function configureCacheLab(trace) {
  Module({
    imports: [
      CacheModule.register({
        ttl: PRODUCT_TTL_MS,
      }),
    ],
    providers: [
      ProductRepository,
      ProductCacheService,
      {
        provide: CACHE_TRACE,
        useValue: trace,
      },
    ],
  })(CacheLabModule);
  return CacheLabModule;
}

export async function cachingStrategies(emit) {
  const trace = { emit };
  const application = await NestFactory.createApplicationContext(
    configureCacheLab(trace),
    { logger: false },
  );

  try {
    const repository = application.get(ProductRepository);
    const service = application.get(ProductCacheService);

    emit(
      'baseline',
      'start',
      'Без cache три одинаковых чтения трижды занимают repository и connection',
    );
    const baselineStarted = performance.now();
    await repository.findById('book-42');
    await repository.findById('book-42');
    await repository.findById('book-42');
    const baselineMs = Math.round(performance.now() - baselineStarted);
    emit(
      'baseline',
      'result',
      `Без cache: reads=3, elapsed≈${baselineMs} мс`,
    );

    const readsBeforeCache = repository.readCount;
    const cachedStarted = performance.now();
    await service.getById('book-42');
    await service.getById('book-42');
    await service.getById('book-42');
    const cachedMs = Math.round(performance.now() - cachedStarted);
    emit(
      'cache',
      'result',
      `Cache-aside: repository reads=${repository.readCount - readsBeforeCache}, elapsed≈${cachedMs} мс`,
    );

    await wait(PRODUCT_TTL_MS + 20);
    const readsBeforeExpiry = repository.readCount;
    await service.getById('book-42');
    emit(
      'ttl',
      'expired',
      `После TTL новый MISS добавил repository reads=${repository.readCount - readsBeforeExpiry}`,
    );

    const cache = application.get(CACHE_MANAGER);
    await cache.del(service.key('book-42'));
    const readsBeforeBurst = repository.readCount;
    await Promise.all(
      Array.from({ length: 5 }, () => service.getById('book-42')),
    );
    emit(
      'single-flight',
      'result',
      `Пять одновременных MISS вызвали loader ${repository.readCount - readsBeforeBurst} раз вместо 5`,
    );

    await service.updatePrice('book-42', 4500);
    const fresh = await service.getById('book-42');
    emit(
      'invalidation',
      'result',
      `После invalidation прочитана revision=${fresh.revision}, price=${fresh.price}`,
    );

    emit(
      'architecture',
      'boundary',
      'In-memory cache принадлежит одному Node process; Redis нужен для общего cache нескольких replicas',
    );
  } finally {
    await application.close();
    emit('cleanup', 'done', 'Nest application context и cache store закрыты');
  }
}
