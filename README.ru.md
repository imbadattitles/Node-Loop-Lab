# Node Loop Lab

[English](README.md) · [Русский](README.ru.md)

Интерактивная fullstack-лаборатория для изучения Event Loop, очередей
callbacks, демультиплексора событий, блокировки main thread, Worker Threads,
пула libuv, утечек памяти, Promises, setImmediate и BullMQ в Node.js.

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

Promise/setImmediate-часть главы 7 работает без Redis. Для настоящего BullMQ
round-trip в локальной разработке:

```bash
npm run redis:up
npm run dev:full
```

В development-режиме:

- Vite запускает React на порту `3000`;
- Express API работает на порту `3001`;
- Vite проксирует `/api` на Express;
- оба процесса управляются одной командой `npm run dev`.

## Production

```bash
npm run build
npm run start:public
```

Express раздаёт собранный `dist/` и API на
[http://localhost:3000](http://localhost:3000).

## Публичный и личный профили

Обе версии работают из одной кодовой базы:

| Профиль | Назначение | Memory lab | Защита API |
| --- | --- | --- | --- |
| `private` | `npm run dev`, личное изучение | 512 MB retained, 768 MB RSS, пауза через 120 секунд | без ограничений |
| `public` | открытый домен | 256 MB retained, 512 MB RSS, завершение child через 60 секунд | rate limit и ограничение параллельных запусков |

Основные команды:

```bash
npm run dev             # private с Vite
npm run start:private   # собранное приложение, private
npm run start:public    # собранное приложение, public
```

Явный `LAB_MODE=public|private` имеет приоритет. Без него `NODE_ENV=production`
выбирает `public`, а обычное окружение разработки — `private`.

Если публичный контейнер стоит ровно за одним доверенным reverse proxy
(например, nginx или Caddy), задайте `TRUST_PROXY=1`: тогда rate limit будет
считать IP посетителя из проксированного запроса. При прямой публикации порта
`3000` оставьте переменную пустой.

## Docker

Docker Compose собирает React и запускает application-контейнер вместе с
изолированным Redis:

```bash
docker compose up --build
```

Compose по умолчанию включает `public`. Личная Docker-версия запускается так:

```bash
npm run docker:up:private
```

Откройте [http://localhost:3000](http://localhost:3000). Для остановки и
удаления контейнера:

```bash
docker compose down
```

Application-контейнер ограничен **2 GB RAM**, Redis — 256 MB при внутреннем
`maxmemory=128mb`. Настроенный потолок всего проекта составляет около 2.25 GB.
Дочерний процесс утечки разделяет лимит приложения. В public дополнительно
действуют пределы 256 MB retained и 512 MB RSS.

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

Без `REDIS_URL` standalone-образ пропускает только BullMQ round-trip; все
Promise/setImmediate-примеры продолжают работать.

Production-образ собирается в несколько этапов, содержит только runtime-
зависимости, работает от непривилегированного пользователя `node` и имеет
health check API. Эксперимент с памятью не запускается сам — его по-прежнему
нужно явно включить в интерфейсе.

## Возможности

- Семь наблюдаемых экспериментов Node.js.
- Потоковые NDJSON-события без WebSocket.
- Метрики Event Loop через `perf_hooks`.
- Изолированная контролируемая утечка памяти.
- Настоящий BullMQ round-trip Queue → Redis → Worker → QueueEvents.
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

Личный профиль сохраняет расширенные учебные пределы:

- один memory-эксперимент одновременно;
- максимум 512 MB retained;
- V8 heap дочернего процесса — 640 MB;
- аварийный RSS-предел — около 768 MB;
- автопауза через две минуты;
- основной Express-процесс не хранит «утёкшие» блоки.

Публичный профиль снижает retained/RSS до 256/512 MB и через одну минуту
завершает дочерний процесс, даже если тот уже остановил рост на выбранном
пределе.

### 7. Promises, setImmediate и BullMQ

Расширенная глава-памятка:

- синхронный executor и однократный settlement;
- правила return в цепочках `then/catch/finally`;
- эквивалентный `async/await` и обработка ошибок;
- `all`, `allSettled`, `race` и `any`;
- timeout и настоящая отмена;
- callback- и Promise-варианты `setImmediate`;
- Queue, Job, Worker, QueueEvents, retries, cleanup и idempotency в BullMQ.

В главе восемь отдельных рецептов кода. При запуске через Compose runtime также
создаёт настоящую временную очередь BullMQ, пишет job в Redis, обрабатывает его
Worker-ом, получает completed через QueueEvents и очищает учебные ключи.

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
npm run dev:full  private-разработка с REDIS_URL для BullMQ
npm run dev:web   только Vite
npm run dev:api   только Express API
npm run build     production-сборка React
npm start         Express с профилем из окружения
npm run start:private  собранное приложение в private
npm run start:public   собранное приложение в public
npm run preview   preview Vite-сборки
npm run docker:build  собрать локальный Docker-образ
npm run docker:up     собрать и запустить через Docker Compose
npm run docker:up:private  Docker Compose в private
npm run docker:down   остановить и удалить Compose-контейнер
npm run redis:up      запустить только локальный Redis
npm test          интеграционные тесты
```

## GitHub

В репозиторий не попадут `node_modules`, `dist`, `.env` и локальные артефакты —
они уже добавлены в `.gitignore`.

GitHub Pages не сможет запустить полную лабораторию: приложению нужен Node.js
backend, Worker Threads и дочерние процессы. GitHub подходит для хранения кода,
а публичную рабочую версию следует размещать на платформе с поддержкой Node.js.
