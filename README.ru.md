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

В development-режиме один процесс Next.js отдаёт App Router и серверные Route
Handlers на порту `3000`. Учебные страницы рендерятся на сервере, а поверх них
гидратируется интерактивный React-интерфейс.

## Production

```bash
npm run build
npm run start:public
```

Перед production-сборкой укажите публичный origin: в PowerShell —
`$env:SITE_URL = "https://ваш-домен.ru"`. Он попадёт в canonical, hreflang,
Open Graph и sitemap. Next.js отдаёт страницы и Route Handlers на порту `3000`.

## Публичный и личный профили

Обе версии работают из одной кодовой базы:

| Профиль | Назначение | Memory lab | Защита API |
| --- | --- | --- | --- |
| `private` | `npm run dev`, личное изучение | 512 MB retained, 768 MB RSS, пауза через 120 секунд | без ограничений |
| `public` | открытый домен | 256 MB retained, 512 MB RSS, завершение child через 60 секунд | rate limit и ограничение параллельных запусков |

Основные команды:

```bash
npm run dev             # private с Next.js
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

Docker Compose собирает standalone-версию Next.js и запускает
application-контейнер вместе с
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

## Деплой на Ubuntu-сервер

В проект добавлена схема из референсной папки, адаптированная под архитектуру
Node Loop Lab:

```text
Интернет
   ↓
системный Nginx на Ubuntu
   ↓ 127.0.0.1:8080
Node Loop Lab (Next.js) ──→ Redis
```

Порты приложения и Redis по умолчанию привязаны к loopback. В интернет смотрит
только системный Nginx. Основной `compose.yml` всегда запускает ограниченный
профиль `public`.

При первом деплое:

```bash
cp .env.example .env
nano .env
bash deploy.sh
```

`deploy.sh` проверяет Docker и Compose, безопасную привязку порта и настройку
proxy, загружает образ Redis, пересобирает приложение, дожидается обоих
healthcheck, проверяет `/api/health` и отдельно подтверждает режим `public`.
`git pull` скрипт намеренно не выполняет.

Системный Nginx настраивается один раз:

```bash
sudo cp docker/host.nginx.example.conf \
  /etc/nginx/sites-available/node-loop-lab
sudo nano /etc/nginx/sites-available/node-loop-lab
sudo ln -s /etc/nginx/sites-available/node-loop-lab \
  /etc/nginx/sites-enabled/node-loop-lab
sudo nginx -t
sudo systemctl reload nginx
```

В конфигурации замените `lab.example.com` на домен. Если `APP_PORT` отличается
от `8080`, измените также `proxy_pass`. Для `/api/` в шаблоне отключена
буферизация — иначе NDJSON и SSE-события могут приходить в интерфейс не сразу.
После настройки DNS добавьте HTTPS привычным способом через Nginx/Certbot.

После следующих проверенных обновлений:

```bash
git pull
bash deploy.sh
```

Диагностика:

```bash
curl http://127.0.0.1:8080/api/health
docker compose ps
docker compose logs --tail=100 node-loop-lab redis
```

Личный профиль `private` нельзя оставлять открытым для всех. Для второго,
защищённого экземпляра скопируйте `.env.example` в `.env.private`, укажите
`APP_PORT=8081` и `REDIS_PORT=6380`, затем запустите:

```bash
docker compose --env-file .env.private \
  -p node-loop-lab-private \
  -f compose.yml \
  -f compose.private.yml \
  up --detach --build --wait
```

Закройте его авторизацией, VPN либо SSH-туннелем.

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
- React 19 и Next.js 16 App Router.
- Индексируемые RU/EN URL, canonical, hreflang, JSON-LD, Open Graph,
  robots.txt и sitemap.xml.
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
- основной процесс Next.js не хранит «утёкшие» блоки.

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
http://localhost:3000/en/learn/event-loop-order
```

## Структура

```text
.
├── Dockerfile                  # multi-stage production-образ
├── compose.yml                 # health check и общий лимит 2 GB
├── compose.private.yml         # overlay личного учебного профиля
├── deploy.sh                   # проверяемый public-деплой на Ubuntu
├── .env.example                # несекретные настройки деплоя
├── docker/
│   └── host.nginx.example.conf # шаблон системного reverse proxy
├── .dockerignore               # компактный контекст сборки
├── client/
│   ├── components/             # React-компоненты
│   ├── App.jsx                 # состояние, NDJSON и SSE
│   ├── i18n.js                 # RU/EN переводы
│   └── styles.css              # адаптивная дизайн-система
├── app/
│   ├── [locale]/learn/[demo]/  # статические SEO-страницы глав
│   ├── api/                    # Node.js Route Handlers и потоки
│   ├── sitemap.js              # двуязычная карта сайта
│   └── robots.js               # правила для поисковых роботов
├── src/
│   ├── demos.js                # учебные сценарии
│   ├── cpu-worker.js           # CPU Worker
│   ├── memory-lab.js           # supervisor и SSE
│   └── memory-leak-child.js    # контролируемая утечка
├── test/api.test.js
└── next.config.js              # standalone и security headers
```

## Команды

```text
npm run dev       Next.js для разработки, профиль private
npm run dev:full  private-разработка с REDIS_URL для BullMQ
npm run build     production-сборка Next.js
npm start         Next.js с профилем из окружения
npm run start:private  собранное приложение в private
npm run start:public   собранное приложение в public
npm run docker:build  собрать локальный Docker-образ
npm run docker:up     собрать и запустить через Docker Compose
npm run docker:up:private  Docker Compose в private
npm run docker:down   остановить и удалить Compose-контейнер
npm run redis:up      запустить только локальный Redis
npm test          интеграционные тесты
```

## GitHub

В репозиторий не попадут `node_modules`, `.next`, `.env` и локальные артефакты —
они уже добавлены в `.gitignore`.

GitHub Pages не сможет запустить полную лабораторию: приложению нужен Node.js
backend, Worker Threads и дочерние процессы. GitHub подходит для хранения кода,
а публичную рабочую версию следует размещать на платформе с поддержкой Node.js.
