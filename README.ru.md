# Runtime Lab

[English](README.md) · [Русский](README.ru.md)

Интерактивная fullstack-лаборатория для изучения Event Loop, очередей
callbacks, демультиплексора событий, блокировки main thread, Worker Threads,
пула libuv, утечек памяти, heap snapshots, Prometheus/Grafana, Promises,
setImmediate, BullMQ, архитектуры NestJS и PostgreSQL. Отдельные главы сравнивают
concurrency-модель Node с современными моделями Java, Go и Python, запускают
настоящий Nest IoC container и проводят HTTP-запросы через полный request
lifecycle. Отдельная глава поднимает настоящий Nest TCP microservice и разбирает
границы сервисов, commands, events, idempotency и распределённые отказы. Пять
глав о БД начинаются с синтаксиса SQL, а затем переходят к ACID, indexes,
изоляции, JOIN, Materialized Views и границам ORM.
Две следующие главы связывают Docker images и Compose с Kubernetes Pods,
Services, probes, resources, reconciliation и rolling updates.
Отдельная глава объединяет Node memory cache, Nest CacheModule, Redis,
HTTP/CDN, invalidation, ограниченный lifetime и защиту от cache stampede.
Три главы Python дают базовый синтаксис для JavaScript-разработчика, разбирают
объектную модель и протоколы, а затем показывают устройство CPython, память,
GIL, процессы и asyncio на настоящем runtime-сценарии.

Backend запускает настоящие операции Node и стримит события в React-интерфейс.
Каждый эксперимент сочетает live trace с подробной теорией, кодом, словарём,
популярными заблуждениями и вопросами для самопроверки.

## Быстрый старт

Требуется Node.js 20 или новее. Python 3.11+ нужен только для локального запуска
CPython trace; в Docker image он устанавливается автоматически.

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

Promise/setImmediate-часть главы 7 работает без Redis, а теорию БД можно читать
без PostgreSQL. Для настоящих BullMQ и PostgreSQL runtime-сценариев:

```bash
npm run redis:up
npm run db:up
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
application-контейнер вместе с изолированными Redis и PostgreSQL:

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
`maxmemory=128mb`, PostgreSQL — 768 MB. Учебные данные PostgreSQL находятся на
tmpfs 512 MB, а каждый запуск удаляет уникальную схему. Обычный потолок — около
3 GB, с Prometheus и Grafana — около 4 GB, то есть ниже общего лимита 6 GB.
Дочерний процесс утечки разделяет лимит приложения.
Next.js подключается через непривилегированную роль `node_loop_lab_app`;
отдельная init-роль администратора в `DATABASE_URL` не попадает.

### Опциональные Prometheus и Grafana

Monitoring не стартует вместе с обычным `npm run dev` или `docker compose up`.
Для отдельного учебного стека:

```bash
npm run docker:up:monitoring
```

- приложение: [http://localhost:3000](http://localhost:3000);
- Prometheus: [http://localhost:9090](http://localhost:9090);
- Grafana: [http://localhost:3001](http://localhost:3001);
- метрики напрямую:
  [http://localhost:3000/api/metrics](http://localhost:3000/api/metrics).

Datasource и dashboard `Runtime Lab · Runtime & Memory` создаются
автоматически. Логин и пароль Grafana задаются через
`GRAFANA_ADMIN_USER/GRAFANA_ADMIN_PASSWORD` в `.env`. Все три UI-порта
по умолчанию привязаны к `127.0.0.1`. Application, Redis, PostgreSQL,
Prometheus и Grafana имеют суммарный потолок около **4 GB**, то есть ниже
ограничения проекта в 6 GB.

Остановка monitoring-стека:

```bash
npm run docker:down:monitoring
```

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

Без `REDIS_URL` и `DATABASE_URL` standalone-образ пропускает BullMQ round-trip
и PostgreSQL runtime-трассы; вся теория остаётся доступной.

Production-образ собирается в несколько этапов, содержит только runtime-
зависимости, работает от непривилегированного пользователя `node` и имеет
health check API. Эксперимент с памятью не запускается сам — его по-прежнему
нужно явно включить в интерфейсе.

## Деплой на Ubuntu-сервер

В проект добавлена схема из референсной папки, адаптированная под архитектуру
Runtime Lab:

```text
Интернет
   ↓
