# syntax=docker/dockerfile:1

FROM node:24-alpine AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build

ARG SITE_URL=http://localhost:3000
ENV NEXT_TELEMETRY_DISABLED=1 \
    SITE_URL=$SITE_URL

COPY . .
RUN npm run build


FROM node:24-alpine AS runtime

RUN apk add --no-cache python3

ENV NODE_ENV=production \
    LAB_MODE=public \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_LOOP_SOURCE_DIR=/app/src

WORKDIR /app

COPY --chown=node:node --from=build /app/.next/standalone ./
COPY --chown=node:node --from=build /app/.next/static ./.next/static
COPY --chown=node:node --from=build /app/src ./src

USER node

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then((response) => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1));"

CMD ["node", "server.js"]
