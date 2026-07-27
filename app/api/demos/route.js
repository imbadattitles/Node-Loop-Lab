import { demos, publicDemo } from '../../../src/demos.js';
import { clientLabProfile } from '../../../src/lab-profile.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json(
    {
      node: process.version,
      platform: `${process.platform}/${process.arch}`,
      profile: clientLabProfile(),
      demos: demos.map(publicDemo),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
