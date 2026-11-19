# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# 1. Build stage: install all deps (incl. dev) and generate Prisma Client
# ---------------------------------------------------------------------------
FROM oven/bun:alpine AS build
WORKDIR /app

# Prisma CLI needs OpenSSL on Alpine
RUN apk add --no-cache openssl

COPY package.json bun.lock prisma.config.ts ./
RUN bun install --frozen-lockfile

COPY prisma ./prisma
RUN bunx prisma generate

# ---------------------------------------------------------------------------
# 2. Production dependencies only (no tsx/vite/eslint/etc.)
# ---------------------------------------------------------------------------
FROM oven/bun:alpine AS prod-deps
WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# ---------------------------------------------------------------------------
# 3. Runtime image
# ---------------------------------------------------------------------------
FROM oven/bun:alpine AS runtime
WORKDIR /app

RUN apk add --no-cache openssl \
  && mkdir -p public/uploads

ENV NODE_ENV=production
ENV PORT=5050

# Production node_modules + generated Prisma Client from the build stage
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Runtime sources (Bun runs TypeScript natively, no compile step needed)
COPY package.json ./
COPY prisma ./prisma
COPY server ./server

EXPOSE 5050

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-5050}/api/health" || exit 1

CMD ["bun", "server/index.ts"]
