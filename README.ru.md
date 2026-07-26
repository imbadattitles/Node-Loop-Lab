# Node Loop Lab

[English](README.md) · [Русский](README.ru.md)

Интерактивная fullstack-лаборатория для изучения Event Loop, очередей
callbacks, демультиплексора событий, блокировки main thread, Worker Threads,
пула libuv и утечек памяти в Node.js.

Backend запускает настоящие операции Node и стримит события в React-интерфейс.
Каждый эксперимент сочетает live trace с подробной теорией, кодом, словарём,
популярными заблуждениями и вопросами для самопроверки.

## Быстрый старт

Требуется Node.js 20 или новее.

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

В development-режиме:

- Vite запускает React на порту `3000`;
- Express API работает на порту `3001`;
- Vite проксирует `/api` на Express;
- оба процесса управляются одной командой `npm run dev`.

## Production

```bash
npm run build
npm start
```

Express раздаёт собранный `dist/` и API на
[http://localhost:3000](http://localhost:3000).

## Docker

Docker Compose собирает React и запускает всю лабораторию в одном
production-контейнере:

```bash
docker compose up --build
```

Откройте [http://localhost:3000](http://localhost:3000). Для остановки и
удаления контейнера:

```bash
docker compose down
```

Compose ограничивает **весь контейнер двумя гигабайтами оперативной памяти**.
Дочерний процесс эксперимента с утечкой работает в том же контейнере и разделяет
этот лимит. Более строгие внутренние предохранители приложения — максимум
512 MB retained и аварийная остановка по RSS — продолжают действовать.

Другой порт хоста можно задать в PowerShell:

```powershell
$env:APP_PORT = "8080"
docker compose up --build
```

Запуск образа без Compose:

```bash
docker build -t node-loop-lab:local .
docker run --rm --init --memory=2g -p 3000:3000 node-loop-lab:local
```

Production-образ собирается в несколько этапов, содержит только runtime-
зависимости, работает от непривилегированного пользователя `node` и имеет
health check API. Эксперимент с памятью не запускается сам — его по-прежнему
нужно явно включить в интерфейсе.

## Возможности

- Шесть наблюдаемых экспериментов Node.js.
- Потоковые NDJSON-события без WebSocket.
- Метрики Event Loop через `perf_hooks`.
- Изолированная контролируемая утечка памяти.
- Графики `heapUsed`, `external`, `retained` и RSS.
- Полный русский и английский перевод интерфейса и теории.
- Переключатель RU/EN с сохранением выбора.
- Fluid typography и режим крупного текста `A+`.
- Адаптивная вёрстка.
- React 19, Vite, Express 5.
- Интеграционные тесты API и memory lifecycle.

## Эксперименты

### 1. Порядок Event Loop

Сравнивает sync-код, `process.nextTick`, Promise microtasks,
`queueMicrotask`, `setTimeout`, `setImmediate` и I/O callback.

### 2. Демультиплексор событий

Одновременно запускает таймер, чтение файла и DNS lookup. Показывает
регистрацию источников, освобождение JS-стека и возврат готовых callbacks.

### 3. Очередь callbacks

Пять нулевых таймеров демонстрируют, как один тяжёлый callback задерживает все
остальные готовые задачи.

### 4. Блокировка против Worker

Одинаковая CPU-bound идея сначала выполняется в main thread, затем в Worker
Thread. Heartbeat наглядно показывает отзывчивость Event Loop.

### 5. Пул потоков libuv

Шесть `crypto.pbkdf2`-задач демонстрируют нативный pool и возврат результатов
в основной Event Loop.

### 6. Управляемая утечка памяти

Эксперимент не запускается вместе с сервером. Выделение начинается только
после ручного нажатия.

Режимы:

- `Buffer / external`;
- `Array / V8 heap`;
- смешанная память.

Управление:

- пауза и продолжение;
- освобождение ссылок;
- два явных прохода GC;
- остановка дочернего процесса.

Предохранители значительно ниже 6 GB:

- один memory-эксперимент одновременно;
- максимум 512 MB retained;
- V8 heap дочернего процесса — 640 MB;
- аварийный RSS-предел — около 768 MB;
- автопауза через две минуты;
- основной Express-процесс не хранит «утёкшие» блоки.

## Учебный интерфейс

У каждого сценария два уровня:

1. Верхняя лаборатория: краткая теория, live trace, метрики и controls.
2. Подробная глава: аналогия, техническая основа, словарь, пошаговая механика,
   постоянно видимый код, пояснения, заблуждения и самопроверка.

Язык и размер шрифта сохраняются в `localStorage`. Сценарий и язык можно
открыть напрямую:

```text
http://localhost:3000/?lang=ru&demo=memory-leak
http://localhost:3000/?lang=en&demo=event-loop-order
```

## Структура

```text
.
├── Dockerfile                  # multi-stage production-образ
├── compose.yml                 # health check и общий лимит 2 GB
├── .dockerignore               # компактный контекст сборки
├── client/
│   ├── components/             # React-компоненты
│   ├── App.jsx                 # состояние, NDJSON и SSE
│   ├── i18n.js                 # RU/EN переводы
│   ├── main.jsx                # точка входа React
│   └── styles.css              # адаптивная дизайн-система
├── src/
│   ├── app.js                  # Express API
│   ├── server.js               # запуск HTTP
│   ├── demos.js                # учебные сценарии
│   ├── cpu-worker.js           # CPU Worker
│   ├── memory-lab.js           # supervisor и SSE
│   └── memory-leak-child.js    # контролируемая утечка
├── test/api.test.js
├── index.html
└── vite.config.js
```

## Команды

```text
npm run dev       React + Express для разработки
npm run dev:web   только Vite
npm run dev:api   только Express API
npm run build     production-сборка React
npm start         production Express
npm run preview   preview Vite-сборки
npm run docker:build  собрать локальный Docker-образ
npm run docker:up     собрать и запустить через Docker Compose
npm run docker:down   остановить и удалить Compose-контейнер
npm test          интеграционные тесты
```

## GitHub

В репозиторий не попадут `node_modules`, `dist`, `.env` и локальные артефакты —
они уже добавлены в `.gitignore`.

GitHub Pages не сможет запустить полную лабораторию: приложению нужен Node.js
backend, Worker Threads и дочерние процессы. GitHub подходит для хранения кода,
а публичную рабочую версию следует размещать на платформе с поддержкой Node.js.
