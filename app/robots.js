import { siteUrl } from '../src/site.js';

export default function robots() {
  const base = siteUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
