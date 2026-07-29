const pause = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export const dockerfileExample = `# syntax=docker/dockerfile:1
FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
COPY . .
RUN npm run build

FROM node:24-alpine AS runtime
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --chown=node:node --from=build /app/.next/standalone ./
COPY --chown=node:node --from=build /app/.next/static ./.next/static
USER node
EXPOSE 3000
HEALTHCHECK CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r => { if (!r.ok) process.exit(1) })"
CMD ["node", "server.js"]`;

export const composeExample = `services:
  app:
    build:
      context: .
      target: runtime
    init: true
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      DATABASE_URL: postgresql://app:password@postgres:5432/app
    depends_on:
      postgres:
        condition: service_healthy
    mem_limit: 2g
    pids_limit: 128
    restart: unless-stopped

  postgres:
    image: postgres:18-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 3s
      retries: 12`;

export const kubernetesManifestExample = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-loop-lab
spec:
  replicas: 3
  strategy:
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
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
          image: ghcr.io/example/node-loop-lab:1.0.0
          ports:
            - name: http
              containerPort: 3000
          readinessProbe:
            httpGet:
              path: /api/health
              port: http
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /api/health
              port: http
            periodSeconds: 10
            failureThreshold: 3
          resources:
            requests:
              cpu: 250m
              memory: 256Mi
            limits:
              cpu: "1"
              memory: 1Gi
---
apiVersion: v1
kind: Service
metadata:
  name: node-loop-lab
spec:
  selector:
    app: node-loop-lab
  ports:
    - name: http
      port: 80
      targetPort: http`;

function dockerStages(source) {
  const stages = [];
  for (const line of source.split('\n')) {
    const match = line.match(/^FROM\s+(\S+)(?:\s+AS\s+(\S+))?/i);
    if (match) {
      stages.push({
        image: match[1],
        name: match[2] ?? `stage-${stages.length + 1}`,
      });
    }
  }
  return stages;
}

export async function dockerBuildAndRun(emit) {
  const stages = dockerStages(dockerfileExample);

  emit(
    'build-context',
    'context',
    'Docker client собирает build context; .dockerignore исключает node_modules, .git и секреты',
  );
  await pause(15);

  emit(
    'dockerfile',
    'parse',
    `Dockerfile описывает ${stages.length} стадии: ${stages.map((stage) => stage.name).join(' → ')}`,
  );

  for (const stage of stages) {
    await pause(15);
    emit(
      'buildkit',
      'stage',
      `BuildKit строит stage ${stage.name} из immutable base image ${stage.image}`,
    );
  }

  emit(
    'cache',
    'layer',
    'COPY package*.json расположен до COPY исходников: изменение кода не инвалидирует слой npm ci',
  );
  await pause(15);
  emit(
    'image',
    'artifact',
    'Runtime image получает standalone build, но не исходный build toolchain',
  );
  await pause(15);
  emit(
    'container',
    'process',
    'Container запускает node server.js как USER node; init передаёт сигналы и убирает zombie processes',
  );
  await pause(15);
  emit(
    'network',
    'publish',
    'Port mapping 127.0.0.1:3000:3000 публикует container port только на loopback хоста',
  );
  await pause(15);
  emit(
    'health',
    'probe',
    'Healthcheck проверяет /api/health; healthy не означает, что все внешние зависимости доступны',
  );
  emit(
    'result',
    'summary',
    'Image — неизменяемый шаблон; container — запущенный process с writable layer и runtime configuration',
  );
}

function readyPods(pods) {
  return pods.filter((pod) => pod.ready);
}

export async function kubernetesReconciliation(emit) {
  const desiredReplicas = 3;
  let generation = 1;
  let pods = [
    { name: 'node-loop-lab-old-1', version: '1.0.0', ready: true },
  ];

  emit(
    'api-server',
    'desired-state',
    `Deployment принят: desired replicas=${desiredReplicas}, image=1.0.0`,
  );
  await pause(15);

  while (pods.length < desiredReplicas) {
    const pod = {
      name: `node-loop-lab-old-${pods.length + 1}`,
      version: '1.0.0',
      ready: false,
    };
    pods.push(pod);
    emit(
      'deployment-controller',
      'reconcile',
      `Actual=${pods.length - 1}, desired=${desiredReplicas}: ReplicaSet создаёт ${pod.name}`,
    );
    await pause(15);
    pod.ready = true;
    emit(
      'kubelet',
      'readiness',
      `${pod.name} прошёл readinessProbe и добавлен в endpoints Service`,
    );
  }

  emit(
    'service',
    'routing',
    `Service выбирает по label ${readyPods(pods).length} ready Pods из ${pods.length}`,
  );
  await pause(15);

  pods[1].ready = false;
  emit(
    'readiness',
    'traffic',
    `${pods[1].name} стал NotReady: container продолжает работать, но Service исключил его из трафика`,
  );
  await pause(15);
  pods[1].ready = true;

  generation += 1;
  const newPod = {
    name: `node-loop-lab-new-${generation}`,
    version: '1.1.0',
    ready: false,
  };
  pods.push(newPod);
  emit(
    'rolling-update',
    'surge',
    `maxSurge=1: создан ${newPod.name}, старые ready Pods пока обслуживают трафик`,
  );
  await pause(15);
  newPod.ready = true;
  pods = pods.filter((pod) => pod.name !== 'node-loop-lab-old-1');
  emit(
    'rolling-update',
    'replace',
    'Новый Pod стал Ready; controller удалил один старый Pod без снижения ready replicas',
  );

  emit(
    'scheduler',
    'resources',
    'Scheduler размещает Pod по requests; limits ограничивают runtime, но не резервируют дополнительный ресурс',
  );
  emit(
    'result',
    'summary',
    'Kubernetes непрерывно сравнивает desired и actual state; controller исправляет расхождение, а Service маршрутизирует только Ready Pods',
  );
}
