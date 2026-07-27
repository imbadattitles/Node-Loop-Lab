# syntax=docker/dockerfile:1

FROM node:24-alpine AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci


FROM dependencies AS production-dependencies

RUN npm prune --omit=dev && npm cache clean --force


FROM dependencies AS build

COPY index.html vite.config.js ./
COPY client ./client
RUN npm run build


FROM node:24-alpine AS runtime

ENV NODE_ENV=production \
    LAB_MODE=public \
    PORT=3000

WORKDIR /app

COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node --from=production-dependencies /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node src ./src

USER node

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then((response) => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1));"

CMD ["node", "src/server.js"]
