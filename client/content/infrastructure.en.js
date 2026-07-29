export const infrastructureEnglish = {
  'docker-foundations': {
    title: 'Docker: images, containers, and Compose',
    eyebrow: 'Build → image → process',
    summary:
      'Learn how a Dockerfile becomes layered image content and how Compose runs connected, bounded containers.',
    theory:
      'Docker builds an image from layered Dockerfile instructions and starts an isolated process group from that image. Containers share the host kernel: namespaces isolate process, filesystem, and network views, while cgroups account for and limit resources. Compose declares connected services, networks, volumes, and runtime settings.',
    watchFor:
      'The safe runtime analyzes a production-style multi-stage build. It distinguishes build context, cache, image, container, port publication, PID 1, and health without controlling the host Docker daemon.',
    expected: [
      'A Dockerfile produces an immutable image template.',
      'A container is a running process based on that image.',
      'Multi-stage COPY keeps build tooling out of the runtime image.',
      'Docker cache depends on instruction inputs and their order.',
      'EXPOSE documents a port while ports or -p publishes it.',
      'Compose service names provide DNS inside the project network.',
      'A healthcheck is only as meaningful as the signal it tests.',
    ],
    code: `FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
COPY --from=build /app/.next/standalone ./
USER node
EXPOSE 3000
CMD ["node", "server.js"]`,
    learning: {
      plain:
        'A Docker image resembles a sealed apartment blueprint: files and a startup command are defined in advance. A container is one occupied apartment created from that blueprint. The same image can run many times with different ports and configuration.',
      foundation:
        'Docker builds an image from Dockerfile layers and starts an isolated process group from it. The container uses the host kernel; namespaces isolate process, network, and filesystem views while cgroups account for and limit resources. Compose describes multiple related containers, networks, volumes, and runtime settings.',
      why:
        'A container makes the application environment repeatable from CI to production, but it does not automatically make poor configuration safe. Senior engineers need to understand build context, cache, multi-stage images, PID 1, signals, persistent data, service DNS, healthchecks, and resource limits.',
      resources: [
        {
          label: 'Docker overview',
          href: 'https://docs.docker.com/get-started/docker-overview/',
          description:
            'Official introduction to the client, daemon, images, containers, registries, and Docker objects.',
        },
        {
          label: 'Dockerfile reference',
          href: 'https://docs.docker.com/reference/dockerfile/',
          description:
            'Exact FROM, COPY, RUN, ARG, ENV, USER, EXPOSE, HEALTHCHECK, CMD, and ENTRYPOINT syntax.',
        },
        {
          label: 'Multi-stage builds',
          href: 'https://docs.docker.com/build/building/multi-stage/',
          description:
            'Separate build tooling from a lean production runtime with multiple FROM instructions.',
        },
        {
          label: 'Docker Compose',
          href: 'https://docs.docker.com/compose/',
          description:
            'Official services, networks, volumes, and multi-container application documentation.',
        },
      ],
      runtimeLayers: [
        { title: 'DOCKERFILE', detail: 'instructions · stages', active: true },
        { title: 'IMAGE', detail: 'read-only layers · metadata' },
        { title: 'CONTAINER', detail: 'process · writable layer' },
        { title: 'HOST', detail: 'kernel · cgroups · network' },
      ],
      terms: [
        ['Image', 'An immutable template made of read-only layers and metadata such as its filesystem, default command, and environment.'],
        ['Container', 'A running image instance with processes, a writable layer, a network namespace, and runtime configuration.'],
        ['Dockerfile', 'A text recipe whose instructions define build stages, filesystem layers, and image metadata.'],
        ['Build context', 'The files available to COPY or ADD; .dockerignore excludes unnecessary or sensitive files before context transfer.'],
        ['Layer', 'A reusable filesystem or metadata change whose build cache depends on the instruction and its inputs.'],
        ['Registry', 'Storage from which versioned images are pushed and pulled by repository, tag, or digest.'],
        ['Volume', 'Data with a lifecycle outside a container writable layer, used for persistent state.'],
        ['PID 1', 'The first process inside a container, responsible for receiving termination signals and reaping finished children.'],
      ],
      steps: [
        ['Prepare the build context', 'The client reads a directory while .dockerignore excludes node_modules, Git data, build output, and secrets.'],
        ['Execute the Dockerfile', 'The builder resolves base images and evaluates each required build stage.'],
        ['Reuse cache', 'An unchanged instruction with unchanged inputs can reuse a layer, so dependency manifests are copied before source.'],
        ['Produce the runtime image', 'Multi-stage COPY transfers only the standalone artifact without the compiler, caches, or development tools.'],
        ['Create a container', 'The runtime adds a writable layer, environment, limits, mounts, and a network namespace over the image.'],
        ['Start the main process', 'CMD or ENTRYPOINT selects the process, USER reduces privilege, and init helps signal forwarding.'],
        ['Connect services', 'Compose supplies a network and service DNS names, so the app connects to postgres rather than localhost.'],
        ['Observe lifecycle', 'Health status, restart policy, logs, and graceful shutdown expose process readiness and termination.'],
      ],
      nuances: [
        ['An image is not a virtual machine', 'A container does not boot another kernel, so image platform and host architecture must be compatible.'],
        ['EXPOSE does not publish a port', 'EXPOSE documents a container port; docker run -p or Compose ports creates a host mapping.'],
        ['localhost is local to the current container', 'From the app container, localhost is not the Postgres container; use the postgres service name.'],
        ['ENV becomes runtime metadata', 'Do not preserve build secrets through ARG, ENV, or COPY because image history and layers can expose them.'],
        ['depends_on is not a migration system', 'A healthy dependency is only a probe result; connection retries and controlled schema migrations remain necessary.'],
        ['Container filesystems are usually disposable', 'A writable layer disappears with the container; database state belongs in a volume or managed database.'],
        ['A tag can move', 'latest and mutable version tags may resolve to different content; a digest identifies one exact image.'],
      ],
      pitfalls: [
        ['A container contains a separate operating system.', 'It contains user-space files but shares the host kernel.'],
        ['COPY . . copies only the application.', 'Without .dockerignore, secrets, Git data, local dependencies, and large junk can enter the context.'],
        ['A successfully built image is production-ready.', 'Production also needs a non-root user, lean runtime, signals, health, limits, logs, and base-image updates.'],
        ['PostgreSQL data can live in the container.', 'Containers are replaceable; persistent state needs a volume or external storage.'],
        ['HEALTHCHECK guarantees product availability.', 'It proves only the selected signal, which may be too weak or coupled to too many dependencies.'],
      ],
      codeIntro:
        'The simplified Dockerfile uses three concerns. Dependency installation is cacheable, the build creates a Next standalone artifact, and the runtime receives only what it needs and starts Node without root.',
      codeNotes: [
        'Every FROM begins another build stage.',
        'Copying lockfiles before source preserves the expensive npm ci cache after source changes.',
        'COPY --from transfers an artifact between stages.',
        'USER node limits the impact of process compromise.',
        'EXPOSE is metadata rather than host-port publication.',
        'The exec form of CMD lets Node receive the termination signal directly.',
      ],
      examples: [
        {
          title: 'Build and run an image',
          goal: 'Create a local image and a container with a published HTTP port.',
          code: `docker build -t node-loop-lab:local .
docker run --rm --init \\
  -p 127.0.0.1:3000:3000 \\
  --memory=2g --pids-limit=128 \\
  node-loop-lab:local`,
          notes: [
            '-t assigns a local repository and tag.',
            '--rm removes the stopped container, not the image.',
            '--init adds a minimal init process as PID 1.',
          ],
        },
        {
          title: 'COPY order for cache',
          goal: 'Avoid reinstalling dependencies after every source edit.',
          code: `COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build`,
          notes: [
            'npm ci reproduces the lockfile without changing it.',
            'A source change invalidates only the later layers.',
          ],
        },
        {
          title: 'Multi-stage runtime',
          goal: 'Keep the build toolchain out of the production image.',
          code: `FROM node:24-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
COPY --from=build /app/.next/standalone ./
CMD ["node", "server.js"]`,
          notes: [
            'The final image begins at a new FROM.',
            'Only a selected artifact crosses from the build stage.',
          ],
        },
        {
          title: 'Compose service DNS',
          goal: 'Connect the app and PostgreSQL inside a Compose network.',
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
            'postgres is the hostname derived from the service name.',
            'A real deployment must not commit the password in the Compose file.',
          ],
        },
        {
          title: 'Inspect runtime state',
          goal: 'Distinguish an image, a running container, and its logs.',
          code: `docker image ls
docker compose ps
docker compose logs -f node-loop-lab
docker inspect node-loop-lab`,
          notes: [
            'ps exposes status and published ports.',
            'logs -f follows stdout and stderr.',
            'inspect returns low-level JSON configuration.',
          ],
        },
        {
          title: 'Graceful Node shutdown',
          goal: 'Drain traffic and close resources before forced termination.',
          code: `process.once('SIGTERM', async () => {
  server.close();
  await databasePool.end();
  process.exitCode = 0;
});`,
          notes: [
            'docker stop sends SIGTERM before SIGKILL.',
            'The process must finish active requests within its grace period.',
          ],
        },
      ],
      questions: [
        'How does an image differ from a container?',
        'Why does a source edit not have to rerun npm ci?',
        'Why does EXPOSE 3000 not open a host port?',
        'Why does DATABASE_URL use postgres rather than localhost?',
        'Which files belong in .dockerignore?',
        'Why use a production stage and USER node?',
        'What happens to writable-layer data when a container is removed?',
      ],
    },
  },

  'kubernetes-foundations': {
    title: 'Kubernetes: Pods, Services, and reconciliation',
    eyebrow: 'Desired state → controllers → rollout',
    summary:
      'Follow a container image through Deployment reconciliation, scheduling, readiness, Service routing, and a rolling update.',
    theory:
      'Kubernetes is a declarative orchestrator for container workloads. The API server stores desired objects, controllers reconcile them, the scheduler selects a node, kubelet maintains Pod lifecycle, and a Service provides a stable virtual endpoint for a changing set of Ready Pods.',
    watchFor:
      'The safe runtime simulates the control loop rather than touching a real cluster. It scales one actual Pod to three desired replicas, removes a NotReady Pod from traffic, and begins a maxSurge rolling update.',
    expected: [
      'A Pod is the smallest deployable Kubernetes unit.',
      'A Deployment manages ReplicaSets and replaceable stateless Pods.',
      'Controllers continuously reconcile desired and observed state.',
      'The scheduler places Pods using resource requests and constraints.',
      'A Service selects Ready Pods by labels.',
      'Readiness changes traffic; liveness can restart a container.',
      'A rolling update replaces revisions within surge and availability bounds.',
    ],
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
          image: ghcr.io/example/node-loop-lab:1.0.0
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000`,
    learning: {
      plain:
        'Docker can start a container on one machine. Kubernetes resembles a dispatcher for a fleet: you declare that three application copies should run, and it keeps comparing reality with that goal, places Pods, replaces failures, and connects ready instances to a stable address.',
      foundation:
        'Kubernetes is a declarative orchestrator for container workloads. The API server stores desired objects, controllers reconcile them, the scheduler chooses a node, kubelet maintains Pod lifecycle, and a Service exposes a stable virtual endpoint for a dynamic set of Ready Pods.',
      why:
        'Kubernetes is not needed merely to start one container. It manages many instances and nodes through self-healing, rolling updates, service discovery, configuration, scheduling, and resource governance. The cost is another distributed system that should have a measured justification.',
      resources: [
        {
          label: 'Kubernetes concepts',
          href: 'https://kubernetes.io/docs/concepts/overview/',
          description:
            'Official map of cluster architecture, objects, the control plane, and declarative management.',
        },
        {
          label: 'Deployments',
          href: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/',
          description:
            'Desired replicas, ReplicaSets, rollout strategy, status, and stateless-workload rollback.',
        },
        {
          label: 'Services',
          href: 'https://kubernetes.io/docs/concepts/services-networking/service/',
          description:
            'Stable endpoints and Pod selection through labels and selectors.',
        },
        {
          label: 'Liveness, readiness, and startup probes',
          href: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/',
          description:
            'Probe roles, thresholds, and the consequences of incorrect configuration.',
        },
        {
          label: 'Resource management',
          href: 'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/',
          description:
            'CPU and memory requests, limits, scheduling, throttling, and out-of-memory behavior.',
        },
      ],
      runtimeLayers: [
        { title: 'MANIFEST', detail: 'desired state', active: true },
        { title: 'CONTROL PLANE', detail: 'API · controllers · scheduler' },
        { title: 'NODE', detail: 'kubelet · container runtime' },
        { title: 'TRAFFIC', detail: 'Service · ready Pods' },
      ],
      terms: [
        ['Cluster', 'A control plane and worker nodes that jointly run and manage Kubernetes objects.'],
        ['Pod', 'The smallest deployable Kubernetes unit: one or more closely related containers sharing networking and volumes.'],
        ['Deployment', 'A stateless-Pod controller that manages replicas, ReplicaSets, and rolling updates.'],
        ['Service', 'A stable network endpoint and DNS name for a dynamic Pod set selected by labels.'],
        ['Label / selector', 'A label marks an object with key/value metadata; a selector connects controllers or Services to matching objects.'],
        ['Reconciliation loop', 'A controller repeatedly compares desired state with observed state and acts to remove the difference.'],
        ['Readiness probe', 'A traffic-readiness check; failure removes a Pod from Service endpoints without necessarily restarting it.'],
        ['Liveness probe', 'A progress check whose sustained failure causes the container to restart.'],
        ['Resource request / limit', 'A request informs scheduling and reservation; a limit bounds permitted runtime consumption.'],
        ['Rolling update', 'A gradual replacement of old Pods with new Pods controlled by maxSurge and maxUnavailable.'],
      ],
      steps: [
        ['Submit a manifest', 'kubectl sends YAML to the API server, where schema validation checks apiVersion, kind, metadata, and spec.'],
        ['Store desired state', 'The control plane persists the Deployment and increments generation when its Pod template changes.'],
        ['Create a ReplicaSet', 'The Deployment controller observes a difference and creates a ReplicaSet for the current revision.'],
        ['Schedule Pods', 'The scheduler chooses nodes that satisfy requests, affinity, taints, and other placement constraints.'],
        ['Start containers', 'Kubelet asks the container runtime to pull the image and maintains declared Pod lifecycle.'],
        ['Check readiness', 'A readiness probe admits a Pod to Service endpoints only after the application can receive traffic.'],
        ['Route traffic', 'A Service selector finds Ready Pods and gives clients a stable name independent of changing Pod IPs.'],
        ['Reconcile an update', 'For a new image, the controller creates new Pods, waits for readiness, and removes old ones within strategy bounds.'],
      ],
      nuances: [
        ['Kubernetes does not build images', 'CI builds and pushes an image to a registry; Kubernetes receives a reference and runs that content on nodes.'],
        ['A Pod is not a small VM', 'Containers in one Pod share a network namespace, communicate through localhost, and have one Pod IP.'],
        ['A replica is not a backup', 'Three stateless Pods improve process availability but do not replace data backup or a multi-zone database.'],
        ['Readiness and liveness answer different questions', 'NotReady removes traffic; liveness failure restarts. Database-coupled liveness can restart an entire fleet during an outage.'],
        ['Requests matter to the scheduler', 'Without requests the scheduler cannot know demand. CPU limits usually throttle; memory-limit excess can cause an OOM kill.'],
        ['A Secret is not encrypted by its name', 'The object separates data from Pod specs, but base64 is not encryption; RBAC and encryption at rest are still needed.'],
        ['A Service does not always expose the internet', 'ClusterIP is internal; external HTTP commonly uses an Ingress, Gateway, or LoadBalancer Service.'],
      ],
      pitfalls: [
        ['Kubernetes replaces the Dockerfile and registry.', 'The orchestrator runs ready images; build and supply chain remain separate CI concerns.'],
        ['A Running container means the app is ready.', 'The process may still be loading or unable to serve; readiness distinguishes that state.'],
        ['Liveness should verify every dependency.', 'An external outage is not always fixed by restart and can trigger a cascading failure.'],
        ['Using image: latest is harmless.', 'A moving tag makes rollout and rollback irreproducible; use an immutable version or digest.'],
        ['Three replicas guarantee high availability.', 'Without topology constraints they can share one node or failure zone.'],
        ['kubectl apply updates all Pods immediately.', 'The API changes desired state and controllers perform the rollout asynchronously.'],
      ],
      codeIntro:
        'The manifest connects a Deployment and a Service with the same label. The Deployment maintains three Pods, waits for readiness, and updates gradually; the Service routes to a named port on Ready Pods.',
      codeNotes: [
        'apiVersion and kind select the Kubernetes object schema.',
        'The Deployment selector must match labels in the Pod template.',
        'replicas is desired state, not an immediate process-creation command.',
        'readinessProbe controls whether the Pod receives Service traffic.',
        'requests affect scheduling while limits constrain the container.',
        'Service targetPort: http references a named containerPort.',
        'maxUnavailable: 0 and maxSurge: 1 allow a temporary fourth Pod for rollout availability.',
      ],
      examples: [
        {
          title: 'Apply and inspect a rollout',
          goal: 'Create objects and observe actual Deployment state.',
          code: `kubectl apply -f node-loop-lab.yml
kubectl rollout status deployment/node-loop-lab
kubectl get pods -l app=node-loop-lab
kubectl describe deployment node-loop-lab`,
          notes: [
            'apply creates or declaratively updates objects.',
            'rollout status waits for the new revision to become available.',
            'describe exposes conditions and recent events.',
          ],
        },
        {
          title: 'Deployment skeleton',
          goal: 'Maintain three interchangeable Pods.',
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
            'A Pod-template change creates a new Deployment revision.',
            'The image reference must point to a published registry artifact.',
          ],
        },
        {
          title: 'Service selector',
          goal: 'Give Pods stable DNS and a virtual IP.',
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
            'The selector must match the Pod label.',
            'The Service does not depend on changing Pod IPs.',
          ],
        },
        {
          title: 'Three different probes',
          goal: 'Separate slow startup, traffic readiness, and deadlock recovery.',
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
            'Startup delays liveness and readiness until startup succeeds.',
            'Readiness failure stops new traffic.',
            'Liveness failure after the threshold causes a restart.',
          ],
        },
        {
          title: 'Requests and limits',
          goal: 'Give the scheduler a demand signal and set a runtime boundary.',
          code: `resources:
  requests:
    cpu: 250m
    memory: 256Mi
  limits:
    cpu: "1"
    memory: 1Gi`,
          notes: [
            '250m is a quarter of one CPU core as a request.',
            'Mi and Gi are binary memory units.',
            'Measure values rather than copying them blindly.',
          ],
        },
        {
          title: 'Update and rollback',
          goal: 'Move to an immutable version and return after an incident.',
          code: `kubectl set image deployment/node-loop-lab \\
  app=ghcr.io/example/node-loop-lab:1.1.0

kubectl rollout status deployment/node-loop-lab
kubectl rollout undo deployment/node-loop-lab`,
          notes: [
            'set image changes the desired Pod template.',
            'A Deployment rollback does not roll back a database migration.',
          ],
        },
        {
          title: 'Diagnose a Pod',
          goal: 'Distinguish application logs, object status, and node events.',
          code: `kubectl get pod <pod> -o wide
kubectl logs <pod> -c app --previous
kubectl describe pod <pod>
kubectl get events --sort-by=.metadata.creationTimestamp`,
          notes: [
            '--previous reads logs from the prior container after a restart.',
            'describe reveals probe, scheduling, and image-pull events.',
          ],
        },
      ],
      questions: [
        'How do a Pod, Deployment, and Service differ?',
        'Who compares desired replicas with actual replicas?',
        'Why must a Service selector match Pod labels?',
        'What happens after readiness failure versus liveness failure?',
        'How does a resource request differ from a limit?',
        'Why does latest prevent reproducible rollback?',
        'Why do three Pods not replace a PostgreSQL backup?',
        'What does kubectl apply actually do?',
      ],
    },
  },
};
