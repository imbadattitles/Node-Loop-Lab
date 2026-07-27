import { demos } from '../src/demos.js';
import { chapterPath, locales, siteUrl } from '../src/site.js';

export default function sitemap() {
  const base = siteUrl();
  return locales.flatMap((locale) =>
    demos.map((demo, index) => ({
      url: `${base}${chapterPath(locale, demo.id)}`,
      changeFrequency: 'monthly',
      priority: index === 0 ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((language) => [
            language,
            `${base}${chapterPath(language, demo.id)}`,
          ]),
        ),
      },
    })),
  );
}
