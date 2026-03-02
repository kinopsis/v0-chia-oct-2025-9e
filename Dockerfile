# =============================================================================
# STAGE 1: Dependency Installation
# =============================================================================
FROM node:22.13.0-alpine3.20 AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy lock files first for efficient caching
COPY package.json package-lock.json* ./
RUN npm ci

# =============================================================================
# STAGE 2: Build Application
# =============================================================================
FROM node:22.13.0-alpine3.20 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Next.js 15 standalone output is defined in next.config.mjs
RUN npm run build

# =============================================================================
# STAGE 3: Production Runtime
# =============================================================================
FROM node:22.13.0-alpine3.20 AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Security: Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy essential files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Permissions hardening
USER nextjs

EXPOSE 3000

# The standalone output includes its own minimal server.js
CMD ["node", "server.js"]
