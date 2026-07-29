# Node Loop Lab

[English](README.md) · [Русский](README.ru.md)

An interactive full-stack laboratory for learning how Node.js actually behaves:
the Event Loop, callback queues, event demultiplexing, main-thread blocking,
Worker Threads, the libuv thread pool, controlled memory leaks, Promises,
setImmediate, BullMQ, heap snapshots, and Prometheus/Grafana. A dedicated
chapter compares Node with modern Java, Go, and Python concurrency models,
while two more run a real Nest IoC container and send HTTP requests through
the complete Nest request lifecycle. A real Nest TCP microservice chapter covers
service boundaries, commands, events, idempotency, and distributed failures.
Five PostgreSQL chapters begin with SQL syntax and continue through relational
modeling, ACID, indexes, isolation, JOINs, and practical ORM boundaries.

The backend runs real Node.js operations and streams timestamped events to a
React interface. Each experiment combines a live trace with a beginner-friendly
theory chapter, runnable code, terminology, common misconceptions, and
self-check questions.

## Features

- Eighteen real Node.js, NestJS, microservices, and PostgreSQL experiments.
- Collapsible topic navigation instead of one ever-growing flat list.
- Streaming NDJSON traces — no WebSocket abstraction hiding the HTTP stream.
- Live Event Loop health metrics from `perf_hooks`.
- Isolated Buffer, heap, closure, and global Map cache leaks.
- Safety-limited `.heapsnapshot` downloads for Chrome DevTools.
- Prometheus endpoint and a provisioned Grafana dashboard.
- Real BullMQ Queue → Redis → Worker → QueueEvents round-trip under Compose.
- Real PostgreSQL plans, sessions, row locks, and disposable training schemas.
- Complete Russian and English interface and learning material.
- Persistent RU/EN language switch.
- Fluid, accessible typography with comfortable and large (`A+`) modes.
- Responsive desktop and mobile layout.
- React 19 + Next.js 16 App Router and Node.js Route Handlers.
- Static, crawlable RU/EN chapter URLs with canonical, hreflang, JSON-LD,
  Open Graph, robots.txt, and sitemap.xml.
- Automated API and memory-lifecycle tests.

## Navigation for a growing curriculum

The left catalog is now split into collapsible sections:

- Node.js Runtime;
- Async and jobs;
- Memory and production;
- NestJS;
- Microservices;
- Databases.

Opening a crawlable chapter URL automatically expands its section. On mobile,
the sections become horizontally scrollable cards. PostgreSQL therefore has
its own curriculum rather than being mixed into Event Loop or Nest lifecycle
material.

## Quick start

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The Promise/setImmediate part of chapter 7 works without Redis, and database
chapters remain readable without PostgreSQL. To run the real BullMQ and
PostgreSQL sections during local development:

```bash
npm run redis:up
npm run db:up
npm run dev:full
```

During development, one Next.js process serves the App Router UI and Node.js
Route Handlers on port `3000`. Pages are server-rendered with interactive
Client Components layered on top.

## Production build

```bash
SITE_URL=https://your-domain.example npm run build
npm run start:public
```

On Windows PowerShell, set `$env:SITE_URL` before `npm run build`. This origin
is embedded into canonical, hreflang, Open Graph, and sitemap URLs. Next.js
serves the generated application and Route Handlers together on port `3000`.

## Public and private profiles

The project has two runtime profiles backed by the same codebase:

| Profile | Intended use | Memory lab | API guards |
| --- | --- | --- | --- |
| `private` | `npm run dev`, personal study | 512 MB retained, 768 MB RSS, pause after 120 s | unrestricted |
| `public` | an open domain | 256 MB retained, 512 MB RSS, child exits after 60 s | rate and concurrency limits |

Useful commands:

```bash
npm run dev             # private profile with Next.js
npm run start:private   # built app, private profile
npm run start:public    # built app, public profile
```

`LAB_MODE=public|private` takes precedence when set explicitly. Otherwise a
production Node environment selects `public`, and a non-production environment
selects `private`.

When the public container is behind exactly one trusted reverse proxy such as
nginx or Caddy, set `TRUST_PROXY=1` so per-IP limits use the forwarded client
address. Leave it unset when port `3000` is exposed directly.

## Docker

