import { memoryLab } from '../../../../src/memory-lab.js';
import { limitedJson, runtimeState } from '../../../../src/runtime-state.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const rate = runtimeState.memoryStartRateLimit.check(request);
  if (!rate.allowed) return limitedJson(rate);

  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 24 * 1024) {
      return Response.json({ error: 'Тело запроса слишком велико' }, { status: 413 });
    }
    const input = await request.json();
    return Response.json(memoryLab.start(input), {
      status: 202,
      headers: rate.headers,
    });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: error.statusCode ?? 400, headers: rate.headers },
    );
  }
}
