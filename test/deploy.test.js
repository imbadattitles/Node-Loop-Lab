import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

async function readProjectFile(relativePath) {
  return readFile(new URL(relativePath, root), 'utf8');
}

test('production deployment keeps the public application behind loopback', async () => {
  const [compose, environment, deployScript] = await Promise.all([
    readProjectFile('compose.yml'),
    readProjectFile('.env.example'),
    readProjectFile('deploy.sh'),
  ]);

  assert.match(compose, /LAB_MODE:\s*public/);
  assert.match(
    compose,
    /\$\{BIND_ADDRESS:-127\.0\.0\.1\}:\$\{APP_PORT:-3000\}:3000/,
  );
  assert.match(environment, /^BIND_ADDRESS=127\.0\.0\.1$/m);
  assert.match(environment, /^TRUST_PROXY=1$/m);
  assert.match(environment, /^SITE_URL=https:\/\//m);
  assert.match(deployScript, /docker compose config --quiet/);
  assert.match(deployScript, /SITE_URL must be the public HTTPS origin/);
  assert.match(deployScript, /--wait-timeout 180/);
  assert.match(deployScript, /'"mode":"public"'/);
});

test('PostgreSQL lab is isolated, bounded, and included in deployment', async () => {
  const [compose, environment, deployScript, initScript] = await Promise.all([
    readProjectFile('compose.yml'),
    readProjectFile('.env.example'),
    readProjectFile('deploy.sh'),
    readProjectFile('docker/postgres-init.sh'),
  ]);

  assert.match(compose, /postgres:18-alpine/);
  assert.match(compose, /127\.0\.0\.1:\$\{POSTGRES_PORT:-5432\}:5432/);
  assert.match(compose, /DATABASE_URL:/);
  assert.match(compose, /node_loop_lab_app/);
  assert.match(compose, /POSTGRES_ADMIN_PASSWORD/);
  assert.match(compose, /mem_limit:\s*768m/);
  assert.match(
    compose,
    /PGDATA:\s*\/var\/lib\/postgresql\/18\/docker/,
  );
  assert.match(compose, /\/var\/lib\/postgresql:size=512m/);
  assert.match(environment, /^POSTGRES_PORT=5432$/m);
  assert.match(environment, /^POSTGRES_PASSWORD=/m);
  assert.match(environment, /^POSTGRES_ADMIN_PASSWORD=/m);
  assert.match(
    compose,
    /postgres-init\.sh:\/docker-entrypoint-initdb\.d\/10-node-loop-lab-app\.sh:ro/,
  );
  assert.match(initScript, /NOSUPERUSER/);
  assert.match(initScript, /GRANT CONNECT, CREATE ON DATABASE/);
  assert.match(deployScript, /docker compose pull redis postgres/);
});

test('Nginx deployment template preserves streamed API responses', async () => {
  const nginx = await readProjectFile('docker/host.nginx.example.conf');

  assert.match(nginx, /proxy_pass http:\/\/127\.0\.0\.1:8080/);
  assert.match(nginx, /location \/api\//);
  assert.match(nginx, /proxy_buffering off/);
  assert.match(nginx, /proxy_read_timeout 180s/);
});

test('optional monitoring stack stays loopback-only and is provisioned', async () => {
  const [compose, prometheus, datasource, dashboard] = await Promise.all([
    readProjectFile('compose.monitoring.yml'),
    readProjectFile('monitoring/prometheus.yml'),
    readProjectFile(
      'monitoring/grafana/provisioning/datasources/prometheus.yml',
    ),
    readProjectFile(
      'monitoring/grafana/dashboards/node-loop-lab.json',
    ),
  ]);

  assert.match(compose, /prom\/prometheus:v3\.13\.0/);
  assert.match(compose, /grafana\/grafana:13\.1\.0/);
  assert.match(compose, /127\.0\.0\.1:\$\{PROMETHEUS_PORT:-9090\}:9090/);
  assert.match(compose, /127\.0\.0\.1:\$\{GRAFANA_PORT:-3001\}:3000/);
  assert.match(prometheus, /metrics_path: \/api\/metrics/);
  assert.match(prometheus, /node-loop-lab:3000/);
  assert.match(datasource, /url: http:\/\/prometheus:9090/);
  assert.match(dashboard, /node_loop_lab_memory_child_retained_bytes/);
});
