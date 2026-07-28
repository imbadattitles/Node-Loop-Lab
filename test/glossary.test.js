import test from 'node:test';
import assert from 'node:assert/strict';
import { demos, publicDemo } from '../src/demos.js';
import { localizeDemo } from '../client/i18n.js';
import {
  buildGlossary,
  glossaryTermCount,
  searchGlossary,
} from '../client/glossary.js';

function localizedDemos(language) {
  return demos.map((demo) => localizeDemo(publicDemo(demo), language));
}

test('глобальный словарь объединяет основы и термины всех глав', () => {
  const entries = buildGlossary('ru', localizedDemos('ru'));

  assert.ok(glossaryTermCount() >= 50);
  assert.ok(entries.length > glossaryTermCount());
  assert.equal(new Set(entries.map((entry) => entry.id)).size, entries.length);
  assert.ok(entries.some((entry) => entry.term === 'RSS'));
  assert.ok(entries.some((entry) => entry.term === 'Demultiplexer'));
  assert.ok(entries.some((entry) => entry.term === 'ACID'));
  assert.ok(entries.some((entry) => entry.term === 'Materialized View'));
});

test('поиск понимает сокращения, расшифровки, переводы и синонимы', () => {
  const entries = buildGlossary('ru', localizedDemos('ru'));

  assert.equal(searchGlossary(entries, 'I/O')[0].id, 'io');
  assert.equal(searchGlossary(entries, 'ввод-вывод')[0].id, 'io');
  assert.equal(searchGlossary(entries, 'input output')[0].id, 'io');
  assert.equal(searchGlossary(entries, 'демультиплексор')[0].term, 'Demultiplexer');
  assert.equal(searchGlossary(entries, 'resident set size')[0].term, 'RSS');
  assert.equal(
    searchGlossary(entries, 'UV_THREADPOOL_SIZE')[0].term,
    'UV_THREADPOOL_SIZE',
  );
  assert.equal(searchGlossary(entries, 'план запроса')[0].term, 'EXPLAIN ANALYZE');
  assert.equal(searchGlossary(entries, 'уровень изоляции')[0].term, 'Isolation level');
});

test('английская карточка не содержит русского текста в видимых полях', () => {
  const entries = buildGlossary('en', localizedDemos('en'));

  for (const entry of entries) {
    const visibleContent = {
      term: entry.term,
      expansion: entry.expansion,
      category: entry.category,
      definition: entry.definition,
      context: entry.context,
      example: entry.example,
      sources: entry.sources,
    };
    assert.doesNotMatch(JSON.stringify(visibleContent), /[А-Яа-яЁё]/);
  }
});
