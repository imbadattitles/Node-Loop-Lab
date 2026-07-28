export const locales = ['ru', 'en'];
export const defaultLocale = 'ru';
export const firstDemoId = 'event-loop-order';

export function siteUrl() {
  const configured =
    process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return configured.replace(/\/+$/, '');
}

export function chapterPath(locale, demoId) {
  return `/${locale}/learn/${demoId}`;
}

export const localeCopy = {
  ru: {
    siteDescription:
      'Интерактивная лаборатория Node.js, NestJS и PostgreSQL: Event Loop, память, DI, SQL, индексы, транзакции и request lifecycle с настоящими runtime-трассами.',
    chapterSuffix: 'Node.js, NestJS и PostgreSQL на практике',
  },
  en: {
    siteDescription:
      'An interactive Node.js, NestJS, and PostgreSQL lab for the Event Loop, memory, DI, SQL, indexes, transactions, and request lifecycle with real runtime traces.',
    chapterSuffix: 'Node.js, NestJS, and PostgreSQL in practice',
  },
};
