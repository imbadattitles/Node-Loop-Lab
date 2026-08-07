import { notFound } from 'next/navigation';
import App from '@/client/App.jsx';
import { localizeDemo } from '@/client/i18n.js';
import { demos, publicDemo } from '@/src/demos.js';
import { clientLabProfile } from '@/src/lab-profile.js';
import {
  chapterPath,
  localeCopy,
  locales,
  siteUrl,
} from '@/src/site.js';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    demos.map((demo) => ({ locale, demo: demo.id })),
  );
}

function resolveChapter(locale, id) {
  if (!locales.includes(locale)) return null;
  const raw = demos.find((candidate) => candidate.id === id);
  if (!raw) return null;
  return {
    raw,
    localized: localizeDemo(publicDemo(raw), locale),
  };
}

export async function generateMetadata({ params }) {
  const { locale, demo: id } = await params;
  const chapter = resolveChapter(locale, id);
  if (!chapter) return {};

  const { localized } = chapter;
  const title = `${localized.title}: ${localeCopy[locale].chapterSuffix}`;
  const description = localized.summary;
  const canonical = chapterPath(locale, id);

  return {
    metadataBase: new URL(siteUrl()),
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ru: chapterPath('ru', id),
        en: chapterPath('en', id),
        'x-default': chapterPath('ru', id),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
      alternateLocale: [locale === 'ru' ? 'en_US' : 'ru_RU'],
    },
    twitter: { title, description },
  };
}

export default async function ChapterPage({ params }) {
  const { locale, demo: id } = await params;
  const chapter = resolveChapter(locale, id);
  if (!chapter) notFound();

  const canonical = `${siteUrl()}${chapterPath(locale, id)}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: chapter.localized.title,
    description: chapter.localized.summary,
    url: canonical,
    inLanguage: locale,
    educationalLevel: 'Beginner',
    learningResourceType: 'Interactive tutorial',
    isAccessibleForFree: true,
    provider: {
      '@type': 'Organization',
      name: 'Runtime Lab',
      url: siteUrl(),
    },
    about:
      chapter.raw.category === 'python'
        ? ['Python', 'CPython', 'asyncio', chapter.localized.title]
        : [
            'Node.js',
            'Event Loop',
            chapter.localized.title,
            chapter.localized.eyebrow,
          ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <App
        initialDemos={demos.map(publicDemo)}
        initialDemoId={id}
        initialLanguage={locale}
        initialProfile={clientLabProfile()}
        initialRuntime={process.version}
        initialPlatform={`${process.platform}/${process.arch}`}
      />
    </>
  );
}
