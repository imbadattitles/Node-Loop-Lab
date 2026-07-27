import { memoryLab } from '../../../../../src/memory-lab.js';
import { limitedJson, runtimeState } from '../../../../../src/runtime-state.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request, context) {
  const rate = runtimeState.memoryActionRateLimit.check(request);
  if (!rate.allowed) return limitedJson(rate);

  try {
    const { action } = await context.params;
    return Response.json(memoryLab.action(action), { headers: rate.headers });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: error.statusCode ?? 500, headers: rate.headers },
    );
  }
}
