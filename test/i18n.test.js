import test from 'node:test';
import assert from 'node:assert/strict';
import { demos, publicDemo } from '../src/demos.js';
import {
  localizeDemo,
  translateMemoryMessage,
  translateTraceMessage,
  ui,
} from '../client/i18n.js';

function assertProductionCase(caseStudy) {
  for (const field of [
    'title',
    'situation',
    'problem',
    'badCode',
    'badWhy',
    'fixedCode',
    'fixedWhy',
    'takeaway',
  ]) {
    assert.equal(typeof caseStudy[field], 'string');
    assert.ok(caseStudy[field].trim().length > 20, `${field} is incomplete`);
  }
  assert.notEqual(caseStudy.badCode, caseStudy.fixedCode);
  assert.ok(Array.isArray(caseStudy.signals));
  assert.ok(caseStudy.signals.length >= 2);
  assert.ok(Array.isArray(caseStudy.functionNotes));
  assert.ok(caseStudy.functionNotes.length >= 4);
  for (const note of caseStudy.functionNotes) {
    assert.equal(typeof note.term, 'string');
    assert.ok(note.term.trim().length >= 3);
    assert.equal(typeof note.description, 'string');
    assert.ok(note.description.trim().length > 30);
  }
  assert.doesNotMatch(
    `${caseStudy.badCode}\n${caseStudy.fixedCode}`,
    /\bapp\.(?:get|post|put|patch|delete)\s*\(/,
  );
}

test('английская локализация покрывает каталог и учебные главы', () => {
  const localized = demos.map((demo) => {
    const publicMetadata = publicDemo(demo);
    return {
      ...localizeDemo(publicMetadata, 'en'),
      originalTitle: publicMetadata.title,
    };
  });

  assert.equal(localized.length, 24);
  assert.equal(localized[0].title, 'Event Loop order');
  assert.equal(
    localized.at(-1).title,
    'CPython runtime, memory, GIL, and asyncio',
  );
  assert.ok(localized.every((demo) => demo.learning.terms.length >= 4));
  assert.ok(localized.every((demo) => demo.learning.steps.length >= 5));
  assert.ok(localized.every((demo) => demo.learning.nuances.length >= 4));
  assert.ok(demos.every((demo) => demo.learning.nuances.length >= 4));
  assert.ok(
    localized.every(
      (demo) =>
        demo.learning.productionCases.length >= 1 &&
        demo.learning.productionCases.length <= 2,
    ),
  );
  assert.ok(
    demos.every(
      (demo) =>
        demo.learning.productionCases.length >= 1 &&
        demo.learning.productionCases.length <= 2,
    ),
  );
  for (const demo of [...demos, ...localized]) {
    demo.learning.productionCases.forEach(assertProductionCase);
  }
  for (const id of [
    'callback-queue',
    'blocking-vs-worker',
    'memory-leak',
    'promises-immediate-bullmq',
    'runtime-models',
    'production-observability',
    'microservices-foundations',
    'caching-strategies',
  ]) {
    for (const catalog of [demos, localized]) {
      const caseStudy = catalog.find((demo) => demo.id === id)
        .learning.productionCases[0];
      assert.match(
        `${caseStudy.badCode}\n${caseStudy.fixedCode}`,
        /@Controller|@Injectable|NestInterceptor/,
      );
    }
  }
  const promises = localized.find(
    (demo) => demo.id === 'promises-immediate-bullmq',
  );
  const promisesRu = demos.find(
    (demo) => demo.id === 'promises-immediate-bullmq',
  );
  assert.equal(promises.learning.examples.length, 8);
  assert.equal(promisesRu.learning.examples.length, 8);
  const eventLoopEn = localized.find(
    (demo) => demo.id === 'event-loop-order',
  );
  const eventLoopRu = demos.find(
    (demo) => demo.id === 'event-loop-order',
  );
  for (const eventLoop of [eventLoopRu, eventLoopEn]) {
    assert.equal(eventLoop.learning.runtimeComparison.hosts.length, 2);
    assert.equal(
      eventLoop.learning.runtimeComparison.example.snippets.length,
      2,
    );
    assert.ok(
      eventLoop.learning.runtimeComparison.hosts.some(
        (host) => host.tone === 'browser',
      ),
    );
    assert.ok(
      eventLoop.learning.runtimeComparison.hosts.some(
        (host) => host.tone === 'node',
      ),
    );
    assert.match(
      eventLoop.learning.runtimeTraceConnection,
      /profiler/i,
    );
    assert.ok(
      eventLoop.learning.resources.some((resource) =>
        resource.href.startsWith('https://html.spec.whatwg.org/'),
      ),
    );
  }
  assert.ok(localized.every((demo) => demo.runtimeFiles.length >= 1));
  assert.ok(
    localized
      .filter((demo) => demo.category === 'nestjs')
      .every((demo) =>
        demo.learning.resources.some(
          (resource) => resource.href === 'https://docs.nestjs.com/',
        ),
      ),
  );
  const caching = localized.find(
    (demo) => demo.id === 'caching-strategies',
  );
  assert.equal(caching.learning.examples.length, 9);
  assert.equal(caching.learning.productionCases.length, 2);
  assert.ok(
    caching.learning.resources.some(
      (resource) =>
        resource.href === 'https://docs.nestjs.com/techniques/caching',
    ),
  );
  assert.ok(
    localized
      .filter((demo) => demo.category === 'databases')
      .every((demo) =>
        demo.learning.resources.some(
          (resource) =>
            resource.href ===
            'https://www.postgresql.org/docs/current/',
        ),
      ),
  );
  assert.ok(
    localized
      .filter((demo) => demo.category === 'python')
      .every(
        (demo) =>
          demo.learning.codeLanguage === 'Python' &&
          demo.learning.resources.some((resource) =>
            resource.href.startsWith('https://docs.python.org/3/'),
          ),
      ),
  );
  assert.ok(
    localized.every((demo) => {
      // Runtime source is intentionally identical to the executed server code.
      // Its trace strings are Russian and translated only when rendered as events.
      const { originalTitle, runtimeFiles, ...englishContent } = demo;
      assert.ok(runtimeFiles.every((file) => file.code.length > 200));
      return !/[А-Яа-яЁё]/.test(JSON.stringify(englishContent));
    }),
  );
  assert.equal(ui.en.experiments, 'Experiments');
});

test('динамические сообщения trace и memory переводятся на английский', () => {
  const localized = demos.map((demo) => {
    const publicMetadata = publicDemo(demo);
    return {
      ...localizeDemo(publicMetadata, 'en'),
      originalTitle: publicMetadata.title,
    };
  });

  assert.equal(
    translateTraceMessage(
      'Сценарий завершён за 42 мс',
      'en',
      localized,
    ),
    'Scenario completed in 42 ms',
  );
  assert.equal(
    translateTraceMessage(
      'UV_THREADPOOL_SIZE=4 (по умолчанию)',
      'en',
      localized,
    ),
    'UV_THREADPOOL_SIZE=4 (default)',
  );
  assert.equal(
    translateTraceMessage(
      'READ COMMITTED: первый SELECT=1000, второй SELECT=1100',
      'en',
      localized,
    ),
    'READ COMMITTED: first SELECT=1000, second SELECT=1100',
  );
  assert.equal(
    translateTraceMessage(
      'Временный Nest HTTP server готов: http://127.0.0.1:43210; далее выполняются 3 независимых запроса',
      'en',
      localized,
    ),
    'Temporary Nest HTTP server is ready at http://127.0.0.1:43210; three independent requests will run next',
  );
  assert.equal(
    translateTraceMessage(
      'Запрос 2/3 · GET /nest-lifecycle/not-a-number · header x-lab-access: allow · ожидается HTTP 400 (Pipe отклоняет id)',
      'en',
      localized,
    ),
    'Request 2/3 · GET /nest-lifecycle/not-a-number · header x-lab-access: allow · expected HTTP 400 (pipe rejects the id)',
  );
  assert.equal(
    translateTraceMessage(
      'Запрос 3/3 завершён · HTTP 403 · middleware → guard:deny → exception-filter:403',
      'en',
      localized,
    ),
    'Request 3/3 completed · HTTP 403 · middleware → guard:deny → exception-filter:403',
  );
  assert.equal(
    translateTraceMessage(
      'Завершение сценария: временный Nest-сервер закрыт штатно (exitCode 0)',
      'en',
      localized,
    ),
    'Scenario teardown: temporary Nest server closed normally (exitCode 0)',
  );
  assert.equal(
    translateMemoryMessage(
      'Ссылки удалены; объекты теперь доступны сборщику мусора',
      'en',
    ),
    'References were removed; the objects are now collectible.',
  );
});
