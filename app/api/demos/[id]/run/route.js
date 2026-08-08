import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { demos } from '../../../../../src/demos.js';
import { runDemoWithIsolation } from '../../../../../src/disposable-demo-executor.js';
import {
  beginDemoMeasurement,
  limitedJson,
  runtimeState,
} from '../../../../../src/runtime-state.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request, context) {
  const { id } = await context.params;
  const demo = demos.find((candidate) => candidate.id === id);
  if (!demo) {
    return Response.json(
      { error: 'Неизвестный учебный сценарий' },
      { status: 404 },
    );
  }
  if (demo.interactive) {
    return Response.json(
      { error: 'Этот сценарий управляется через интерактивную панель' },
      { status: 400 },
    );
  }

  const rate = runtimeState.demoRateLimit.check(request);
  if (!rate.allowed) return limitedJson(rate);

  const permit = runtimeState.demoConcurrency.enter(request);
  if (!permit.allowed) {
    return Response.json(
      {
        error:
          'Публичная лаборатория уже выполняет допустимое число сценариев. Повторите немного позже.',
      },
      { status: 429, headers: rate.headers },
    );
  }

  const encoder = new TextEncoder();
  const runId = randomUUID().slice(0, 8);
  const startedAt = performance.now();
  let sequence = 0;
  let closed = false;
  const measurement = beginDemoMeasurement();
  const executionController = new AbortController();
  const abortExecution = () => executionController.abort();
  request.signal.addEventListener('abort', abortExecution, { once: true });

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (lane, type, message, details = null) => {
        if (closed) return;
        const event = {
          runId,
          demoId: demo.id,
          sequence: ++sequence,
          at: Number((performance.now() - startedAt).toFixed(1)),
          lane,
          type,
          message,
          details,
        };
        console.log(
          `[${runId}] +${String(event.at).padStart(6)}ms [${lane}] ${message}`,
        );
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          closed = true;
        }
      };

      emit('system', 'start', `Запуск «${demo.title}»`);
      try {
        await runDemoWithIsolation(demo, emit, {
          signal: executionController.signal,
        });
        emit(
          'system',
          'done',
          `Сценарий завершён за ${Math.round(performance.now() - startedAt)} мс`,
        );
      } catch (error) {
        measurement.finish({ error: true });
        emit('system', 'error', error.message);
      } finally {
        measurement.finish();
        permit.release();
        request.signal.removeEventListener('abort', abortExecution);
        if (!closed) controller.close();
        closed = true;
      }
    },
    cancel() {
      closed = true;
      executionController.abort();
      measurement.finish({ error: true });
      permit.release();
      request.signal.removeEventListener('abort', abortExecution);
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      ...rate.headers,
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      'X-Content-Type-Options': 'nosniff',
      'X-Accel-Buffering': 'no',
    },
  });
}
