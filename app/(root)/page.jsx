import { redirect } from 'next/navigation';
import { demos } from '../../src/demos.js';
import {
  chapterPath,
  defaultLocale,
  firstDemoId,
  locales,
} from '../../src/site.js';

export default async function HomePage({ searchParams }) {
  const query = await searchParams;
  const locale = locales.includes(query?.lang) ? query.lang : defaultLocale;
  const demo = demos.some((candidate) => candidate.id === query?.demo)
    ? query.demo
    : firstDemoId;
  redirect(chapterPath(locale, demo));
}
