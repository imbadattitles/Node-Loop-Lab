import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import { memoryLab } from '../../../../src/memory-lab.js';
import {
  limitedJson,
  runtimeState,
} from '../../../../src/runtime-state.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET(request) {
  const rate = runtimeState.memoryActionRateLimit.check(request);
  if (!rate.allowed) return limitedJson(rate);

  try {
    const snapshot = memoryLab.snapshotDownload();
    const stream = Readable.toWeb(createReadStream(snapshot.path));

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${snapshot.fileName}"`,
        'Content-Length': String(snapshot.size),
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        ...rate.headers,
      },
    });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: error.statusCode ?? 500, headers: rate.headers },
    );
  }
}
