import { memoryLab } from '../../../../src/memory-lab.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET(request) {
  try {
    return new Response(memoryLab.createEventStream(request.signal), {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-store, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: error.statusCode ?? 500 },
    );
  }
}
