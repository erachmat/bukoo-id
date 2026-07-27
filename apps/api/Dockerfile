# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Required for Prisma binary generation and bcrypt native addon
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy manifests for deterministic install
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/

# Copy shared packages (workspace deps)
COPY packages/ ./packages/

# Install ALL deps (including devDependencies needed for build) ignoring postinstall scripts until source files are copied
RUN npm ci --workspace=apps/api --include-workspace-root --ignore-scripts

# Copy full source
COPY apps/api/ ./apps/api/

# Build shared-types first (API depends on @bukoo/shared-types)
RUN npm run --workspace=packages/shared-types build

# Generate Prisma client (requires schema.prisma + native binaries)
RUN npm run --workspace=apps/api db:generate

# ✅ Verify .prisma ada di root node_modules (hoisted)
RUN test -d /app/node_modules/.prisma || \
    (echo "❌ .prisma tidak ditemukan di root node_modules" && exit 1)

# Compile TypeScript → dist/
RUN npm run --workspace=apps/api build

RUN test -f /app/apps/api/dist/main.js || \
    (echo "❌ dist/main.js tidak ditemukan" && exit 1)

# Backup dari ROOT node_modules (bukan apps/api)
RUN cp -r /app/node_modules/.prisma /tmp/prisma-generated

RUN npm prune --workspace=apps/api --omit=dev

# Restore ke root node_modules setelah prune
RUN cp -r /tmp/prisma-generated /app/node_modules/.prisma


# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache openssl libc6-compat dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

WORKDIR /app

# Copy root node_modules and shared packages
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages

# Copy apps/api files keeping the directory structure to preserve resolution pathing
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/package.json

USER nestjs
EXPOSE 3000
HEALTHCHECK NONE
ENTRYPOINT ["dumb-init", "--"]
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
