import { ImageResponse } from 'next/og';
import { localizeDemo } from '@/client/i18n.js';
import { demos, publicDemo } from '@/src/demos.js';

export const alt = 'Runtime Lab — interactive Node.js and Python observatory';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage({ params }) {
  const { locale, demo: id } = await params;
  const raw = demos.find((candidate) => candidate.id === id) ?? demos[0];
  const chapter = localizeDemo(publicDemo(raw), locale === 'en' ? 'en' : 'ru');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          color: '#d9f7f0',
          background:
            'linear-gradient(135deg, #061015 0%, #092128 65%, #0d1714 100%)',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div
            style={{
              width: 92,
              height: 92,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #9cff36',
              color: '#9cff36',
              fontSize: 48,
            }}
          >
            N
          </div>
          <div style={{ fontSize: 30, letterSpacing: 6 }}>RUNTIME LAB</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ fontSize: 66, fontWeight: 700 }}>{chapter.title}</div>
          <div style={{ fontSize: 30, color: '#86b8b5' }}>
            {chapter.eyebrow}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
