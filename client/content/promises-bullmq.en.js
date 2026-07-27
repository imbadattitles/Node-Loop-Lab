export const promisesBullMqEnglish = {
  title: 'Promises, setImmediate, and BullMQ',
  eyebrow: 'Microtasks → check → Redis jobs',
  summary:
    'Practice Promise chains, async/await, combinators, and setImmediate, then follow a real BullMQ job lifecycle through Redis.',
  theory:
    'A Promise represents one future outcome inside a JavaScript process: its executor runs synchronously, while then/catch/finally continue the chain through microtasks. setImmediate moves a callback into the Node check phase. BullMQ operates at a higher level: a producer stores a job in Redis and a Worker processes it independently from the original HTTP request.',
  watchFor:
    'The executor emits synchronous events first, followed by Promise microtasks and setImmediate. Promise.all returns values in input order, not completion order. Under Docker, Queue.add writes a real job to Redis, a Worker moves it through active/completed, and QueueEvents delivers the result.',
  expected: [
    'The Promise executor runs before the current stack becomes empty.',
    'Each then creates a new Promise and receives the previous link’s return value.',
    'catch can recover with a value, while finally preserves it unless finally throws or rejects.',
    'Promise.all preserves input order; allSettled exposes both statuses.',
    'setImmediate and the timers/promises variant continue in the check phase.',
    'A BullMQ job lives in Redis independently from the Promise returned by the HTTP controller.',
    'Without REDIS_URL, the BullMQ section is explicitly skipped while every Promise example still runs.',
  ],
  code: `import { setImmediate as waitImmediate } from 'node:timers/promises';
import { Queue, QueueEvents, Worker } from 'bullmq';

const value = await Promise.resolve(2)
  .then(number => number * 3)
  .then(async number => {
    await waitImmediate(); // check phase
    return number + 1;
  })
  .catch(error => {
    console.error(error);
    return 0;
  })
  .finally(() => console.log('cleanup'));

const connection = { host: 'redis', port: 6379 };
const queue = new Queue('examples', { connection });
const events = new QueueEvents('examples', { connection });
const worker = new Worker('examples', async job => {
  return { doubled: job.data.value * 2 };
}, { connection });

await events.waitUntilReady();
const job = await queue.add('double', { value });
console.log(await job.waitUntilFinished(events, 5000));`,
  learning: {
    plain:
      'A Promise is not a background thread. Think of it as a box for exactly one future result. The box starts pending and permanently becomes either fulfilled with a value or rejected with an error. then, catch, and finally do not mutate that box: each call creates the next Promise in a chain. BullMQ solves a different problem by storing work in Redis so separate Workers can pick it up now, later, or after a process restart.',
    foundation:
      'The function passed to new Promise(executor) is called synchronously, while then/catch/finally reactions are scheduled as microtasks. An async function always returns a Promise; await pauses only that function and resumes it through a microtask. setImmediate registers a callback for the Node check phase and does not mean “execute immediately.” BullMQ sits above the Event Loop: Queue writes a job to Redis, Worker processes it, and QueueEvents observes global queue events.',
    why:
      'These layers are easy to conflate. A Promise coordinates a result inside a running program, setImmediate yields to a later check phase, and BullMQ persists work across HTTP requests, processes, and machines. Choosing the correct layer makes failures predictable and prevents important work from disappearing during a restart.',
    terms: [
      [
        'Promise',
        'An object for one future outcome: fulfilled with a value or rejected with a reason. Settlement cannot be reversed.',
      ],
      [
        'Executor',
        'The function passed to new Promise. It runs synchronously and receives resolve/reject; it is mainly useful for adapting callback APIs.',
      ],
      [
        'Pending / fulfilled / rejected',
        'The three Promise states. Fulfilled and rejected are collectively settled, and a settled Promise never returns to pending.',
      ],
      [
        'then chain',
        'A chain of new Promises. A returned value feeds the next link, a returned Promise is awaited, and a throw becomes a rejection.',
      ],
      [
        'Microtask',
        'A high-priority Promise continuation drained after current JavaScript and before the Event Loop advances to another phase.',
      ],
      [
        'async / await',
        'async wraps the return value in a Promise. await subscribes to a Promise and pauses only the current async function, not Node’s thread.',
      ],
      [
        'Promise.all',
        'Waits for every input to fulfill and preserves result order. Its first rejection rejects the aggregate but does not cancel remaining work.',
      ],
      [
        'Promise.allSettled',
        'Waits for every input and returns fulfilled/rejected status objects, useful when one failure must not hide other results.',
      ],
      [
        'Promise.race / any',
        'race adopts the first settled outcome, including failure. any adopts the first fulfillment or rejects with AggregateError if none fulfill.',
      ],
      [
        'setImmediate',
        'A Node API for a check-phase callback. It is neither a microtask nor a context-free promise to beat setTimeout.',
      ],
      [
        'BullMQ',
        'A Redis-backed Node.js job queue that coordinates producers, workers, retries, delays, priorities, and lifecycle events.',
      ],
      [
        'Redis',
        'BullMQ’s external state store for waiting, active, delayed, completed, and failed jobs. BullMQ is not a durable queue without Redis.',
      ],
      [
        'Job',
        'A named unit of work with serializable data and options such as attempts, backoff, delay, priority, and removal policies.',
      ],
      [
        'BullMQ Worker',
        'A job consumer. Its processor may be async, but a regular BullMQ Worker does not automatically move CPU-heavy JavaScript off its process thread.',
      ],
      [
        'Idempotency',
        'The property that makes replaying the same job safe instead of sending duplicate email, payment, or database effects.',
      ],
    ],
    steps: [
      [
        'The executor runs now',
        'new Promise(executor) calls the executor synchronously. Code after resolve still reaches the end of that executor.',
      ],
      [
        'One outcome wins',
        'The first resolve/reject wins. Resolving with another Promise adopts that Promise’s eventual outcome.',
      ],
      [
        'Reactions become microtasks',
        'then, catch, and finally do not enter the current stack; they run after the synchronous callback completes.',
      ],
      [
        'Every link returns a Promise',
        'The next then waits for the previous return. A forgotten return breaks waiting and error propagation.',
      ],
      [
        'await expresses the same rule',
        'Code before await runs now; continuation resumes after settlement. try/catch handles rejection like .catch().',
      ],
      [
        'A combinator chooses policy',
        'all, allSettled, race, and any receive already-created values/Promises and aggregate their outcomes differently.',
      ],
      [
        'setImmediate changes the phase',
        'Its callback enters check. Promise microtasks from the current callback normally run before Event Loop phases continue.',
      ],
      [
        'A producer adds a BullMQ job',
        'queue.add resolves after Redis stores the job. That confirms enqueueing, not completion of the business operation.',
      ],
      [
        'A Worker moves waiting to active',
        'An available Worker reserves the job, calls its processor, and turns return/throw into completed/failed.',
      ],
      [
        'Events, retries, and cleanup',
        'QueueEvents reports lifecycle globally; attempts/backoff retry transient failures; removal policies prevent unbounded Redis growth.',
      ],
    ],
    nuances: [
      [
        'Promise does not make synchronous work async',
        'new Promise(() => heavyCpu()) runs heavyCpu immediately on the current thread. CPU-bound work needs a Worker Thread or another process.',
      ],
      [
        'resolve does not call then immediately',
        'resolve settles or adopts another Promise. A registered then still runs as a microtask after the current stack.',
      ],
      [
        'finally is transparent—until it is not',
        'A normal return from finally preserves the original outcome, but a throw or rejected Promise from finally replaces it.',
      ],
      [
        'catch covers the returned chain above it',
        'It receives source rejection, throws from then, and returned rejected Promises. Detached, unreturned work can escape that chain.',
      ],
      [
        'Promise.all is fail-fast, not cancel-fast',
        'The aggregate rejects early, but network calls, timers, and jobs continue unless their own APIs receive cancellation.',
      ],
      [
        'A race timeout cancels nothing by itself',
        'The losing Promise keeps running. fetch needs AbortController; BullMQ needs an explicit job cancellation strategy.',
      ],
      [
        'setImmediate depends on location',
        'Inside one I/O callback, check precedes the next timers pass, so immediate beats a zero timer. There is no universal main-module order.',
      ],
      [
        'BullMQ Worker is a role, not Worker Thread',
        'It may run in this process, another process, or another machine. An async processor suits I/O, while CPU loops still block their process.',
      ],
      [
        'The durable state lives in Redis',
        'A pending Promise disappears with its process. A BullMQ job can remain available after its producer HTTP request or process exits.',
      ],
      [
        'Delivery is not a unique business effect',
        'Retries and stalled-job recovery require idempotency through stable job IDs, database constraints, or processed-operation records.',
      ],
    ],
    pitfalls: [
      [
        'new Promise(async (resolve) => ...) is the normal way to use await.',
        'The constructor expects a synchronous executor. An async executor creates a second Promise whose rejection is not automatically connected; move async work into a separate function.',
      ],
      [
        'then changes the original Promise.',
        'then always returns a new Promise. The original outcome remains unchanged.',
      ],
      [
        'The next then waits even if I forget return.',
        'Without return, the chain receives undefined and continues before the detached operation.',
      ],
      [
        'await blocks the Event Loop until the response arrives.',
        'It pauses one async function. The Event Loop can serve other callbacks while the awaited Promise is pending.',
      ],
      [
        'Promise.all starts functions in parallel.',
        'Operations start when the functions are called. Promise.all only aggregates the Promises/values it receives.',
      ],
      [
        'setImmediate means run right now.',
        'It registers a check-phase callback that still waits for a free stack and the proper Event Loop pass.',
      ],
      [
        'BullMQ is a large Event Loop callback queue.',
        'BullMQ is a distributed application queue in Redis; runtime callback/microtask queues belong to one Node process.',
      ],
      [
        'Successful queue.add means the email has been sent.',
        'It means the job was stored. Worker completion or a completed QueueEvents event confirms processing.',
      ],
    ],
    codeIntro:
      'The main snippet connects three distinct layers. Promise builds a local result chain, setImmediate yields to the check phase, and BullMQ stores a separate Redis job for a Worker. They complement rather than replace one another.',
    codeNotes: [
      'Return a value or Promise from every then when the next link must wait.',
      'One catch at the end handles rejection from every returned link above it.',
      'Use finally for cleanup rather than ordinary result transformation.',
      'node:timers/promises provides await setImmediate() without a manual constructor.',
      'queue.add and the Worker processor communicate through Redis, not shared memory.',
      'Close Queue/Worker/QueueEvents at shutdown and configure result removal.',
      'Make the Worker’s business effect idempotent before enabling retries.',
    ],
    examples: [
      {
        title: '01 · Adapt a callback to Promise',
        goal:
          'Use the constructor at an old callback boundary; an already promise-based API does not need another constructor.',
        code: `import { readFile } from 'node:fs';

function readText(path) {
  return new Promise((resolve, reject) => {
    readFile(path, 'utf8', (error, text) => {
      if (error) return reject(error);
      resolve(text);
    });
  });
}`,
        notes: [
          'The executor runs synchronously.',
          'resolve/reject run later from the callback.',
          'fs/promises already exists; this wrapper is educational.',
        ],
      },
      {
        title: '02 · A then chain and its required return',
        goal:
          'Each return defines the next input and connects errors into one chain.',
        code: `getUser(42)
  .then(user => {
    return getOrders(user.id);
  })
  .then(orders => orders.filter(order => order.paid))
  .then(paid => console.log(paid))
  .catch(error => console.error(error))
  .finally(() => console.log('finished'));`,
        notes: [
          'The first then can be shortened to `.then(user => getOrders(user.id))`.',
          'A throw from any returned link reaches catch.',
          'finally receives neither paid nor error as an argument.',
        ],
      },
      {
        title: '03 · The same flow with async/await',
        goal:
          'async/await changes the syntax while remaining Promise and microtask machinery.',
        code: `async function printPaidOrders(userId) {
  try {
    const user = await getUser(userId);
    const orders = await getOrders(user.id);
    const paid = orders.filter(order => order.paid);
    console.log(paid);
    return paid;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    console.log('finished');
  }
}`,
        notes: [
          'The returned paid value becomes fulfillment.',
          'Rethrowing keeps the caller aware of failure.',
          'Use sequential awaits only for real dependencies.',
        ],
      },
      {
        title: '04 · Choose a Promise combinator',
        goal:
          'Start operations first, then choose the policy for waiting on them.',
        code: `const tasks = urls.map(url => fetch(url));

const everyResponse = await Promise.all(tasks);
const everyOutcome = await Promise.allSettled(tasks);
const firstSettled = await Promise.race(tasks);
const firstSuccess = await Promise.any(tasks);`,
        notes: [
          'all: every fulfillment or the first rejection.',
          'allSettled: a complete report without early rejection.',
          'race: first success/error; any: first success.',
        ],
      },
      {
        title: '05 · Timeout with real fetch cancellation',
        goal:
          'Promise.race is not enough: AbortController tells the losing operation to stop.',
        code: `async function fetchWithTimeout(url, timeoutMs = 2000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}`,
        notes: [
          'The caller still has to handle AbortError.',
          'Not every Promise API supports cancellation.',
          'finally guarantees timer cleanup.',
        ],
      },
      {
        title: '06 · setImmediate callback and Promise API',
        goal:
          'Yield to the check phase without promising a millisecond delay.',
        code: `import { setImmediate as waitImmediate } from 'node:timers/promises';

setImmediate(() => {
  console.log('check phase callback');
});

await waitImmediate();
console.log('continued in check phase');`,
        notes: [
          'A current-callback Promise.then normally runs first.',
          'This is a Node API, not a browser standard.',
          'Use a Worker for CPU work instead of repeatedly yielding a heavy loop.',
        ],
      },
      {
        title: '07 · BullMQ producer and Worker',
        goal:
          'The producer stores a job quickly; a Worker processes it independently from the HTTP controller.',
        code: `import { Queue, Worker } from 'bullmq';

const connection = { host: '127.0.0.1', port: 6379 };
const queue = new Queue('email', { connection });

await queue.add('welcome', { userId: 42 }, {
  jobId: 'welcome:42',
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: 1000,
  removeOnFail: 5000,
});

const worker = new Worker('email', async job => {
  return sendWelcomeEmail(job.data.userId);
}, { connection, concurrency: 10 });

worker.on('error', error => console.error(error));`,
        notes: [
          'Queue and Worker can live in separate processes or machines.',
          'jobId helps enqueue deduplication but does not replace effect idempotency.',
          'concurrency suits I/O; isolate CPU-heavy processors.',
        ],
      },
      {
        title: '08 · QueueEvents and one job result',
        goal:
          'Distinguish local Worker events from queue-wide events.',
        code: `import { QueueEvents } from 'bullmq';

const queueEvents = new QueueEvents('email', { connection });
await queueEvents.waitUntilReady();

queueEvents.on('completed', ({ jobId, returnvalue }) => {
  console.log(jobId, returnvalue);
});

const job = await queue.add('welcome', { userId: 42 });
const result = await job.waitUntilFinished(queueEvents, 10_000);

await queueEvents.close();`,
        notes: [
          'QueueEvents uses a dedicated Redis connection.',
          'The wait timeout does not necessarily cancel the job.',
          'A long-running service normally reuses one QueueEvents instance.',
        ],
      },
    ],
    questions: [
      'Why does console.log in the executor appear before console.log in then?',
      'What does the next then receive when the previous one returns nothing?',
      'Why can allSettled be better than all for independent file batches?',
      'Why are setImmediate and BullMQ not the same kind of queue?',
      'How would you make email delivery safe when BullMQ retries a job?',
    ],
  },
};
