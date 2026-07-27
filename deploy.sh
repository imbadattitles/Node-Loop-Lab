#!/usr/bin/env bash

# Production deployment for an Ubuntu server.
# Run git pull yourself, inspect the changes, then execute: bash deploy.sh
set -Eeuo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: Docker is not installed or is unavailable in PATH." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Error: Docker Compose v2 is required (command: docker compose)." >&2
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "Error: .env was not found." >&2
  echo "Create it first: cp .env.example .env" >&2
  exit 1
fi

if ! grep -Eq '^BIND_ADDRESS=127\.0\.0\.1([[:space:]]*)$' .env; then
  echo "Error: production BIND_ADDRESS must be 127.0.0.1." >&2
  echo "Public traffic should enter through the system Nginx, not Docker directly." >&2
  exit 1
fi

if ! grep -Eq '^TRUST_PROXY=1([[:space:]]*)$' .env; then
  echo "Error: set TRUST_PROXY=1 for the single system Nginx proxy." >&2
  exit 1
fi

if ! grep -Eq '^SITE_URL=https://[^/[:space:]]+([[:space:]]*)$' .env; then
  echo "Error: SITE_URL must be the public HTTPS origin without a trailing slash." >&2
  echo "Example: SITE_URL=https://node-lab.your-domain.com" >&2
  exit 1
fi

if grep -Eq '^SITE_URL=https://[^[:space:]]*example\.(com|org|net)([[:space:]]*)$' .env; then
  echo "Error: replace the placeholder SITE_URL with the real public domain." >&2
  exit 1
fi

docker compose config --quiet

show_failure_details() {
  local exit_code=$?
  trap - ERR
  set +e
  echo >&2
  echo "Deployment failed. Container state:" >&2
  docker compose ps --all >&2
  echo >&2
  echo "Recent application and Redis logs:" >&2
  docker compose logs --tail=100 node-loop-lab redis >&2
  exit "$exit_code"
}
trap show_failure_details ERR

echo "Pulling the Redis base image..."
docker compose pull redis

echo "Building Node Loop Lab..."
docker compose build --pull node-loop-lab

if ! docker compose up --help 2>&1 | grep -q -- "--wait"; then
  echo "Error: update Docker Compose to a version that supports --wait." >&2
  exit 1
fi

echo "Starting the public application and Redis..."
docker compose up \
  --detach \
  --remove-orphans \
  --wait \
  --wait-timeout 180

HEALTH_RESPONSE="$(
  docker compose exec -T node-loop-lab node -e \
    "fetch('http://127.0.0.1:3000/api/health').then(async (response) => { const body = await response.text(); if (!response.ok) process.exitCode = 1; process.stdout.write(body); }).catch((error) => { console.error(error); process.exit(1); });"
)"

if [[ "$HEALTH_RESPONSE" != *'"mode":"public"'* ]]; then
  echo "Error: healthcheck did not confirm the public profile." >&2
  echo "Response: $HEALTH_RESPONSE" >&2
  exit 1
fi

echo
docker compose ps
echo
APP_ADDRESS="$(docker compose port node-loop-lab 3000)"
echo "Deployment complete: http://${APP_ADDRESS}"
echo "API health: ${HEALTH_RESPONSE}"
