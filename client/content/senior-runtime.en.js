export const seniorRuntimeEnglish = {
  'runtime-models': {
    title: 'Node.js vs Java, Go, and Python',
    eyebrow: 'Concurrency model → suitable workload',
    summary:
      'Learn why Node is efficient for I/O, where the Event Loop advantage ends, and which models Java, Go, and Python provide.',
    theory:
      'Node handles many I/O-bound operations economically: its main JavaScript thread does not wait on a socket and receives a callback when readiness arrives. CPU-bound JavaScript still occupies the whole isolate. Java offers platform and virtual threads plus NIO, Go multiplexes goroutines over OS threads, and Python combines asyncio, threads, processes, and CPython builds with different GIL behavior. Efficiency always belongs to a particular workload.',
    watchFor:
      'Twenty-four waits are registered almost immediately and complete through one Event Loop. A short CPU loop then delays an already eligible timer: I/O concurrency is not CPU parallelism.',
    expected: [
      'Many pending I/O operations do not require one JavaScript thread each.',
      'Promises and the Event Loop coordinate waiting but do not add CPU cores.',
      'Synchronous CPU work increases latency for every connection on one isolate.',
      'Worker Threads and processes introduce different parallelism and failure boundaries.',
      'Java, Go, and Python cannot be described accurately by one outdated thread slogan.',
      'A runtime choice is validated with workload metrics, not an absolute language ranking.',
    ],
    code: `const waits = Array.from({ length: 24 }, (_, index) =>
  delay(25 + (index % 4) * 10)
);

// One Event Loop coordinates all pending waits:
await Promise.all(waits);

// This CPU work occupies the main JavaScript isolate:
heavyCpuWork(180);`,
    learning: {
      plain:
        'Node is less like one slow worker and more like a dispatcher that does not stand beside every waiting order. While a database, network, or disk is working, the main JavaScript thread can serve other ready events. This saves threads during I/O waiting; it does not make heavy JavaScript parallel.',
      foundation:
        'One Node process contains a V8 isolate with a main JavaScript Event Loop, V8 service threads, and libuv facilities. Sockets usually rely on OS readiness, some fs/crypto/DNS work uses a bounded libuv pool, and CPU-bound JavaScript can move to Worker Threads or processes. “Node is single-threaded” describes JavaScript execution in one isolate, not the entire process.',
      why:
        'A senior-level comparison connects a concurrency model to I/O wait, CPU cost, per-task memory, failure isolation, and observability instead of declaring one runtime universally superior.',
      terms: [
        ['Concurrency', 'Multiple tasks are in progress with overlapping lifetimes; their instructions need not execute at the same instant.'],
        ['Parallelism', 'Instructions actually execute simultaneously on multiple cores or hardware threads.'],
        ['I/O-bound', 'Work dominated by waiting for a network, disk, database, or another external resource.'],
        ['CPU-bound', 'Work limited by computation such as serialization, compression, image processing, cryptography, or large loops.'],
        ['V8 isolate', 'An isolated V8 environment with its own heap and JavaScript execution state. A Worker Thread creates another isolate.'],
        ['Throughput', 'Successfully completed operations per unit of time; it is not the latency of one operation.'],
      ],
      steps: [
        ['Classify the work', 'Separate short JavaScript, network waits, native operations, and heavy CPU code.'],
        ['Node registers I/O', 'The main thread delegates waiting to the OS or libuv and returns to ready callbacks.'],
        ['Readiness returns a continuation', 'A callback or Promise continuation waits for a free JavaScript stack.'],
        ['CPU changes the picture', 'Long synchronous JavaScript occupies the isolate and delays all of its connections.'],
        ['Choose a parallel boundary', 'Use Worker Threads for CPU/shared memory, processes for isolation, or job queues for distributed work.'],
        ['Verify the model', 'Compare throughput, p95/p99 latency, Event Loop delay, CPU, memory, and overload behavior.'],
      ],
      nuances: [
        ['Java is not only heavyweight thread-per-request', 'Java has platform threads, NIO/reactive designs, and virtual threads. A virtual thread can unmount during blocking I/O, scaling synchronous code without making CPU work faster.'],
        ['Go is not one OS thread per goroutine', 'The Go scheduler multiplexes lightweight goroutines over OS threads and can run work in parallel across available cores.'],
        ['Python depends on implementation and build', 'asyncio also uses an Event Loop for I/O. Default CPython serializes much Python bytecode with the GIL, while multiprocessing, native extensions, and optional free-threaded builds change the boundary.'],
        ['Node is not efficient at everything', 'Many waiting sockets are a strong fit. Large synchronous serialization or computation per request can turn one isolate into the bottleneck.'],
        ['Architecture can outweigh the language', 'Connection pools, backpressure, algorithms, batching, caches, process counts, and limits often dominate the result.'],
      ],
      pitfalls: [
        ['Node.js is entirely single-threaded.', 'One thread normally executes JavaScript for one isolate, while the process also uses service threads, the libuv pool, and optional Worker Threads.'],
        ['Async code automatically uses every CPU core.', 'It avoids wasting a thread while waiting. CPU parallelism needs multiple isolates/processes or a parallel native API.'],
        ['Java always creates an expensive OS thread per request.', 'That is one model among platform threads, NIO/reactive systems, and JVM-scheduled virtual threads.'],
        ['Python threads can never run in parallel under any conditions.', 'The answer depends on CPython/GIL mode, free-threaded builds, native code, and the chosen multiprocessing or asyncio architecture.'],
        ['High throughput guarantees low latency.', 'A service can complete many requests per second and still have poor p95/p99 tail latency.'],
      ],
      codeIntro:
        'The scenario first registers many waits on one Event Loop and then deliberately runs a CPU loop. The first part demonstrates inexpensive concurrency; the second exposes the cost of occupying one JavaScript isolate.',
      codeNotes: [
        'Promise.all creates no threads; the timers are already registered when the Promises are created.',
        'Twenty-four waits do not require twenty-four JavaScript threads.',
        'A synchronous CPU loop delays a timer whose deadline has already passed.',
        'A fair benchmark needs equivalent logic, warm-up, a defined load profile, and percentile latency.',
      ],
      questions: [
        'Why are ten thousand open sockets fundamentally different from ten thousand active CPU computations?',
        'When would you choose a Worker Thread, a process, or a BullMQ Worker?',
        'Which measurements prove an advantage instead of repeating a marketing claim?',
      ],
    },
  },
  'memory-diagnostics': {
    title: 'Closures, GC, and heap snapshots',
    eyebrow: 'Retainer path → proven cause',
    summary:
      'Reproduce a leak through a closure or global cache, capture the heap, and find the retention path from payload to GC root.',
    theory:
      'Garbage collection frees unreachable objects, not objects that are merely useless to the business. A stored function can retain a payload through its lexical environment, while a global Map retains values until entries are removed. A heap snapshot serializes the graph of one V8 isolate so retained size, dominators, and retaining paths can be inspected.',
    watchFor:
      'Select Closure or Global Map cache. After growth, pause the process, create a snapshot, and download it. GC before Release cannot help because a path from a root still exists. After Release and GC, a second snapshot should lose that subgraph.',
    expected: [
      'A closure extends the payload lifetime while the function remains reachable.',
      'An unbounded Map grows without TTL, eviction, or a size limit.',
      'GC cannot remove objects with a retaining path to a root.',
      'The heap snapshot is created in the memory child, not the main Next.js isolate.',
      'Snapshot generation blocks the child temporarily and has a separate safety threshold.',
      'Comparing two snapshots is more useful than treating one snapshot as proof.',
    ],
    code: `const retainedClosures = [];
const globalCache = new Map();

function createHandler() {
  const payload = buildLargePayload();
  return () => payload.id; // closure retains payload
}

retainedClosures.push(createHandler());
globalCache.set(requestId, buildLargePayload());

// Fix the ownership lifetime:
retainedClosures.length = 0;
globalCache.clear();`,
    learning: {
      plain:
        'A closure is a function with access to variables from its creation environment. It is useful and safe by itself. A leak appears when a long-lived reference to the function accidentally extends the lifetime of a large payload. A heap snapshot lets you walk backward from the object through retaining edges to a GC root.',
      foundation:
        'V8 manages the JavaScript heap and traverses from GC roots such as globals, active stacks, closures, and internal handles. Unreachable objects may be collected; reachable objects remain alive regardless of business intent. Generational collection optimizes for the common case where many young objects die quickly and survivors move to an older generation.',
      why:
        'In production, a slow leak can resemble a cache for weeks. GC work, pause time, and RSS then rise until a container is OOM-killed. A restart only hides the cause temporarily; diagnosis needs a repeatable workload, time series, and a proven retainer path.',
      terms: [
        ['Closure', 'A function together with access to the lexical environment where it was created.'],
        ['Shallow size', 'Memory occupied by the object itself, excluding all objects reached through its references.'],
        ['Retained size', 'An estimate of memory that could become unreachable if this object and its retaining paths disappeared.'],
        ['Retainer', 'An object or edge that keeps the inspected object reachable from a GC root.'],
        ['Dominator', 'A node through which paths from GC roots to a group of objects pass, useful for finding an owner of a large retained subtree.'],
        ['Heap snapshot', 'A serialized graph of objects and references for one V8 isolate at a point in time.'],
      ],
      steps: [
        ['Confirm the symptom', 'Look for sustained heap or RSS growth after equivalent load cycles, not one random peak.'],
        ['Capture a baseline', 'After warm-up and stabilization, create the first snapshot on a safe replica.'],
        ['Reproduce growth', 'Repeat one operation a controlled number of times and let temporary work finish.'],
        ['Capture a second snapshot', 'Compare object counts, shallow and retained sizes, and constructor or group deltas.'],
        ['Follow retaining paths', 'Trace grown objects back to an array of closures, global Map, listener, or another root.'],
        ['Fix ownership and retest', 'Add cleanup, TTL, LRU, a size bound, or listener removal, then repeat the same workload.'],
      ],
      nuances: [
        ['A closure is not simply a full scope copy', 'Think in terms of the available lexical environment. The actual retaining edge in the current V8 snapshot is what matters.'],
        ['A snapshot belongs to one isolate', 'A snapshot of the main Next.js process cannot contain the memory child or a Worker Thread heap, so this lab invokes writeHeapSnapshot inside the child.'],
        ['Buffer appears differently from Array', 'Snapshots show JS wrappers and edges, while most Buffer backing memory is external. Correlate it with external, arrayBuffers, and RSS.'],
        ['Taking a snapshot is itself risky', 'Serialization synchronously blocks the target Event Loop and may require about twice the heap. Use a replica, memory limits, and a restart plan.'],
        ['RSS may not fall immediately', 'GC returns objects to an allocator that can retain pages for reuse. Validate the new plateau and heap trend.'],
      ],
      pitfalls: [
        ['Every closure is a memory leak.', 'It is a problem only when an unwanted payload stays reachable beyond its intended lifetime.'],
        ['The object with the largest shallow size is always the culprit.', 'A small Map or closure can dominate a huge subgraph and therefore have a large retained size.'],
        ['One snapshot proves a leak.', 'It shows state. Diagnosis usually compares snapshots under repeatable load and examines retaining paths.'],
        ['global.gc() fixes a production leak.', 'GC cannot remove reachable objects. A manual call is useful for a lab, not as an ownership fix.'],
        ['An unbounded cache is not a leak because the data is useful.', 'Without a defined lifetime and upper bound, it can exhaust memory just like an accidentally retained array.'],
      ],
      codeIntro:
        'Closure mode stores functions whose lexical environments retain payloads. Global Map cache mode grows a long-lived Map without TTL or a size bound. Release removes both root references.',
      codeNotes: [
        'createRetainingClosure has returned, yet the stored function can still access payload.',
        'Global Map keys are never removed until Release is pressed.',
        'writeHeapSnapshot runs inside the child and pauses allocation first.',
        'Open the downloaded file in Chrome DevTools: Memory → Load.',
        'Compare Summary or Comparison views, then inspect Retainers and the dominator tree.',
      ],
      questions: [
        'Which exact edge connects the payload to a GC root in Closure mode?',
        'Why can a snapshot of the main server not diagnose the child?',
        'How do TTL, LRU, and a hard max size protect a cache differently?',
        'Why can heapUsed fall while RSS remains above its original value?',
      ],
    },
  },
  'production-observability': {
    title: 'Prometheus and Grafana',
    eyebrow: 'Metrics → time series → investigation',
    summary:
      'Connect process memory, Event Loop delay, and the controlled leak to a real Prometheus endpoint and provisioned Grafana dashboard.',
    theory:
      'The application publishes numeric samples at /api/metrics, Prometheus periodically scrapes the endpoint and stores time series, and Grafana runs PromQL queries to visualize trends. Monitoring discovers a symptom and its context; a heap snapshot or profiler proves the cause.',
    watchFor:
      'A controlled CPU block raises local Event Loop delay and ELU. With the optional Docker monitoring stack, the persistent runtime metrics, main and child memory, and demo counters appear on the provisioned dashboard.',
    expected: [
      '/api/metrics returns Prometheus text exposition with a valid Content-Type.',
      'A gauge reports current state while a counter accumulates events.',
      'Event Loop delay is measured separately from total CPU.',
      'Child process memory is separate from the Next.js process.',
      'Prometheus collects and stores; Grafana queries and visualizes.',
      'Low label cardinality prevents uncontrolled monitoring growth.',
      'App, Redis, Prometheus, and Grafana stay below the 6 GB project budget.',
    ],
    code: `import { monitorEventLoopDelay } from 'node:perf_hooks';

const delay = monitorEventLoopDelay({ resolution: 20 });
delay.enable();

// Prometheus scrape:
// GET /api/metrics
// node_loop_lab_process_resident_memory_bytes 123456789
// node_loop_lab_event_loop_delay_p95_seconds 0.012

console.log(delay.percentile(95) / 1e6, 'ms');`,
    learning: {
      plain:
        'A metric is a number measured repeatedly with labels and time. The application exposes current values, Prometheus retrieves and stores them as time series, and Grafana builds panels that reveal trends. Neither Prometheus nor Grafana repairs a leak.',
      foundation:
        'The lab exposes Prometheus text format at /api/metrics: main process and memory child usage, Event Loop utilization and delay, active runs, and errors. The optional Docker Compose stack scrapes it every five seconds and provisions a Grafana datasource and dashboard.',
      why:
        'A heap snapshot answers “what retains memory now,” while monitoring answers “when did growth begin, under which load, and did the release fix it?” Production diagnosis needs both, plus logs and traces.',
      terms: [
        ['Metric', 'A numeric measurement over time. A gauge moves both ways; a counter normally only increases.'],
        ['Time series', 'Samples sharing one metric name and one unique label combination.'],
        ['Scrape', 'An HTTP request from Prometheus to a metrics endpoint for the current samples.'],
        ['Cardinality', 'The number of unique label combinations. A userId or requestId label can explode storage cost.'],
        ['SLI', 'A measurable service-quality indicator such as success ratio or request latency.'],
        ['Alert', 'A rule over a time series that should usually require a sustained condition rather than one sample.'],
      ],
      steps: [
        ['The app measures', 'process.memoryUsage and perf_hooks provide runtime signals while business code increments counters.'],
        ['The endpoint exposes', '/api/metrics returns HELP, TYPE, and samples in Prometheus text format.'],
        ['Prometheus scrapes', 'It stores values with timestamps in its time-series database at regular intervals.'],
        ['PromQL calculates', 'rate(counter[window]), max_over_time, and comparisons turn samples into diagnostic signals.'],
        ['Grafana visualizes', 'The provisioned dashboard shows main and child memory, Event Loop delay, ELU, and run rates.'],
        ['An alert starts an investigation', 'A sustained trend opens a runbook: workload, logs, safe-replica snapshot, retainer path, and fix.'],
      ],
      nuances: [
        ['Heap slope matters more than one number', 'A large stable heap may be normal; a baseline that rises after equivalent load and GC cycles is suspicious.'],
        ['Event Loop delay and CPU are not interchangeable', 'Synchronous I/O or GC can produce delay, while process CPU includes work outside the main Event Loop. Correlate signals.'],
        ['Read counters with rate or increase', 'An absolute run counter grows with uptime. Use a windowed rate for current intensity; Prometheus handles resets.'],
        ['Keep labels bounded', 'mode and outcome have low cardinality. Put IDs, emails, stack traces, and request IDs in logs or traces.'],
        ['A local dashboard is not a complete production system', 'A real service also needs HTTP RED metrics, pool and queue saturation, cgroup memory, restarts and OOMKill, alert routing, and retention policy.'],
      ],
      pitfalls: [
        ['Grafana collects application metrics.', 'In this design the app exposes, Prometheus collects and stores, and Grafana queries and visualizes.'],
        ['An alert should fire on the first high sample.', 'A spike is often normal; define a threshold, window, duration, and runbook.'],
        ['RSS can be added to heapUsed and external.', 'RSS is already a total resident view, while component boundaries partially overlap.'],
        ['More context in labels is always better.', 'Unbounded values create new time series and can overload monitoring before the application.'],
        ['A clean dashboard proves there is no leak.', 'It helps reveal symptoms. Repeatable load, profiles or snapshots, and a retainer path establish the cause.'],
      ],
      codeIntro:
        'The scenario measures Event Loop delay and ELU around a controlled block. The complete server code beside it generates /api/metrics for the optional Prometheus and Grafana stack.',
      codeNotes: [
        'monitorEventLoopDelay reports nanoseconds; the endpoint converts them to seconds for Prometheus.',
        'ELU measures Event Loop activity, not the machine CPU percentage.',
        'Prometheus counters do not decrease during one process lifetime.',
        'Memory child metrics are zero until the lab is started.',
        'Monitoring ports bind to 127.0.0.1 by default.',
      ],
      questions: [
        'How can time series distinguish a useful bounded cache from a leak?',
        'Why should requestId not be a Prometheus label?',
        'Which runbook should open when heap and Event Loop delay grow together?',
        'Which HTTP metrics are still missing before this lab could support a real SLO?',
      ],
    },
  },
};
