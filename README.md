# Node Loop Lab

[English](README.md) · [Русский](README.ru.md)

An interactive full-stack laboratory for learning how Node.js actually behaves:
the Event Loop, callback queues, event demultiplexing, main-thread blocking,
Worker Threads, the libuv thread pool, and controlled memory leaks.

The backend runs real Node.js operations and streams timestamped events to a
React interface. Each experiment combines a live trace with a beginner-friendly
theory chapter, runnable code, terminology, common misconceptions, and
self-check questions.

## Features

- Six real, observable Node.js experiments.
- Streaming NDJSON traces — no WebSocket abstraction hiding the HTTP stream.
- Live Event Loop health metrics from `perf_hooks`.
- Controlled memory-leak process with heap/external/RSS charts.
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

During development:

- Vite serves the React app on port `3000`;
- Express serves the API on port `3001`;
- Vite proxies `/api` requests to Express;
- both processes are started and stopped by the same `npm run dev` command.

## Production build

```bash
npm run build
npm start
```

Express serves the generated `dist/` frontend and API together on
[http://localhost:3000](http://localhost:3000).

## Docker

Docker Compose builds the React application and starts the complete laboratory
in one production container:

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). Stop and remove the
container with:

```bash
docker compose down
```

The Compose configuration limits the **whole container to 2 GB of RAM**. The
isolated memory-leak child process runs in the same container and therefore
shares that limit. The application's lower safety thresholds (512 MB retained
data and an emergency RSS stop) still apply.

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

Safety limits are deliberately far below 6 GB:

- one memory experiment at a time;
- maximum 512 MB retained data;
- child V8 heap limited to 640 MB;
- emergency child RSS threshold around 768 MB;
- automatic pause after two minutes;
- leaked blocks never live in the main Express process.

These are application safeguards rather than an operating-system quota.

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
npm run dev:web   Vite only
npm run dev:api   Express API only
npm run build     Production React build
npm start         Production Express server
npm run preview   Preview the Vite build
npm run docker:build  Build the local Docker image
npm run docker:up     Build and start with Docker Compose
npm run docker:down   Stop and remove the Compose container
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
