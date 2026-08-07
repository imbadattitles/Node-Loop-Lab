import { spawn } from 'node:child_process';
import path from 'node:path';
import { createInterface } from 'node:readline';

const pythonScriptPath = path.join(
  process.env.NODE_LOOP_SOURCE_DIR ||
    path.join(/* turbopackIgnore: true */ process.cwd(), 'src'),
  'python-lab.py',
);

const maxOutputBytes = 512 * 1024;
const timeoutMs = 12_000;

const messageFactories = {
  'python.version': ({ implementation, version }) =>
    `Интерпретатор: ${implementation} ${version}`,
  'syntax.objects': ({ count }) =>
    `Создан list из ${count} dict-объектов; имена ссылаются на объекты, а не содержат отдельные типизированные ячейки`,
  'syntax.comprehension': ({ ids, total }) =>
    `List comprehension отфильтровал paid-заказы ${ids} и вычислил total=${total}`,
  'syntax.unpack': ({ first, middle, last }) =>
    `Распаковка sequence: first=${first}, middle=${middle}, last=${last}`,
  'syntax.enumerate': ({ labels }) =>
    `enumerate дал индекс и значение без ручного счётчика: ${labels}`,
  'syntax.function': ({ rendered }) =>
    `Функция получила keyword-only argument и вернула: ${rendered}`,
  'syntax.result': () =>
    'Синтаксический сценарий завершён: коллекции, comprehension, unpacking и функции выполнились в CPython',
  'semantics.dataclass': ({ rendered, subtotal }) =>
    `dataclass создал читаемый объект ${rendered}; вычисляемое property subtotal=${subtotal}`,
  'semantics.alias': ({ shared }) =>
    `Два имени указывают на один mutable list: изменение видно через оба имени = ${shared}`,
  'semantics.mutable-default': ({ first, second }) =>
    `Mutable default переиспользован между вызовами: first=${first}; second=${second}`,
  'semantics.safe-default': ({ first, second }) =>
    `Default None создаёт отдельный list на вызов: first=${first}; second=${second}`,
  'semantics.generator': ({ values }) =>
    `Generator вычислял значения лениво и отдал: ${values}`,
  'semantics.match': ({ label }) =>
    `match/case разобрал форму dict и выбрал ветку: ${label}`,
  'semantics.exception': ({ message }) =>
    `except перехватил ожидаемую ошибку преобразования: ${message}`,
  'semantics.context': ({ closed, text }) =>
    `with вызвал cleanup ресурса: closed=${closed}; записано «${text}»`,
  'semantics.result': () =>
    'Семантический сценарий завершён: объекты, классы, генератор, исключение и context manager наблюдались вживую',
  'runtime.config': ({ implementation, version, gil }) =>
    `${implementation} ${version}: GIL активен=${gil}`,
  'runtime.bytecode': ({ operations }) =>
    `compile создал code object; dis показал bytecode operations: ${operations}`,
  'runtime.frame': ({ functionName, locals }) =>
    `Выполняемый code block имеет frame: function=${functionName}, locals=${locals}`,
  'runtime.gc': ({ collected, aliveBefore, aliveAfter }) =>
    `Цикл ссылок: alive до gc=${aliveBefore}; gc.collect() нашёл ${collected}; alive после=${aliveAfter}`,
  'asyncio.created': () =>
    'asyncio.create_task создал Tasks; coroutine bodies ещё ждут передачи управления loop',
  'asyncio.started': ({ name }) =>
    `Task ${name} вошёл в coroutine и дошёл до await`,
  'asyncio.resumed': ({ name }) =>
    `Task ${name} продолжился после готовности awaitable`,
  'asyncio.result': ({ order }) =>
    `asyncio.gather дождался обеих Tasks; порядок завершения=${order}`,
  'asyncio.blocking': ({ delay }) =>
    `time.sleep внутри coroutine заблокировал event loop; timer опоздал примерно на ${delay} мс`,
  'asyncio.offload': ({ delay }) =>
    `asyncio.to_thread вынес blocking I/O; timer loop опоздал только примерно на ${delay} мс`,
  'runtime.result': () =>
    'CPython VM и asyncio — разные слои: интерпретатор выполняет bytecode, а библиотечный event loop планирует cooperative Tasks',
};

function formatMessage(event) {
  const factory = messageFactories[event.key];
  return factory ? factory(event.data ?? {}) : `${event.key}: ${JSON.stringify(event.data ?? {})}`;
}

function runWithExecutable(executable, scenario, emit) {
  return new Promise((resolve) => {
    let settled = false;
    let outputBytes = 0;
    let stderr = '';
    const child = spawn(executable, [pythonScriptPath, scenario], {
      env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUNBUFFERED: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    const lines = createInterface({ input: child.stdout });

    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      lines.close();
      resolve(result);
    };

    const timer = setTimeout(() => {
      child.kill();
      finish({ ok: false, reason: `timeout ${timeoutMs} ms` });
    }, timeoutMs);

    lines.on('line', (line) => {
      outputBytes += Buffer.byteLength(line, 'utf8');
      if (outputBytes > maxOutputBytes) {
        child.kill();
        finish({ ok: false, reason: 'output limit exceeded' });
        return;
      }

      try {
        const event = JSON.parse(line);
        emit(event.lane, event.type, formatMessage(event));
      } catch {
        stderr += `Некорректная строка Python runtime: ${line}\n`;
      }
    });

    child.stderr.on('data', (chunk) => {
      stderr = `${stderr}${chunk}`.slice(-8_000);
    });
    child.once('error', (error) => {
      finish({ ok: false, unavailable: error.code === 'ENOENT', reason: error.message });
    });
    child.once('close', (code, signal) => {
      finish({
        ok: code === 0,
        unavailable: code === 9009 || /not found|не найден/i.test(stderr),
        reason: stderr.trim() || `exit=${code}, signal=${signal ?? 'none'}`,
      });
    });
  });
}

async function runPythonScenario(scenario, emit) {
  const candidates = [process.env.PYTHON_BIN, 'python3', 'python'].filter(
    (value, index, all) => value && all.indexOf(value) === index,
  );
  const failures = [];

  for (const executable of candidates) {
    const result = await runWithExecutable(executable, scenario, emit);
    if (result.ok) return;
    failures.push(`${executable}: ${result.reason}`);
  }

  emit(
    'python',
    'skip',
    'CPython не найден. Установите Python 3.11+ или запустите Docker-версию: в image интерпретатор уже включён',
  );
  emit('python', 'diagnostic', `Проверенные команды: ${candidates.join(', ')}`);
  if (process.env.LAB_MODE === 'private') {
    emit('python', 'diagnostic', failures.join(' | '));
  }
}

export async function pythonSyntaxBasics(emit) {
  await runPythonScenario('syntax', emit);
}

export async function pythonObjectModel(emit) {
  await runPythonScenario('semantics', emit);
}

export async function cpythonRuntimeAndAsyncio(emit) {
  await runPythonScenario('runtime', emit);
}
