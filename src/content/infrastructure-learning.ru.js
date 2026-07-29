const dockerLayers = [
  { title: 'DOCKERFILE', detail: 'instructions · stages', active: true },
  { title: 'IMAGE', detail: 'read-only layers · metadata' },
  { title: 'CONTAINER', detail: 'process · writable layer' },
  { title: 'HOST', detail: 'kernel · cgroups · network' },
];

const kubernetesLayers = [
  { title: 'MANIFEST', detail: 'desired state', active: true },
  { title: 'CONTROL PLANE', detail: 'API · controllers · scheduler' },
  { title: 'NODE', detail: 'kubelet · container runtime' },
  { title: 'TRAFFIC', detail: 'Service · ready Pods' },
];

export const infrastructureLearningRu = {
  'docker-foundations': {
    plain:
      'Docker image похож на запечатанный шаблон квартиры: в нём заранее определены файлы и команда запуска. Container — конкретная квартира, созданная по шаблону и уже используемая жильцом-процессом. Один image можно запускать много раз с разными портами и настройками.',
    foundation:
      'Docker собирает image из слоёв по Dockerfile и запускает из него изолированную группу процессов. Контейнер использует kernel хоста, а namespaces отделяют процессы, сеть и filesystem view; cgroups учитывают и ограничивают ресурсы. Compose описывает несколько связанных containers, networks, volumes и runtime settings.',
    why:
      'Контейнер фиксирует окружение приложения от CI до production, но не делает плохую конфигурацию безопасной автоматически. Для senior-разработчика важно понимать build context, cache, multi-stage images, PID 1, сигналы, persistent data, service DNS, healthchecks и resource limits.',
    resources: [
      {
        label: 'Docker overview',
        href: 'https://docs.docker.com/get-started/docker-overview/',
        description:
          'Официальное введение в client, daemon, images, containers, registries и Docker objects.',
      },
      {
        label: 'Dockerfile reference',
        href: 'https://docs.docker.com/reference/dockerfile/',
        description:
          'Точный синтаксис FROM, COPY, RUN, ARG, ENV, USER, EXPOSE, HEALTHCHECK, CMD и ENTRYPOINT.',
      },
      {
        label: 'Multi-stage builds',
        href: 'https://docs.docker.com/build/building/multi-stage/',
        description:
          'Разделение build tools и минимального production runtime несколькими FROM.',
      },
      {
        label: 'Docker Compose',
        href: 'https://docs.docker.com/compose/',
        description:
          'Официальная документация по services, networks, volumes и запуску multi-container приложения.',
      },
    ],
    runtimeLayers: dockerLayers,
    terms: [
      {
        name: 'Image',
        description:
          'Неизменяемый шаблон из read-only layers и metadata: filesystem, default command, environment и другие настройки.',
      },
      {
        name: 'Container',
        description:
          'Запущенный экземпляр image: один или несколько процессов, writable layer, network namespace и runtime configuration.',
      },
      {
        name: 'Dockerfile',
        description:
          'Текстовый рецепт сборки image. Инструкции создают стадии, filesystem layers и metadata.',
      },
      {
        name: 'Build context',
        description:
          'Набор файлов, доступный builder-у для COPY/ADD. .dockerignore исключает лишнее и чувствительное до отправки context.',
      },
      {
        name: 'Layer',
        description:
          'Переиспользуемое изменение filesystem или metadata image. Cache зависит от инструкции и её inputs.',
      },
      {
        name: 'Registry',
        description:
          'Хранилище версионированных images, откуда их push-ят и pull-ят по repository:tag или digest.',
      },
      {
        name: 'Volume',
        description:
          'Данные с жизненным циклом вне writable layer container; применяются для persistent state.',
      },
      {
        name: 'PID 1',
        description:
          'Первый process внутри container, который должен получать сигналы завершения и reap-ить завершившиеся дочерние processes.',
      },
    ],
    steps: [
      {
        title: 'Подготовьте build context',
        description:
          'Docker client читает выбранную директорию; .dockerignore заранее исключает node_modules, .git, build output и секреты.',
      },
      {
        title: 'Выполните Dockerfile',
        description:
          'Builder разрешает base images и последовательно вычисляет инструкции каждой необходимой stage.',
      },
      {
        title: 'Переиспользуйте cache',
        description:
          'Если инструкция и её inputs не изменились, готовый слой используется повторно. Поэтому manifests dependencies копируют раньше исходников.',
      },
      {
        title: 'Соберите runtime image',
        description:
          'Multi-stage COPY переносит только standalone artifact из build stage, не включая compiler, cache и исходные dev tools.',
      },
      {
        title: 'Создайте container',
        description:
          'Runtime добавляет writable layer, environment, limits, mounts и network namespace поверх immutable image.',
      },
      {
        title: 'Запустите главный process',
        description:
          'CMD/ENTRYPOINT определяют process, USER снижает привилегии, init помогает корректно передавать signals.',
      },
      {
        title: 'Подключите сервисы',
        description:
          'Compose создаёт network и DNS-имена services; приложение обращается к postgres:5432, а не к localhost.',
      },
      {
        title: 'Наблюдайте lifecycle',
        description:
          'Healthcheck, restart policy, logs и graceful shutdown показывают, готов ли process и как он завершается.',
      },
    ],
    nuances: [
      {
        title: 'Image не является виртуальной машиной',
        description:
          'Container не загружает отдельный kernel. Изоляция строится вокруг процессов хоста, поэтому image должен соответствовать OS/architecture platform.',
      },
      {
        title: 'EXPOSE не публикует порт',
        description:
          'EXPOSE документирует container port. Реальную связь host:container создают docker run -p или Compose ports.',
      },
      {
        title: 'localhost всегда локален текущему container',
        description:
          'Из app container localhost не указывает на postgres container. В Compose используют service name postgres.',
      },
      {
        title: 'ENV попадает в runtime metadata',
        description:
          'Build secret нельзя сохранять через ARG/ENV или COPY: он может остаться в history/layers. Секрет передают runtime-механизмом или BuildKit secret mount.',
      },
      {
        title: 'depends_on не является миграцией',
        description:
          'Healthy dependency означает лишь успешный probe. Приложение всё равно должно retry-ить connections, а schema migrations выполняются отдельным контролируемым шагом.',
      },
      {
        title: 'Container filesystem обычно одноразовый',
        description:
          'Writable layer исчезает вместе с container. PostgreSQL state требует volume или внешнюю managed database.',
      },
      {
        title: 'Tag может перемещаться',
        description:
          'latest и даже version tag могут указывать на другой image. Digest идентифицирует конкретное содержимое и делает deployment воспроизводимее.',
      },
    ],
    pitfalls: [
      {
        myth: 'Container содержит отдельную операционную систему.',
        fact: 'В image есть user-space files, но kernel используется от host.',
      },
      {
        myth: 'COPY . . безопасно копирует только нужный код.',
        fact: 'Без .dockerignore в context могут попасть секреты, .git, локальные зависимости и большой мусор.',
      },
      {
        myth: 'Если image собрался, он production-ready.',
        fact: 'Нужны non-root USER, минимальный runtime, graceful shutdown, health signal, limits, logs и обновление base image.',
      },
      {
        myth: 'Данные PostgreSQL можно хранить внутри container.',
        fact: 'Container заменяем; persistent state должен жить в volume или внешнем storage.',
      },
      {
        myth: 'HEALTHCHECK гарантирует доступность всего продукта.',
        fact: 'Probe проверяет только выбранный сигнал и может быть слишком слабым либо, наоборот, зависеть от всего мира.',
      },
    ],
    codeIntro:
      'Упрощённый Dockerfile показывает три стадии. dependencies кэширует npm ci, build создаёт Next standalone output, runtime получает только нужные artifacts и запускает Node без root.',
    codeNotes: [
      'Каждый FROM начинает новую build stage.',
      'COPY lockfiles перед исходниками сохраняет дорогой npm ci cache при изменении application code.',
      'COPY --from=build переносит artifact между stages.',
      'USER node ограничивает последствия захвата process.',
      'EXPOSE — metadata, а не публикация host port.',
      'Exec-форма CMD позволяет Node получать termination signal напрямую.',
    ],
    examples: [
      {
        title: 'Собрать и запустить image',
        goal: 'Создать локальный image и container с опубликованным HTTP port.',
        code: `docker build -t node-loop-lab:local .
docker run --rm --init \\
  -p 127.0.0.1:3000:3000 \\
  --memory=2g --pids-limit=128 \\
  node-loop-lab:local`,
        notes: [
          '-t присваивает локальное repository:tag.',
          '--rm удаляет остановленный container, но не image.',
          '--init добавляет минимальный init как PID 1.',
        ],
      },
      {
        title: 'Порядок COPY для cache',
        goal: 'Не переустанавливать dependencies после каждого изменения src.',
        code: `COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build`,
        notes: [
          'npm ci воспроизводит lockfile и не изменяет его.',
          'Изменение source инвалидирует только последующие layers.',
        ],
      },
      {
        title: 'Multi-stage runtime',
        goal: 'Не переносить build toolchain в production image.',
        code: `FROM node:24-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
COPY --from=build /app/.next/standalone ./
CMD ["node", "server.js"]`,
        notes: [
          'Финальный image начинается с нового FROM.',
          'В runtime попадает выбранный artifact, а не весь build stage.',
        ],
      },
      {
        title: 'Compose service DNS',
        goal: 'Соединить app и PostgreSQL внутри Compose network.',
        code: `services:
  app:
    environment:
      DATABASE_URL: postgresql://app:secret@postgres:5432/app
    depends_on:
      postgres:
        condition: service_healthy

  postgres:
    image: postgres:18-alpine`,
        notes: [
          'postgres — DNS hostname из имени service.',
          'Пароль в реальном deployment не коммитят в compose file.',
        ],
      },
      {
        title: 'Посмотреть состояние',
        goal: 'Отличить image, запущенный container и его logs.',
        code: `docker image ls
docker compose ps
docker compose logs -f node-loop-lab
docker inspect node-loop-lab`,
        notes: [
          'ps показывает runtime status и published ports.',
          'logs -f продолжает читать stdout/stderr.',
          'inspect возвращает низкоуровневую JSON-конфигурацию.',
        ],
      },
      {
        title: 'Graceful shutdown Node',
        goal: 'Перестать принимать трафик и закрыть ресурсы до SIGKILL.',
        code: `process.once('SIGTERM', async () => {
  server.close();
  await databasePool.end();
  process.exitCode = 0;
});`,
        notes: [
          'docker stop сначала отправляет SIGTERM.',
          'Process должен завершить активные requests в пределах grace period.',
        ],
      },
    ],
    questions: [
      'Чем image отличается от container?',
      'Почему изменение src не обязано заново выполнять npm ci?',
      'Почему EXPOSE 3000 не открывает порт на host?',
      'Почему DATABASE_URL использует postgres, а не localhost?',
      'Какие файлы нужно исключить через .dockerignore?',
      'Зачем production stage и USER node?',
      'Что произойдёт с данными writable layer после удаления container?',
    ],
  },

  'kubernetes-foundations': {
    plain:
      'Docker умеет запустить контейнер на одной машине. Kubernetes похож на диспетчера парка машин: вы описываете, что должны работать три экземпляра приложения, а диспетчер постоянно сравнивает желаемое с реальностью, размещает Pods, заменяет упавшие и подключает готовые к общему адресу.',
    foundation:
      'Kubernetes — декларативный orchestrator контейнерных workloads. API server хранит желаемые objects, controllers выполняют reconciliation, scheduler выбирает node, kubelet поддерживает Pod lifecycle, а Service даёт стабильный virtual endpoint для динамического набора Ready Pods.',
    why:
      'Kubernetes нужен не для запуска одного container, а для управления множеством экземпляров и nodes: self-healing, rolling updates, service discovery, configuration, scheduling и resource governance. Цена — отдельная распределённая система, которую нельзя оправдывать одной модой.',
    resources: [
      {
        label: 'Kubernetes concepts',
        href: 'https://kubernetes.io/docs/concepts/overview/',
        description:
          'Официальная карта архитектуры кластера, objects, control plane и declarative management.',
      },
      {
        label: 'Deployments',
        href: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/',
        description:
          'Desired replicas, ReplicaSets, rollout strategy, status и rollback stateless workload.',
      },
      {
        label: 'Services',
        href: 'https://kubernetes.io/docs/concepts/services-networking/service/',
        description:
          'Стабильный endpoint и выбор Pods через labels/selectors.',
      },
      {
        label: 'Liveness, readiness and startup probes',
        href: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/',
        description:
          'Назначение probes, thresholds и последствия неправильной настройки.',
      },
      {
        label: 'Resource management',
        href: 'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/',
        description:
          'CPU/memory requests, limits, scheduling, throttling и OOM behavior.',
      },
    ],
    runtimeLayers: kubernetesLayers,
    terms: [
      {
        name: 'Cluster',
        description:
          'Control plane и набор worker nodes, совместно запускающих и управляющих Kubernetes objects.',
      },
      {
        name: 'Pod',
        description:
          'Минимальная deployable unit Kubernetes: один или несколько тесно связанных containers с общей сетью и volumes.',
      },
      {
        name: 'Deployment',
        description:
          'Controller для stateless Pods, который управляет replicas, ReplicaSets и rolling updates.',
      },
      {
        name: 'Service',
        description:
          'Стабильный network endpoint и DNS name для динамического набора Pods, выбранных selector-ом.',
      },
      {
        name: 'Label / selector',
        description:
          'Label помечает object key/value; selector связывает controller или Service с подходящими objects.',
      },
      {
        name: 'Reconciliation loop',
        description:
          'Controller снова и снова сравнивает desired state со observed state и делает шаги для устранения разницы.',
      },
      {
        name: 'Readiness probe',
        description:
          'Проверка готовности принимать трафик. Failure исключает Pod из Service endpoints, но не обязан перезапускать container.',
      },
      {
        name: 'Liveness probe',
        description:
          'Проверка, способен ли container продолжать работу. Устойчивый failure приводит к restart container.',
      },
      {
        name: 'Resource request / limit',
        description:
          'Request участвует в scheduling и резервировании; limit ограничивает допустимое runtime consumption.',
      },
      {
        name: 'Rolling update',
        description:
          'Постепенная замена старых Pods новыми с контролем maxSurge и maxUnavailable.',
      },
    ],
    steps: [
      {
        title: 'Отправьте manifest',
        description:
          'kubectl передаёт YAML API server-у; schema validation проверяет apiVersion, kind, metadata и spec.',
      },
      {
        title: 'Сохраните desired state',
        description:
          'Control plane сохраняет Deployment и увеличивает generation при изменении его Pod template.',
      },
      {
        title: 'Создайте ReplicaSet',
        description:
          'Deployment controller обнаруживает расхождение и создаёт ReplicaSet для текущей revision.',
      },
      {
        title: 'Запланируйте Pods',
        description:
          'Scheduler выбирает nodes, где выполняются requests, affinity, taints и прочие placement constraints.',
      },
      {
        title: 'Запустите containers',
        description:
          'Kubelet на node просит container runtime pull-нуть image и поддерживает объявленный Pod lifecycle.',
      },
      {
        title: 'Проверьте готовность',
        description:
          'Readiness probe допускает Pod в Service endpoints только после готовности приложения.',
      },
      {
        title: 'Маршрутизируйте трафик',
        description:
          'Service selector находит Ready Pods и даёт клиентам стабильное имя независимо от Pod IP.',
      },
      {
        title: 'Согласуйте изменения',
        description:
          'При новой image controller создаёт новые Pods, ждёт Ready и удаляет старые в рамках rollout strategy.',
      },
    ],
    nuances: [
      {
        title: 'Kubernetes не собирает image',
        description:
          'CI собирает и отправляет image в registry. Kubernetes получает ссылку и запускает это содержимое на nodes.',
      },
      {
        title: 'Pod не является маленькой VM',
        description:
          'Containers внутри Pod делят network namespace: обращаются друг к другу через localhost и имеют один Pod IP.',
      },
      {
        title: 'Replica не равна резервной копии',
        description:
          'Три stateless Pods повышают availability процесса, но не заменяют backup данных или multi-zone database.',
      },
      {
        title: 'Readiness и liveness отвечают на разные вопросы',
        description:
          'NotReady Pod убирают из трафика. Liveness failure вызывает restart. Если liveness зависит от PostgreSQL, outage базы может перезапустить весь fleet.',
      },
      {
        title: 'Requests важны для scheduler',
        description:
          'Без requests scheduler не знает реальную потребность. CPU limit обычно ведёт к throttling, memory limit — к OOM kill при превышении.',
      },
      {
        title: 'Secret не шифруется одним именем',
        description:
          'Kubernetes Secret отделяет данные от Pod spec, но base64 не является encryption. Нужны RBAC, encryption at rest и внешний secret workflow.',
      },
      {
        title: 'Service не публикует приложение в интернет автоматически',
        description:
          'ClusterIP доступен внутри cluster. Внешний HTTP обычно проходит через Ingress/Gateway или Service типа LoadBalancer.',
      },
    ],
    pitfalls: [
      {
        myth: 'Kubernetes заменяет Dockerfile и registry.',
        fact: 'Orchestrator запускает готовые images; build и supply chain остаются отдельной задачей CI.',
      },
      {
        myth: 'Если container Running, приложение готово.',
        fact: 'Process может ещё загружаться или быть неспособным обслуживать запросы; это различает readiness.',
      },
      {
        myth: 'Liveness должна проверять все dependencies.',
        fact: 'Внешний outage не всегда лечится restart-ом приложения и может вызвать cascading failure.',
      },
      {
        myth: 'Можно использовать image: latest.',
        fact: 'Движущийся tag делает rollout и rollback невоспроизводимыми; используют immutable version или digest.',
      },
      {
        myth: 'Три replicas гарантируют high availability.',
        fact: 'Scheduler может разместить их на одном node или в одной зоне без topology constraints.',
      },
      {
        myth: 'kubectl apply сразу обновляет все Pods.',
        fact: 'API изменяет desired state, после чего controllers асинхронно выполняют rollout.',
      },
    ],
    codeIntro:
      'Manifest связывает Deployment и Service одинаковым label. Deployment поддерживает три Pods, ждёт readiness и обновляет их постепенно; Service направляет трафик на named container port только готовых Pods.',
    codeNotes: [
      'apiVersion и kind выбирают schema Kubernetes object.',
      'Deployment selector обязан совпадать с labels Pod template.',
      'replicas — desired count, а не команда немедленно создать три process.',
      'readinessProbe управляет участием Pod в Service traffic.',
      'requests влияют на scheduling; limits ограничивают container.',
      'Service targetPort: http ссылается на named containerPort.',
      'maxUnavailable: 0 и maxSurge: 1 временно разрешают четвёртый Pod ради доступности rollout.',
    ],
    examples: [
      {
        title: 'Применить и проверить rollout',
        goal: 'Создать objects и наблюдать фактическое состояние Deployment.',
        code: `kubectl apply -f node-loop-lab.yml
kubectl rollout status deployment/node-loop-lab
kubectl get pods -l app=node-loop-lab
kubectl describe deployment node-loop-lab`,
        notes: [
          'apply создаёт или declaratively обновляет objects.',
          'rollout status ждёт доступности новой revision.',
          'describe показывает conditions и recent events.',
        ],
      },
      {
        title: 'Deployment skeleton',
        goal: 'Поддерживать три взаимозаменяемых Pods.',
        code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-loop-lab
spec:
  replicas: 3
  selector:
    matchLabels:
      app: node-loop-lab
  template:
    metadata:
      labels:
        app: node-loop-lab
    spec:
      containers:
        - name: app
          image: ghcr.io/example/node-loop-lab:1.0.0`,
        notes: [
          'Pod template change создаёт новую Deployment revision.',
          'Image tag должен указывать на опубликованный registry artifact.',
        ],
      },
      {
        title: 'Service selector',
        goal: 'Дать Pods стабильное DNS-имя и virtual IP.',
        code: `apiVersion: v1
kind: Service
metadata:
  name: node-loop-lab
spec:
  selector:
    app: node-loop-lab
  ports:
    - port: 80
      targetPort: http`,
        notes: [
          'Selector должен совпасть с Pod label.',
          'Service не зависит от меняющихся Pod IP.',
        ],
      },
      {
        title: 'Три разных probes',
        goal: 'Разделить медленный запуск, готовность к трафику и зависание.',
        code: `startupProbe:
  httpGet: { path: /api/health, port: http }
  failureThreshold: 30
  periodSeconds: 2
readinessProbe:
  httpGet: { path: /api/health, port: http }
  periodSeconds: 5
livenessProbe:
  httpGet: { path: /api/health, port: http }
  periodSeconds: 10
  failureThreshold: 3`,
        notes: [
          'Startup probe задерживает liveness/readiness до старта.',
          'Readiness failure прекращает новый traffic.',
          'Liveness failure после threshold вызывает restart.',
        ],
      },
      {
        title: 'Requests и limits',
        goal: 'Дать scheduler сигнал и поставить runtime boundary.',
        code: `resources:
  requests:
    cpu: 250m
    memory: 256Mi
  limits:
    cpu: "1"
    memory: 1Gi`,
        notes: [
          '250m означает четверть CPU core как request.',
          'Mi/Gi — binary units памяти.',
          'Значения выбирают по измерениям, не копируют вслепую.',
        ],
      },
      {
        title: 'Обновление и rollback',
        goal: 'Перейти на immutable version и вернуться при инциденте.',
        code: `kubectl set image deployment/node-loop-lab \\
  app=ghcr.io/example/node-loop-lab:1.1.0

kubectl rollout status deployment/node-loop-lab
kubectl rollout undo deployment/node-loop-lab`,
        notes: [
          'set image меняет desired Pod template.',
          'Rollback возвращает предыдущую Deployment revision, но не откатывает database migration.',
        ],
      },
      {
        title: 'Диагностика Pod',
        goal: 'Различить application logs, object status и node events.',
        code: `kubectl get pod <pod> -o wide
kubectl logs <pod> -c app --previous
kubectl describe pod <pod>
kubectl get events --sort-by=.metadata.creationTimestamp`,
        notes: [
          '--previous читает logs предыдущего container после restart.',
          'describe показывает probe failures, scheduling и image pull events.',
        ],
      },
    ],
    questions: [
      'Чем Pod, Deployment и Service отличаются друг от друга?',
      'Кто сравнивает desired replicas с actual replicas?',
      'Почему Service selector должен совпасть с Pod labels?',
      'Что случится при readiness failure и при liveness failure?',
      'Чем resource request отличается от limit?',
      'Почему latest мешает воспроизводимому rollback?',
      'Почему три Pods не заменяют backup PostgreSQL?',
      'Что реально делает kubectl apply?',
    ],
  },
};
