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
      'Интерактивная лаборатория backend runtimes: Node.js, Python, CPython, NestJS и PostgreSQL с теорией, production-кейсами и настоящими runtime-трассами.',
    chapterSuffix: 'backend runtimes на практике',
  },
  en: {
    siteDescription:
      'An interactive backend runtime lab for Node.js, Python, CPython, NestJS, and PostgreSQL with theory, production cases, and real runtime traces.',
    chapterSuffix: 'backend runtimes in practice',
  },
};
