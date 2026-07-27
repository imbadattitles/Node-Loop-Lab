import test from 'node:test';
import assert from 'node:assert/strict';
import { demos, publicDemo } from '../src/demos.js';
import {
  localizeDemo,
  translateMemoryMessage,
  translateTraceMessage,
  ui,
} from '../client/i18n.js';

test('английская локализация покрывает каталог и учебные главы', () => {
  const localized = demos.map((demo) => {
    const publicMetadata = publicDemo(demo);
    return {
      ...localizeDemo(publicMetadata, 'en'),
      originalTitle: publicMetadata.title,
    };
  });

  assert.equal(localized.length, 7);
  assert.equal(localized[0].title, 'Event Loop order');
  assert.equal(
    localized.at(-1).title,
    'Promises, setImmediate, and BullMQ',
  );
  assert.ok(localized.every((demo) => demo.learning.terms.length >= 4));
  assert.ok(localized.every((demo) => demo.learning.steps.length >= 5));
  assert.ok(localized.every((demo) => demo.learning.nuances.length >= 4));
  assert.ok(demos.every((demo) => demo.learning.nuances.length >= 4));
  assert.equal(localized.at(-1).learning.examples.length, 8);
  assert.equal(demos.at(-1).learning.examples.length, 8);
  assert.ok(
    localized.every((demo) => {
      const { originalTitle, ...englishContent } = demo;
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
    translateMemoryMessage(
      'Ссылки удалены; объекты теперь доступны сборщику мусора',
      'en',
    ),
    'References were removed; the objects are now collectible.',
  );
});
