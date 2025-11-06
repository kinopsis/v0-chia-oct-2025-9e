# Use Node.js 22 for better compatibility
FROM node:22-alpine AS base

# Install pnpm globally in base image for all stages
RUN npm install -g pnpm

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build the application with standalone output
RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Force Coolify to use this Dockerfile instead of Nixpacks
ENV COOLIFY_USE_DOCKERFILE=true
ENV NIXPACKS_DISABLE=true
ENV FORCE_DOCKERFILE=true
ENV SKIP_NIXPACKS=true
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PRIVATE_STANDALONE=true

# Security: Create non-root user early
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /app/logs && \
    chown -R nextjs:nodejs /app

# Copy built assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Expose port
EXPOSE 3000

# Environment variables for production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_PRIVATE_STANDALONE=true
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Health check - optimized for Coolify with proper timing
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=5 \
  CMD curl -f --max-time 8 http://localhost:3000/api/health || exit 1

# Create optimized server.js for standalone mode with proper error handling
RUN echo 'const { createServer } = require("http");\nconst { parse } = require("url");\nconst next = require("next");\n\nconst dev = process.env.NODE_ENV !== "production";\nconst hostname = process.env.HOSTNAME || "0.0.0.0";\nconst port = parseInt(process.env.PORT) || 3000;\n\nconst app = next({ dev, hostname, port });\nconst handle = app.getRequestHandler();\n\napp.prepare().then(() => {\n  createServer(async (req, res) => {\n    try {\n      const parsedUrl = parse(req.url, true);\n      const { pathname, query } = parsedUrl;\n\n      // Add healthcheck endpoint for Coolify\n      if (pathname === "/api/health") {\n        res.statusCode = 200;\n        res.setHeader("Content-Type", "application/json");\n        res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));\n        return;\n      }\n\n      await handle(req, res, parsedUrl);\n    } catch (err) {\n      console.error("Error occurred handling", req.url, err);\n      res.statusCode = 500;\n      res.setHeader("Content-Type", "application/json");\n      res.end(JSON.stringify({ error: "Internal Server Error", timestamp: new Date().toISOString() }));\n    }\n  }).listen(port, hostname, (err) => {\n    if (err) throw err;\n    console.log(`> Ready on http://${hostname}:${port}`);\n  });\n}).catch((err) => {\n  console.error("Failed to start server", err);\n  process.exit(1);\n});' > server.js

CMD ["node", "server.js"]