системный Nginx на Ubuntu
   ↓ 127.0.0.1:8080
Runtime Lab (Next.js) ──→ Redis
                        └─→ PostgreSQL (временные схемы)
```

Порты приложения, Redis и PostgreSQL по умолчанию привязаны к loopback. В
интернет смотрит только системный Nginx. Основной `compose.yml` всегда запускает
ограниченный профиль `public`.

При первом деплое:

```bash
cp .env.example .env
nano .env
bash deploy.sh
```

`deploy.sh` проверяет Docker и Compose, безопасную привязку порта и настройку
proxy, загружает образы сервисов, пересобирает приложение, дожидается всех
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

- Шестнадцать наблюдаемых экспериментов Node.js, NestJS и PostgreSQL.
- Сворачиваемая навигация по тематическим разделам вместо плоского списка.
- Потоковые NDJSON-события без WebSocket.
- Метрики Event Loop через `perf_hooks`.
- Изолированные утечки через Buffer, heap, closure и глобальный Map cache.
- Безопасно ограниченный `.heapsnapshot` для Chrome DevTools.
- Prometheus endpoint и готовый Grafana dashboard.
- Настоящий BullMQ round-trip Queue → Redis → Worker → QueueEvents.
- Настоящие PostgreSQL plans, sessions, row locks и временные учебные схемы.
- Графики `heapUsed`, `external`, `retained` и RSS.
- Полный русский и английский перевод интерфейса и теории.
- Переключатель RU/EN с сохранением выбора.
- Fluid typography и режим крупного текста `A+`.
- Адаптивная вёрстка.
- React 19 и Next.js 16 App Router.
- Индексируемые RU/EN URL, canonical, hreflang, JSON-LD, Open Graph,
  robots.txt и sitemap.xml.
- Интеграционные тесты API и memory lifecycle.

## Навигация по большой программе

Левый каталог теперь разделён на независимые сворачиваемые блоки:

- Node.js Runtime;
- Асинхронность и jobs;
- Память и production;
- NestJS;
- Микросервисы;
- Базы данных;
- Контейнеры и оркестрация;
- Кэширование.

При прямом переходе на индексируемый URL нужный раздел раскрывается
автоматически. На мобильном экране разделы становятся горизонтальными
карточками. PostgreSQL находится в собственной учебной категории и не смешан
с Event Loop или Nest lifecycle.

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
- смешанная память;
- замыкание, удерживающее payload через lexical environment;
- глобальный `Map` без TTL и верхнего ограничения.

Управление:

- пауза и продолжение;
- освобождение ссылок;
- два явных прохода GC;
- создание и скачивание `.heapsnapshot`;
- остановка дочернего процесса.

Snapshot создаётся внутри дочернего V8 isolate, поэтому в нём видны именно
объекты утечки. Выделение автоматически ставится на паузу. Из-за синхронной
сериализации и возможного расхода около `2× heap` snapshot разрешён до
128 MB retained в private и до 64 MB в public. Файл открывается через
Chrome DevTools → Memory → Load. Child получает отдельное минимальное окружение
без Redis URL и серверных секретов; в public скачивание также ограничено rate
limit.

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

### 8. Node.js против Java, Go и Python

Разделяет concurrency и parallelism, I/O-bound и CPU-bound работу, показывает
сильную сторону неблокирующего ожидания Node и границу одного V8 isolate.
Сравнение учитывает Java platform/virtual threads и NIO, scheduler goroutines
в Go, а также asyncio, GIL и опциональные free-threaded сборки CPython.

### 9. Closures, GC и heap snapshots

Практический диагностический workflow: baseline snapshot, воспроизводимая
нагрузка, comparison, shallow/retained size, dominators и retaining path.
Интерфейс действительно создаёт утечку через closure или глобальный cache,
а затем позволяет разорвать root-ссылки и сравнить состояние после GC.

### 10. Prometheus и Grafana

Приложение публикует process memory, Event Loop delay/ELU, demo counters и
память child в Prometheus text format. Optional Compose добавляет Prometheus
со scrape каждые пять секунд и provisioned Grafana dashboard. Глава также
разбирает gauge/counter, `rate`, label cardinality, alerts и production-runbook.

### 11. Dependency Injection и IoC в NestJS

Сценарий запускает настоящий `NestFactory.createApplicationContext()` и
показывает:

- application graph, modules, providers, imports и exports;
- class/string/Symbol injection tokens;
- `useValue`, `useFactory` и `useExisting`;
- DEFAULT и REQUEST scopes через настоящий `ContextId`;
- цену request-scoped dependency chain;
- ports/adapters и override provider в тестах;
- circular dependencies и границы применения `forwardRef`.

### 12. Жизненный цикл запроса NestJS

Runtime поднимает временный Nest HTTP server на loopback-порту и делает три
реальных запроса:

```text
success:
middleware → guard → interceptor:before → pipe
→ controller → service → interceptor:after

