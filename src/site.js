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
      'Интерактивная лаборатория Node.js: Event Loop, очереди, I/O, Worker Threads, libuv, утечки памяти, Promises, setImmediate и BullMQ с настоящими runtime-трассами.',
    chapterSuffix: 'Node.js на практике',
  },
  en: {
    siteDescription:
      'An interactive Node.js lab for the Event Loop, queues, I/O, Worker Threads, libuv, memory leaks, Promises, setImmediate, and BullMQ with real runtime traces.',
    chapterSuffix: 'Node.js in practice',
  },
};
