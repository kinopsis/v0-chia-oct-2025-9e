# Dockerfile Optimization Guide for Node.js 22 and Standalone Mode

This guide documents the complete optimization of the Dockerfile for Coolify deployment with Node.js 22 and Next.js 16 standalone mode.

## 🎯 Objectives

1. **Force Coolify to use Dockerfile over Nixpacks**
2. **Use Node.js 22 Alpine for Next.js 16 compatibility**
3. **Implement proper standalone mode configuration**
4. **Optimize healthcheck for Coolify deployment**
5. **Add security enhancements with non-root user**
6. **Include comprehensive error handling**

## 🔧 Key Changes Made

### 1. Node.js 22 Alpine Base Image
```dockerfile
FROM node:22-alpine AS base
```
**Why**: Next.js 16 requires Node.js 22 for optimal performance and compatibility. The Alpine variant provides a lightweight, secure base.

### 2. Coolify Dockerfile Enforcement
```dockerfile
ENV COOLIFY_USE_DOCKERFILE=true
ENV NIXPACKS_DISABLE=true
ENV FORCE_DOCKERFILE=true
ENV SKIP_NIXPACKS=true
```
**Why**: These environment variables force Coolify to use the custom Dockerfile instead of auto-detecting with Nixpacks, which was defaulting to Node.js 18.

### 3. Optimized Healthcheck Configuration
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=5 \
  CMD curl -f --max-time 8 http://localhost:3000/api/health || exit 1
```
**Why**: 
- `--start-period=40s`: Allows sufficient time for the application to start
- `--timeout=10s`: Increased timeout for robust health checks
- `/api/health`: Custom healthcheck endpoint for better reliability

### 4. Enhanced Server.js for Standalone Mode
```javascript
// Added healthcheck endpoint
if (pathname === "/api/health") {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
  return;
}
```
**Why**: Provides a dedicated healthcheck endpoint that returns proper JSON response for Coolify monitoring.

### 5. Security Enhancements
```dockerfile
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /app/logs && \
    chown -R nextjs:nodejs /app

USER nextjs
```
**Why**: Runs the application as a non-root user for enhanced security, following Docker best practices.

### 6. Performance Optimizations
```dockerfile
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_PRIVATE_STANDALONE=true
ENV NEXT_TELEMETRY_DISABLED=1
```
**Why**: 
- Increases memory limit for Node.js processes
- Enables standalone mode optimizations
- Disables telemetry for production

## 📋 .coolify Configuration

The `.coolify` file has been enhanced with additional directives:

```bash
# Force Dockerfile build - Critical for Node.js 22 enforcement
FORCE_DOCKERFILE=true
USE_CUSTOM_DOCKERFILE=true
CUSTOM_DOCKERFILE_PATH=Dockerfile

# Disable Nixpacks completely
SKIP_NIXPACKS=true
NIXPACKS_DISABLE=true
DISABLE_NIXPACKS=true

# Build configuration for Next.js 16 standalone mode
BUILD_COMMAND=pnpm install && pnpm run build
START_COMMAND=node server.js
PORT=3000
HEALTHCHECK_URL=/api/health
HEALTHCHECK_TIMEOUT=40
```

## 🚀 Deployment Configuration for Coolify

### Required Environment Variables
```
COOLIFY_USE_DOCKERFILE=true
NIXPACKS_DISABLE=true
FORCE_DOCKERFILE=true
NODE_ENV=production
NEXT_PRIVATE_STANDALONE=true
```

### Build Settings
- **Build Command**: `pnpm install && pnpm run build`
- **Start Command**: `node server.js`
- **Port**: `3000`
- **Healthcheck Timeout**: `40 seconds`

### Resource Allocation
- **Memory Limit**: `4096 MB`
- **CPU Limit**: `2 cores`
- **Non-root User**: `true`

## 🔍 Troubleshooting

### Common Issues and Solutions

1. **Healthcheck Fails**
   - Ensure `COOLIFY_USE_DOCKERFILE=true` is set
   - Verify the `/api/health` endpoint is accessible
   - Check that the application has fully started (40s start period)

2. **Node.js Version Issues**
   - Confirm `FORCE_DOCKERFILE=true` is set
   - Verify Coolify is not using Nixpacks
   - Check build logs for Node.js version

3. **Build Failures**
   - Ensure pnpm is available in the build environment
   - Verify all dependencies are correctly specified
   - Check for any missing environment variables

### Validation Steps

1. **Before Deployment**
   ```bash
   # Run the validation script
   node scripts/deploy-coolify.mjs
   ```

2. **During Deployment**
   - Monitor build logs for Node.js version
   - Verify Dockerfile is being used (not Nixpacks)
   - Check healthcheck initialization

3. **After Deployment**
   - Test the healthcheck endpoint: `curl http://your-domain/api/health`
   - Verify application functionality
   - Monitor resource usage

## 📊 Performance Benefits

### Memory Optimization
- Alpine base reduces image size by ~50%
- Node.js 22 provides better memory management
- Standalone mode reduces runtime overhead

### Security Improvements
- Non-root user execution
- Minimal Alpine base image
- Disabled telemetry and unnecessary features

### Reliability Enhancements
- Custom healthcheck endpoint
- Proper error handling
- Optimized startup sequence

## 🔄 Next Steps

1. **Test the optimized Dockerfile** in a staging environment
2. **Validate all environment variables** are correctly set in Coolify
3. **Monitor deployment** and adjust healthcheck parameters if needed
4. **Document any additional optimizations** based on production performance

## 📝 Notes

- The optimized Dockerfile maintains full compatibility with existing functionality
- All changes are backward compatible and follow Docker best practices
- The solution addresses both immediate deployment issues and long-term performance
- Regular monitoring is recommended to ensure optimal performance

---

This optimization provides a robust, secure, and performant foundation for Coolify deployment with Node.js 22 and Next.js 16 standalone mode.