invalid parameter:
middleware → guard → interceptor:before → pipe → exception-filter:400

denied:
middleware → guard:deny → exception-filter:403
```

Глава отдельно разбирает middleware против interceptor, ExecutionContext,
global/controller/route ordering, exception path и отличие Filter от обычного
последнего этапа цепочки. В практических рецептах подготовлена архитектура
будущего pet-проекта: modular monolith, feature modules, repository ports,
transactional outbox, Kafka events и idempotent consumers.

Основной источник — [официальная документация NestJS](https://docs.nestjs.com/).
Ссылки на Providers, Custom providers, Injection scopes, Request lifecycle,
Interceptors и Kafka также находятся прямо внутри соответствующих глав и
рендерятся как обычные индексируемые ссылки.

### 13. Микросервисы: границы, сообщения и отказы

Runtime запускает настоящий Nest microservice через TCP. `ClientProxy.send`
показывает request-response, `emit` публикует event, повторный `operationId`
возвращает прежний reservation, а remote error пересекает transport. Глава
объясняет service/data ownership, brokers, delivery semantics, eventual
consistency, outbox, sagas и случаи, когда modular monolith разумнее.

### 14. SQL с нуля: чтение и изменение строк

Runtime создаёт временную `products` table и показывает `CREATE TABLE`, `INSERT`,
`SELECT`, `FROM`, `WHERE`, aliases, параметры `$1`, `NULL`, `UPDATE`, `GROUP BY`,
`HAVING`, `ORDER BY`, `LIMIT` и `DELETE`. Восемь отдельных recipes объясняют
синтаксис до перехода к сложным темам БД.

### 15. SQL, ACID и ограничения данных

Runtime создаёт временную схему, применяет `PRIMARY KEY`, `UNIQUE`, `CHECK` и
`FOREIGN KEY`, отправляет значения через параметры pg, ловит машинный код
constraint error и доказывает атомарность через ROLLBACK. В теории также
разобраны invariants, типы, NULL, WAL, connection pool и риски миграций.

### 16. Индексы PostgreSQL и EXPLAIN

Набор из 40 000 строк измеряется через
`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` до и после составного B-tree. В том же
запуске создаются Hash, BRIN и GIN, после чего runtime выводит их размеры.
Разобраны selectivity, statistics, cardinality estimates, multicolumn/partial
indexes, Index Only Scan и ситуации, где Seq Scan является правильным планом.

### 17. Транзакции, изоляция и блокировки

Две настоящие PostgreSQL sessions сравнивают snapshots READ COMMITTED и
REPEATABLE READ. Затем один `SELECT FOR UPDATE` реально ждёт другой, а
пессимистичный подход сравнивается с optimistic `version`. Глава включает
Serializable retry, deadlocks, единый порядок locks, transaction scope и
обязательные timeouts.

### 18. JOIN, Materialized Views и границы ORM

Сценарий читает настоящий JOIN plan, сравнивает 21 N+1 round trip с одним
set-based запросом и показывает, что Materialized View остаётся устаревшим до
`REFRESH`. Теория охватывает nested loop, hash/merge join, семантику LEFT JOIN,
размножение строк и refresh strategies. Отношение к ORM намеренно прагматичное:
инструмент полезен, пока generated SQL, plans и transaction boundaries видимы.

### 19. Docker: images, containers и Compose

Глава начинается с различия image/container и проводит build context через
Dockerfile stages, layer cache, multi-stage runtime image, PID 1, signals,
публикацию port, Compose DNS, volumes, healthchecks и cgroup limits. Безопасный
live trace анализирует production-модель, не выдавая веб-приложению доступ к
Docker daemon хоста.

### 20. Kubernetes: Pods, Services и reconciliation

Runtime моделирует reconciliation: Deployment масштабируется от одного
observed Pod до трёх desired replicas, readiness управляет Service endpoints,
а `maxSurge` начинает rolling update. Глава объясняет API server, controllers,
scheduler, kubelet, labels/selectors, probes, resource requests/limits,
immutable images, диагностику и границы rollback.

### 21. Кэширование в Node.js, NestJS, Redis и HTTP

Настоящий Nest application context получает `CACHE_MANAGER` из `CacheModule`.
Runtime сравнивает повторные repository reads без cache с cache-aside, ждёт
TTL expiry, объединяет пять concurrent misses в один loader и инвалидирует key
после update primary. Девять recipes охватывают local Node cache, ручной Nest
cache и CacheInterceptor, Redis, quota внешнего API, HTTP/CDN headers и
observability. Два production-кейса показывают исчерпание database pool и
rate limit внешнего provider-а при отсутствии cache.

Все DB-сценарии используют уникальные схемы, ограниченные statement/lock
timeouts и cleanup в `finally`. [Официальная документация PostgreSQL](https://www.postgresql.org/docs/current/)
и отдельные ссылки по каждой теме находятся прямо в интерфейсе.

## Учебный интерфейс

У каждого сценария два уровня:

1. Верхняя лаборатория: краткая теория, live trace, метрики и controls.
2. Подробная глава: аналогия, техническая основа, словарь, пошаговая механика,
   постоянно видимый код, пояснения, заблуждения и самопроверка. В каждой главе
   также есть реалистичный production-кейс: проблемный код, исправленная версия,
   причина инцидента, расшифровка используемых функций и сигналы, по которым его
   можно заметить в мониторинге. HTTP-примеры используют контроллеры, DTO, DI,
   interceptors и BullMQ-интеграцию NestJS.

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
├── compose.yml                 # приложение + Redis + временный PostgreSQL
├── compose.private.yml         # overlay личного учебного профиля
├── compose.monitoring.yml      # optional Prometheus + Grafana
├── deploy.sh                   # проверяемый public-деплой на Ubuntu
├── .env.example                # несекретные настройки деплоя
├── docker/
│   └── host.nginx.example.conf # шаблон системного reverse proxy
├── monitoring/                 # scrape config и Grafana provisioning
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
│   ├── nest-lab.js             # настоящий Nest DI и HTTP lifecycle
│   ├── microservices-lab.js    # настоящие Nest TCP-команды и события
│   ├── database-lab.js         # PostgreSQL plans, sessions и row locks
│   ├── infrastructure-lab.js   # Docker-анализ и Kubernetes reconciliation
│   ├── cache-lab.js            # настоящий Nest CacheModule, TTL и single-flight
│   ├── memory-lab.js           # supervisor и SSE
│   ├── runtime-state.js        # health и Prometheus exposition
│   └── memory-leak-child.js    # контролируемая утечка
├── test/api.test.js
└── next.config.js              # standalone и security headers
```

