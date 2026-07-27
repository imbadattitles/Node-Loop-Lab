import '../../client/styles.css';
import { localeCopy, locales, siteUrl } from '@/src/site.js';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark',
  themeColor: '#071116',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const language = locales.includes(locale) ? locale : 'ru';
  return {
    metadataBase: new URL(siteUrl()),
    applicationName: 'Node Loop Lab',
    title: {
      default: 'Node Loop Lab',
      template: `%s | Node Loop Lab`,
    },
    description: localeCopy[language].siteDescription,
    category: 'education',
    keywords: [
      'Node.js',
      'Event Loop',
      'JavaScript',
      'libuv',
      'Promises',
      'Worker Threads',
      'BullMQ',
    ],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Node Loop Lab',
      description: localeCopy[language].siteDescription,
      locale: language === 'ru' ? 'ru_RU' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      description: localeCopy[language].siteDescription,
    },
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  return (
    <html lang={locales.includes(locale) ? locale : 'ru'}>
      <body>{children}</body>
    </html>
  );
}
