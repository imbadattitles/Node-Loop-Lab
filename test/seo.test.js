import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sitemap from '../app/sitemap.js';

const root = new URL('../', import.meta.url);

async function projectFile(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('sitemap exposes every chapter in Russian and English', () => {
  const previous = process.env.SITE_URL;
  process.env.SITE_URL = 'https://lab.example';
  try {
    const entries = sitemap();
    assert.equal(entries.length, 14);
    assert.ok(
      entries.every(
        (entry) =>
          entry.url.startsWith('https://lab.example/') &&
          entry.alternates.languages.ru &&
          entry.alternates.languages.en,
      ),
    );
  } finally {
    if (previous === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = previous;
  }
});

test('chapter pages define canonical, hreflang and structured data', async () => {
  const [page, legacyRedirect] = await Promise.all([
    projectFile('app/[locale]/learn/[demo]/page.jsx'),
    projectFile('app/(root)/page.jsx'),
  ]);
  assert.match(page, /alternates:/);
  assert.match(page, /canonical/);
  assert.match(page, /'x-default'/);
  assert.match(page, /application\/ld\+json/);
  assert.match(page, /LearningResource/);
  assert.match(legacyRedirect, /query\?\.lang/);
  assert.match(legacyRedirect, /query\?\.demo/);
});

test('the migrated project uses Next without Vite or Express', async () => {
  const packageJson = JSON.parse(await projectFile('package.json'));
  assert.equal(packageJson.dependencies.next, '16.2.12');
  assert.equal(packageJson.dependencies.express, undefined);
  assert.equal(packageJson.devDependencies.vite, undefined);
  assert.match(packageJson.scripts.build, /next build/);
  assert.match(packageJson.scripts.start, /standalone\/server\.js/);
});

test('server-rendered header links to the main Nneon project', async () => {
  const header = await projectFile('client/components/Header.jsx');
  assert.match(header, /href="https:\/\/nneonweb\.com\/"/);
  assert.doesNotMatch(header, /nofollow/);
  assert.match(header, /mainProjectLink/);
});