## Команды

```text
npm run dev       Next.js для разработки, профиль private
npm run dev:full  private-разработка с локальными Redis и PostgreSQL
npm run build     production-сборка Next.js
npm start         Next.js с профилем из окружения
npm run start:private  собранное приложение в private
npm run start:public   собранное приложение в public
npm run docker:build  собрать локальный Docker-образ
npm run docker:up     собрать и запустить через Docker Compose
npm run docker:up:private  Docker Compose в private
npm run docker:up:monitoring  приложение + Redis + PostgreSQL + Prometheus + Grafana
npm run docker:down   остановить и удалить Compose-контейнер
npm run docker:down:monitoring  остановить optional monitoring-стек
npm run redis:up      запустить только локальный Redis
npm run db:up         запустить только локальный PostgreSQL
npm test          интеграционные тесты
npm run test:db       прогнать пять сценариев на локальном PostgreSQL
```

## GitHub

В репозиторий не попадут `node_modules`, `.next`, `.env` и локальные артефакты —
они уже добавлены в `.gitignore`.

GitHub Pages не сможет запустить полную лабораторию: приложению нужен Node.js
backend, Worker Threads и дочерние процессы. GitHub подходит для хранения кода,
а публичную рабочую версию следует размещать на платформе с поддержкой Node.js.
