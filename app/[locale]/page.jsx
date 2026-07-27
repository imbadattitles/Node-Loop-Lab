import { notFound, redirect } from 'next/navigation';
import { chapterPath, firstDemoId, locales } from '@/src/site.js';

export default async function LocaleHome({ params }) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();
  redirect(chapterPath(locale, firstDemoId));
}
