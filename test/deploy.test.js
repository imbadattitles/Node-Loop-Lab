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

test('Nginx deployment template preserves streamed API responses', async () => {
  const nginx = await readProjectFile('docker/host.nginx.example.conf');

  assert.match(nginx, /proxy_pass http:\/\/127\.0\.0\.1:8080/);
  assert.match(nginx, /location \/api\//);
  assert.match(nginx, /proxy_buffering off/);
  assert.match(nginx, /proxy_read_timeout 180s/);
});