Docker Compose builds the Next.js standalone application and starts it with
isolated Redis and PostgreSQL services:

```bash
docker compose up --build
```

Compose uses the `public` profile. For a private Docker instance:

```bash
npm run docker:up:private
```

Open [http://localhost:3000](http://localhost:3000). Stop and remove the
container with:

```bash
docker compose down
```

The application container is limited to **2 GB of RAM**, Redis to 256 MB
(128 MB Redis maxmemory), and PostgreSQL to 768 MB. PostgreSQL training data
lives on a 512 MB tmpfs and each run drops its unique schema. The normal
configured ceiling is about 3 GB; with optional Prometheus and Grafana it is
about 4 GB, below the project-wide 6 GB requirement. The memory-leak child
shares the application limit, and the public memory-lab thresholds still apply.
Next.js connects through a non-superuser `node_loop_lab_app` role; the separate
initialization role is not present in `DATABASE_URL`.

### Optional Prometheus and Grafana

Monitoring does not start with ordinary `npm run dev` or `docker compose up`.
Start the separate study stack with:

```bash
npm run docker:up:monitoring
```

- app: [http://localhost:3000](http://localhost:3000);
- Prometheus: [http://localhost:9090](http://localhost:9090);
- Grafana: [http://localhost:3001](http://localhost:3001);
- raw exposition:
  [http://localhost:3000/api/metrics](http://localhost:3000/api/metrics).

The Prometheus datasource and `Node Loop Lab · Runtime & Memory` dashboard are
provisioned automatically. Set Grafana credentials through
`GRAFANA_ADMIN_USER` and `GRAFANA_ADMIN_PASSWORD` in `.env`. Every UI port
binds to `127.0.0.1` by default. App, Redis, PostgreSQL, Prometheus, and Grafana
have a combined configured ceiling of about **4 GB**, below the 6 GB budget.

Stop the stack with:

```bash
npm run docker:down:monitoring
```

To use another host port in PowerShell:

```powershell
$env:APP_PORT = "8080"
docker compose up --build
```

Or run the image without Compose:

```bash
docker build -t node-loop-lab:local .
docker run --rm --init --memory=2g -p 3000:3000 node-loop-lab:local
```

Without `REDIS_URL` and `DATABASE_URL`, this standalone image skips the BullMQ
round-trip and PostgreSQL runtime traces while keeping all theory available.

The production image uses a multi-stage build, contains only runtime
dependencies, runs as the non-root `node` user, and includes an API health
check. The memory experiment remains idle until it is explicitly started in the
interface.

## Ubuntu server deployment

The repository includes the same deployment pattern as the reference project,
adapted to this architecture:

```text
Internet
   ↓
system Nginx on Ubuntu
   ↓ 127.0.0.1:8080
Node Loop Lab (Next.js) ──→ Redis
                        └─→ PostgreSQL (disposable schemas)
```

The application, Redis, and PostgreSQL ports bind to loopback by default. Only
the system Nginx is exposed to the internet. The default Compose file always
uses the restricted `public` profile.

On the first deployment:

```bash
cp .env.example .env
nano .env
bash deploy.sh
```

`deploy.sh` checks Docker and Compose, validates the loopback/proxy settings,
pulls service images, rebuilds the application, waits for every healthcheck,
verifies `/api/health`, and confirms that the server is running in `public`
mode. It intentionally does not run `git pull`.

Configure the system Nginx once:

```bash
sudo cp docker/host.nginx.example.conf \
  /etc/nginx/sites-available/node-loop-lab
sudo nano /etc/nginx/sites-available/node-loop-lab
sudo ln -s /etc/nginx/sites-available/node-loop-lab \
  /etc/nginx/sites-enabled/node-loop-lab
sudo nginx -t
sudo systemctl reload nginx
```

Replace `lab.example.com` with the real domain. If `APP_PORT` differs from
`8080`, update `proxy_pass` too. The template disables proxy buffering for
`/api/`, which is required for immediate NDJSON and SSE updates. Add HTTPS using
your normal Nginx/Certbot setup after DNS points to the server.

After subsequent reviewed updates:

```bash
git pull
bash deploy.sh
```

Useful checks:

```bash
curl http://127.0.0.1:8080/api/health
docker compose ps
docker compose logs --tail=100 node-loop-lab redis
```

The personal `private` profile should not be exposed as an open public site.
For a second protected instance, copy `.env.example` to `.env.private`, set
`APP_PORT=8081` and `REDIS_PORT=6380`, then run:

```bash
docker compose --env-file .env.private \
  -p node-loop-lab-private \
  -f compose.yml \
  -f compose.private.yml \
  up --detach --build --wait
```

Put that address behind authentication, a VPN, or an SSH tunnel.

## Experiments

### 1. Event Loop order

Compares synchronous code, `process.nextTick`, Promise microtasks,
`queueMicrotask`, `setTimeout`, `setImmediate`, and an I/O callback.

The experiment also demonstrates why the relative order of
`setTimeout(0)` and `setImmediate` depends on registration context.

### 2. Event demultiplexer

Starts a timer, file read, and DNS lookup together. It shows how Node/libuv
register multiple sources, release the JavaScript stack, and later return ready
callbacks one at a time.

### 3. Callback queue

Schedules five zero-delay timers. The first callback intentionally blocks the
main thread, making the lag of the remaining ready callbacks directly visible.

### 4. Blocking vs Worker

Runs comparable CPU work first on the main thread and then in a Worker Thread.
A heartbeat makes main-thread blocking and Worker responsiveness easy to
compare.

### 5. libuv thread pool

Submits six `crypto.pbkdf2` jobs to the native libuv pool. With the default pool
size, completions often arrive in waves.

Try different pool sizes before starting Node:

```powershell
$env:UV_THREADPOOL_SIZE = "2"
npm start
```

### 6. Controlled memory leak

The experiment allocates memory only after an explicit UI action. It supports
five allocation modes:

- `Buffer / external`;
- `Array / V8 heap`;
- mixed heap and external memory;
- a closure retaining a payload through its lexical environment;
- a global `Map` without TTL or a size bound.

Available controls:

- pause/resume allocations;
- release retained references;
- run two explicit GC passes;
- create and download a `.heapsnapshot`;
- terminate the isolated child process.

The snapshot is generated inside the child V8 isolate, so it contains the
actual leaking objects. Allocation is paused first. Because serialization is
synchronous and can require roughly `2× heap`, snapshots are allowed only up
to 128 MB retained in private mode and 64 MB in public mode. Load the file in
Chrome DevTools → Memory → Load. The child receives a minimal environment
without Redis URLs or server secrets, and public downloads are rate-limited.

The private profile keeps the extended study limits:

- one memory experiment at a time;
- maximum 512 MB retained data;
- child V8 heap limited to 640 MB;
- emergency child RSS threshold around 768 MB;
- automatic pause after two minutes;
- leaked blocks never live in the main Next.js process.

These are application safeguards rather than an operating-system quota.
The public profile lowers retained/RSS limits to 256/512 MB and terminates the
child process after one minute, even when it has already paused at its selected
limit.

### 7. Promises, setImmediate, and BullMQ

An expanded chapter for daily Promise practice:

- executor timing and one-time settlement;
- return rules in `then/catch/finally` chains;
- equivalent `async/await` error handling;
- `all`, `allSettled`, `race`, and `any`;
- timeout versus actual cancellation;
- callback and Promise variants of `setImmediate`;
- BullMQ Queue, Job, Worker, QueueEvents, retries, cleanup, and idempotency.

It contains eight standalone code recipes. Under Compose, the runtime scenario
also creates a real short-lived BullMQ queue, writes a job to Redis, processes
it with a Worker, observes completion through QueueEvents, and removes its test
keys afterward.

### 8. Node.js vs Java, Go, and Python

Separates concurrency from parallelism and I/O-bound from CPU-bound work. It
shows both the strength of non-blocking waits and the boundary of one V8
isolate. The comparison covers Java platform and virtual threads plus NIO, the
Go goroutine scheduler, and Python asyncio, the GIL, and optional free-threaded
CPython builds.

### 9. Closures, GC, and heap snapshots

A practical diagnostic workflow: baseline snapshot, repeatable workload,
comparison, shallow and retained size, dominators, and retaining paths. The UI
creates a real closure or cache leak, then lets you remove root references and
compare memory after GC.

### 10. Prometheus and Grafana

The app exposes process memory, Event Loop delay and ELU, demo counters, and
child-process memory in Prometheus text format. Optional Compose adds a
five-second Prometheus scrape and a provisioned Grafana dashboard. The chapter
also covers gauges, counters, `rate`, label cardinality, alerts, and a
production investigation runbook.

### 11. NestJS Dependency Injection and IoC

The scenario runs a real `NestFactory.createApplicationContext()` and covers:

- application graphs, modules, providers, imports, and exports;
- class, string, and Symbol injection tokens;
- `useValue`, `useFactory`, and `useExisting`;
- DEFAULT and REQUEST scopes through real ContextIds;
- request-scope propagation and its cost;
- ports/adapters and provider overrides in tests;
- circular dependencies and the limited role of `forwardRef`.

### 12. NestJS request lifecycle

The runtime starts an ephemeral Nest HTTP server on loopback and makes three
real requests:

```text
success:
middleware → guard → interceptor:before → pipe
→ controller → service → interceptor:after

invalid parameter:
middleware → guard → interceptor:before → pipe → exception-filter:400

denied:
middleware → guard:deny → exception-filter:403
```

The chapter distinguishes middleware from interceptors, explains
ExecutionContext, global/controller/route ordering, and shows why an exception
filter is an error path rather than a mandatory final stage. Its recipes lay
out the next pet-project steps: modular monolith boundaries, repository ports,
a transactional outbox, Kafka events, and idempotent consumers.

The primary source is the
[official NestJS documentation](https://docs.nestjs.com/). Direct links to
Providers, Custom providers, Injection scopes, Request lifecycle, Interceptors,
and Kafka are also rendered inside the relevant chapters as crawlable links.

### 13. Microservices: boundaries, messages, and failures

The runtime starts a real Nest microservice over TCP. `ClientProxy.send`
performs request-response, `emit` publishes an event, duplicate `operationId`
returns the existing reservation, and a remote error crosses the transport.
The chapter explains service/data ownership, brokers, delivery semantics,
eventual consistency, outbox, sagas, and when a modular monolith is cheaper.

### 14. SQL from zero: reading and changing rows

The runtime creates a disposable `products` table and demonstrates `CREATE
TABLE`, `INSERT`, `SELECT`, `FROM`, `WHERE`, aliases, `$1` parameters, `NULL`,
`UPDATE`, `GROUP BY`, `HAVING`, `ORDER BY`, `LIMIT`, and `DELETE`. Eight focused
syntax recipes explain each clause before the advanced database material.

### 15. SQL foundations, ACID, and constraints

The runtime creates a disposable schema, applies `PRIMARY KEY`, `UNIQUE`,
`CHECK`, and `FOREIGN KEY`, sends values through pg parameters, catches a
machine-readable constraint error, and proves atomic rollback. The chapter also
covers invariants, data types, NULL, WAL, connection pools, and migration risk.

### 16. PostgreSQL indexes and EXPLAIN

A 40,000-row dataset is measured with
`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` before and after a composite B-tree.
The same run creates Hash, BRIN, and GIN indexes and reports their sizes.
Theory covers selectivity, statistics, cardinality estimates, multicolumn and
partial indexes, Index Only Scan, and why Seq Scan can be correct.

### 17. Transaction isolation and locking

Two real PostgreSQL sessions compare READ COMMITTED and REPEATABLE READ
snapshots. The runtime then makes one `SELECT FOR UPDATE` wait for another and
contrasts it with optimistic `version` locking. Serializable retries,
deadlocks, lock ordering, transaction scope, and timeout discipline are
covered as production requirements.

### 18. JOINs, Materialized Views, and ORM boundaries

The scenario reads a real JOIN plan, compares 21 N+1 round trips with one
set-based query, and demonstrates that a Materialized View remains stale until
`REFRESH`. It explains nested loop, hash, and merge joins, LEFT JOIN semantics,
row multiplication, refresh strategies, and a pragmatic rule: ORM is useful
only while generated SQL, plans, and transaction boundaries remain visible.

All database runs use unique schemas, fixed statement/lock timeouts, and
cleanup in `finally`. The [official PostgreSQL documentation](https://www.postgresql.org/docs/current/)
and focused links for each topic are rendered inside the chapters.

## Learning interface

Every experiment has two levels:

1. The upper laboratory: short theory, live trace, metrics, and controls.
2. The detailed chapter below: plain-language analogy, technical foundation,
   glossary, runtime steps, visible source code, line-by-line notes,
   misconceptions, and self-check questions. Every chapter also contains a
   realistic production case with problematic code, a corrected version, the
   reason for the incident, function-by-function notes, and signals that would
   expose it in monitoring. HTTP production cases use NestJS controllers,
   DTOs, dependency injection, interceptors, and Nest BullMQ integration.

Language and font-size preferences are stored in `localStorage`. You can also
open a language directly:

```text
http://localhost:3000/?lang=en&demo=memory-leak
http://localhost:3000/ru/learn/event-loop-order
```

## Project structure

```text
.
├── Dockerfile                  # multi-stage production image
├── compose.yml                 # app + Redis + disposable PostgreSQL
├── compose.private.yml         # personal unrestricted learning overlay
├── compose.monitoring.yml      # optional Prometheus + Grafana stack
├── deploy.sh                   # checked public deployment for Ubuntu
├── .env.example                # non-secret deployment settings
├── docker/
│   └── host.nginx.example.conf # system Nginx reverse-proxy template
├── monitoring/                 # scrape config and Grafana provisioning
├── .dockerignore               # compact and reproducible build context
├── client/
│   ├── components/             # React UI components
│   ├── App.jsx                 # application state and streaming logic
│   ├── i18n.js                 # RU/EN UI and learning translations
│   └── styles.css              # responsive visual system
├── app/
│   ├── [locale]/learn/[demo]/  # statically rendered SEO chapter pages
│   ├── api/                    # Node.js Route Handlers and streams
│   ├── sitemap.js              # bilingual sitemap
│   └── robots.js               # crawler policy
├── src/
│   ├── demos.js                # instrumented Node.js experiments
│   ├── cpu-worker.js           # CPU-bound Worker Thread
│   ├── nest-lab.js             # real Nest DI and HTTP lifecycle
│   ├── microservices-lab.js    # real Nest TCP messages and events
│   ├── database-lab.js         # real PostgreSQL plans, sessions, and locks
│   ├── memory-lab.js           # isolated-process supervisor and SSE
│   ├── runtime-state.js        # health and Prometheus exposition
│   └── memory-leak-child.js    # controlled retaining process
├── test/
│   └── api.test.js             # node:test integration tests
└── next.config.js              # standalone output and security headers
```

## Streaming protocol

Regular experiments use:

```http
POST /api/demos/:id/run
Content-Type: application/x-ndjson
```

Each event is written as a separate JSON line as soon as the callback runs:

```json
{"sequence":1,"at":0.2,"lane":"system","type":"start","message":"..."}
{"sequence":2,"at":0.8,"lane":"call-stack","type":"sync","message":"..."}
```

The memory lab uses Server-Sent Events:

```http
GET /api/memory/events
Content-Type: text/event-stream
```

## Scripts

```text
npm run dev       Next.js development server, private profile
npm run dev:full  Private development with local Redis and PostgreSQL URLs
npm run build     Production Next.js build
npm start         Next.js server with environment-selected profile
npm run start:private  Built app with the private profile
npm run start:public   Built app with the public profile
npm run docker:build  Build the local Docker image
npm run docker:up     Build and start with Docker Compose
npm run docker:up:private  Docker Compose with the private profile
npm run docker:up:monitoring  App + Redis + PostgreSQL + Prometheus + Grafana
npm run docker:down   Stop and remove the Compose container
npm run docker:down:monitoring  Stop the optional monitoring stack
npm run redis:up      Start only the local Redis service
npm run db:up         Start only the local PostgreSQL service
npm test          Integration tests
npm run test:db       Run all five scenarios against local PostgreSQL
```

## Publishing on GitHub

The repository can be pushed to GitHub normally. Do not commit `node_modules`,
`.next`, `.env`, or local visual-check artifacts; they are already ignored.

GitHub Pages alone cannot run the full laboratory because it needs a persistent
Node.js backend and child processes. Use GitHub for source control and deploy the
full application to a Node-capable platform if you want a public live instance.

## Important mental model

```text
current JavaScript callback
           │
           ▼
process.nextTick queue
           │
           ▼
Promise / queueMicrotask
           │
           ▼
timers → pending → poll → check → close
```

This is an educational simplification, not the complete libuv implementation.
