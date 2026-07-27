import '../../client/styles.css';
import { localeCopy, siteUrl } from '@/src/site.js';

export const metadata = {
  metadataBase: new URL(siteUrl()),
  title: 'Node Loop Lab',
  description: localeCopy.ru.siteDescription,
  robots: { index: true, follow: true },
};

export default function RootRedirectLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
