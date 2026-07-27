import { memoryLab } from '../../../src/memory-lab.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json(memoryLab.snapshot(), {
    headers: { 'Cache-Control': 'no-store' },
  });
}
