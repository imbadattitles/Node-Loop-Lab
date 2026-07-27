# Node Loop Lab

[English](README.md) · [Русский](README.ru.md)

An interactive full-stack laboratory for learning how Node.js actually behaves:
the Event Loop, callback queues, event demultiplexing, main-thread blocking,
Worker Threads, the libuv thread pool, controlled memory leaks, Promises,
setImmediate, and BullMQ.

The backend runs real Node.js operations and streams timestamped events to a
React interface. Each experiment combines a live trace with a beginner-friendly
theory chapter, runnable code, terminology, common misconceptions, and
self-check questions.

## Features

- Seven real, observable Node.js experiments.
- Streaming NDJSON traces — no WebSocket abstraction hiding the HTTP stream.
- Live Event Loop health metrics from `perf_hooks`.
- Controlled memory-leak process with heap/external/RSS charts.
- Real BullMQ Queue → Redis → Worker → QueueEvents round-trip under Compose.
- Complete Russian and English interface and learning material.
- Persistent RU/EN language switch.
- Fluid, accessible typography with comfortable and large (`A+`) modes.
- Responsive desktop and mobile layout.
- React 19 + Vite frontend and Express 5 backend.
- Automated API and memory-lifecycle tests.

## Quick start

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The Promise/setImmediate part of chapter 7 works without Redis. To run its real
BullMQ section during local development:

```bash
npm run redis:up
npm run dev:full
```

During development:

- Vite serves the React app on port `3000`;
- Express serves the API on port `3001`;
- Vite proxies `/api` requests to Express;
- both processes are started and stopped by the same `npm run dev` command.

## Production build

```bash
npm run build
npm run start:public
```

Express serves the generated `dist/` frontend and API together on
[http://localhost:3000](http://localhost:3000).

## Public and private profiles

The project has two runtime profiles backed by the same codebase:

| Profile | Intended use | Memory lab | API guards |
| --- | --- | --- | --- |
| `private` | `npm run dev`, personal study | 512 MB retained, 768 MB RSS, pause after 120 s | unrestricted |
| `public` | an open domain | 256 MB retained, 512 MB RSS, child exits after 60 s | rate and concurrency limits |

Useful commands:

```bash
npm run dev             # private profile with Vite
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

Docker Compose builds the React application and starts the application plus an
isolated Redis service:

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

The application container is limited to **2 GB of RAM**, and Redis to 256 MB
(128 MB Redis maxmemory), keeping the configured project ceiling around
2.25 GB. The memory-leak child shares the application limit. In the public
profile, lower application thresholds of 256 MB retained data and 512 MB RSS
still apply.

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

Without `REDIS_URL`, this standalone image skips only the BullMQ round-trip and
still runs all Promise/setImmediate examples.

The production image uses a multi-stage build, contains only runtime
dependencies, runs as the non-root `node` user, and includes an API health
check. The memory experiment remains idle until it is explicitly started in the
interface.

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
three allocation modes:

- `Buffer / external`;
- `Array / V8 heap`;
- mixed heap and external memory.

Available controls:

- pause/resume allocations;
- release retained references;
- run two explicit GC passes;
- terminate the isolated child process.

The private profile keeps the extended study limits:

- one memory experiment at a time;
- maximum 512 MB retained data;
- child V8 heap limited to 640 MB;
- emergency child RSS threshold around 768 MB;
- automatic pause after two minutes;
- leaked blocks never live in the main Express process.

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

## Learning interface

Every experiment has two levels:

1. The upper laboratory: short theory, live trace, metrics, and controls.
2. The detailed chapter below: plain-language analogy, technical foundation,
   glossary, runtime steps, visible source code, line-by-line notes,
   misconceptions, and self-check questions.

Language and font-size preferences are stored in `localStorage`. You can also
open a language directly:

```text
http://localhost:3000/?lang=en&demo=memory-leak
http://localhost:3000/?lang=ru&demo=event-loop-order
```

## Project structure

```text
.
├── Dockerfile                  # multi-stage production image
├── compose.yml                 # local container, health check, 2 GB limit
├── .dockerignore               # compact and reproducible build context
├── client/
│   ├── components/             # React UI components
│   ├── App.jsx                 # application state and streaming logic
│   ├── i18n.js                 # RU/EN UI and learning translations
│   ├── main.jsx                # React entry point
│   └── styles.css              # responsive visual system
├── src/
│   ├── app.js                  # Express API and production frontend
│   ├── server.js               # HTTP process entry point
│   ├── demos.js                # instrumented Node.js experiments
│   ├── cpu-worker.js           # CPU-bound Worker Thread
│   ├── memory-lab.js           # isolated-process supervisor and SSE
│   └── memory-leak-child.js    # controlled retaining process
├── test/
│   └── api.test.js             # node:test integration tests
├── index.html                  # Vite entry document
└── vite.config.js              # build and development proxy
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
npm run dev       React + API development servers
npm run dev:full  Private development with REDIS_URL for BullMQ
npm run dev:web   Vite only
npm run dev:api   Express API only
npm run build     Production React build
npm start         Express server with environment-selected profile
npm run start:private  Built app with the private profile
npm run start:public   Built app with the public profile
npm run preview   Preview the Vite build
npm run docker:build  Build the local Docker image
npm run docker:up     Build and start with Docker Compose
npm run docker:up:private  Docker Compose with the private profile
npm run docker:down   Stop and remove the Compose container
npm run redis:up      Start only the local Redis service
npm test          Integration tests
```

## Publishing on GitHub

The repository can be pushed to GitHub normally. Do not commit `node_modules`,
`dist`, `.env`, or local visual-check artifacts; they are already ignored.

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
