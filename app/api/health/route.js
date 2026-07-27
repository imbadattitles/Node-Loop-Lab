import { healthSnapshot } from '../../../src/runtime-state.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json(healthSnapshot(), {
    headers: { 'Cache-Control': 'no-store' },
  });
}
