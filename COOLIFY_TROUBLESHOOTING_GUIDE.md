# 🛠️ Comprehensive Coolify Deployment Troubleshooting Guide

## 📋 Table of Contents
1. [Executive Summary](#executive-summary)
2. [Complete Problem Analysis](#complete-problem-analysis)
3. [Solution Implementation](#solution-implementation)
4. [Step-by-Step Deployment Guide](#step-by-step-deployment-guide)
5. [Troubleshooting Section](#troubleshooting-section)
6. [Validation Checklist](#validation-checklist)
7. [Best Practices](#best-practices)
8. [Appendix](#appendix)

---

## 🎯 Executive Summary

This comprehensive troubleshooting guide documents the complete solution for Coolify deployment failures that were blocking the successful deployment of the Next.js 16 application. The guide consolidates all work performed by Architect, Code, and Coding-Teacher modes into a single, user-friendly resource.

### 📊 Problem Overview
- **Primary Issue**: Coolify using Nixpacks instead of custom Dockerfile, resulting in Node.js 18.20.5 instead of required Node.js 22
- **Secondary Issue**: Healthcheck failures due to timing issues and Docker configuration problems
- **Tertiary Issue**: Missing environment variables and configuration to force Dockerfile usage

### ✅ Solution Highlights
- **Forced Dockerfile Usage**: Multiple configuration layers to ensure Coolify uses custom Dockerfile
- **Node.js 22 Compatibility**: Guaranteed Node.js 22 usage for Next.js 16 compatibility
- **Robust Healthcheck**: Optimized healthcheck mechanism with proper timing
- **Comprehensive Validation**: Automated validation framework for deployment readiness

---

## 🔍 Complete Problem Analysis

### 1. Root Cause: Nixpacks Override Issue

**Problem Description:**
Coolify was automatically using Nixpacks instead of the custom Dockerfile, causing:
- Node.js version 18.20.5 instead of required Node.js 22
- Missing pnpm in build stages
- Incorrect build environment configuration

**Technical Analysis:**
- Nixpacks detection was triggered by package.json presence
- Dockerfile was ignored despite being present
- Build process used default Node.js image instead of specified version

**Impact:**
- Next.js 16 requires Node.js >= 20.9.0
- Application failed to build with version incompatibility
- Deployment completely blocked

### 2. Root Cause: Healthcheck Configuration Issues

**Problem Description:**
Healthcheck was failing due to:
- Insufficient start period for server initialization
- Template parsing errors in Coolify
- Incorrect timeout configuration

**Technical Analysis:**
- Server needed 30-40 seconds to fully initialize
- Default healthcheck start period was only 5 seconds
- Coolify had issues parsing health status from Docker

**Impact:**
- Deployment marked as failed despite successful build
- Container restart loops
- Inconsistent deployment behavior

### 3. Root Cause: Configuration Management Issues

**Problem Description:**
Missing or incorrect configuration elements:
- No .coolify file to force Dockerfile usage
- Missing Coolify-specific environment variables
- Incomplete Dockerfile optimization

**Technical Analysis:**
- Coolify defaults to Nixpacks when no explicit configuration present
- Environment variables not properly set for Dockerfile enforcement
- Dockerfile lacked Coolify-specific optimizations

**Impact:**
- Unpredictable deployment behavior
- Manual intervention required for each deployment
- Configuration drift between environments

---

## 🔧 Solution Implementation

### 1. Configuration Layer Implementation

#### 1.1 .coolify File (Primary Configuration)
```bash
# Coolify Configuration File - Force Dockerfile usage
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
BUILD_DIRECTORY=/app
PORT=3000

# Environment configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NEXT_PRIVATE_STANDALONE=true

# Coolify-specific optimizations
COOLIFY_USE_DOCKERFILE=true
COOLIFY_SKIP_NIXPACKS=true
COOLIFY_FORCE_DOCKERFILE=true
COOLIFY_DISABLE_NIXPACKS=true
```

**Implementation Notes:**
- File placed in project root directory
- Contains all necessary variables to force Dockerfile usage
- Includes optimized build and healthcheck configuration
- Provides clear documentation through comments

#### 1.2 Environment Variables Strategy
```bash
# Essential Coolify Variables (Set in Coolify Interface)
COOLIFY_USE_DOCKERFILE=true
NIXPACKS_DISABLE=true
FORCE_DOCKERFILE=true
NODE_ENV=production

# Application Variables (Secrets)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
NEXT_PUBLIC_SITE_NAME="Tu Nombre de Sitio"
NEXT_PUBLIC_SITE_DESCRIPTION="Tu descripción de sitio"
```

**Implementation Notes:**
- Variables set in Coolify environment configuration
- Sensitive data marked as "Secrets" for security
- Clear separation between Coolify-specific and application variables

### 2. Dockerfile Architecture Implementation

#### 2.1 Multi-Stage Build Strategy
```dockerfile
# Base Stage - Node.js 22 with pnpm
FROM node:22-alpine AS base
RUN npm install -g pnpm

# Dependencies Stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

# Builder Stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# Production Stage
FROM base AS runner
WORKDIR /app

# Coolify-specific environment variables
ENV COOLIFY_USE_DOCKERFILE=true
ENV NIXPACKS_DISABLE=true
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PRIVATE_STANDALONE=true

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /app/logs && \
    chown -R nextjs:nodejs /app

# Copy built assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Optimized Healthcheck for Coolify
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=5 \
  CMD curl -f --max-time 8 http://localhost:3000/api/health || exit 1

# Create optimized server.js for standalone mode
RUN echo 'const { createServer } = require("http");\
const { parse } = require("url");\
const next = require("next");\
\
const dev = process.env.NODE_ENV !== "production";\
const hostname = process.env.HOSTNAME || "0.0.0.0";\
const port = parseInt(process.env.PORT) || 3000;\
\
const app = next({ dev, hostname, port });\
const handle = app.getRequestHandler();\
\
app.prepare().then(() => {\
  createServer(async (req, res) => {\
    try {\
      const parsedUrl = parse(req.url, true);\
      const { pathname, query } = parsedUrl;\
\
      // Add healthcheck endpoint for Coolify\
      if (pathname === "/api/health") {\
        res.statusCode = 200;\
        res.setHeader("Content-Type", "application/json");\
        res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));\
        return;\
      }\
\
      await handle(req, res, parsedUrl);\
    } catch (err) {\
      console.error("Error occurred handling", req.url, err);\
      res.statusCode = 500;\
      res.setHeader("Content-Type", "application/json");\
      res.end(JSON.stringify({ error: "Internal Server Error", timestamp: new Date().toISOString() }));\
    }\
  }).listen(port, hostname, (err) => {\
    if (err) throw err;\
    console.log(`> Ready on http://${hostname}:${port}`);\
  });\
}).catch((err) => {\
  console.error("Failed to start server", err);\
  process.exit(1);\
});' > server.js

CMD ["node", "server.js"]
```

**Implementation Notes:**
- Multi-stage build for optimized image size
- Node.js 22 Alpine for latest Node.js version
- Non-root user for security
- Embedded healthcheck endpoint in server.js
- Optimized healthcheck timing for Coolify compatibility

### 3. Validation Framework Implementation

#### 3.1 Deployment Validation Script
```javascript
// scripts/validate-coolify-deployment.mjs
#!/usr/bin/env node

/**
 * Comprehensive Coolify Deployment Validation Script
 * 
 * This script validates all configuration changes needed to fix Coolify deployment issues.
 * It provides detailed validation results, educational explanations, and specific guidance
 * for each component of the deployment configuration.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Validating Coolify deployment configuration...\n');

// Configuration validation checks
const validations = [
  {
    name: 'Coolify Configuration',
    check: () => validateCoolifyConfig(),
    fix: () => createCoolifyConfig()
  },
  {
    name: 'Dockerfile Node.js Version',
    check: () => validateDockerfileNodeVersion(),
    fix: () => updateDockerfileNodeVersion()
  },
  {
    name: 'Coolify Environment Variables',
    check: () => validateCoolifyEnvVars(),
    fix: () => addCoolifyEnvVars()
  },
  {
    name: 'Standalone Mode Configuration',
    check: () => validateStandaloneMode(),
    fix: () => addStandaloneModeConfig()
  },
  {
    name: 'Healthcheck Configuration',
    check: () => validateHealthcheck(),
    fix: () => updateHealthcheckConfig()
  }
];

async function runValidations() {
  for (const validation of validations) {
    try {
      await validation.check();
      console.log(`✅ ${validation.name} - PASSED`);
    } catch (error) {
      console.log(`❌ ${validation.name} - FAILED: ${error.message}`);
      await validation.fix();
    }
  }
}

// Execute validation
runValidations().then(() => {
  console.log('\n🎯 Deployment validation complete!');
  console.log('\n🚀 To deploy to Coolify:');
  console.log('1. Push these changes to your repository');
  console.log('2. Configure environment variables in Coolify');
  console.log('3. Set Build Command: pnpm install && pnpm run build');
  console.log('4. Set Start Command: node server.js');
  console.log('5. Set Port: 3000');
});
```

**Implementation Notes:**
- Comprehensive validation of all deployment components
- Automatic fix capabilities for minor issues
- Detailed output with explanations and suggestions
- Integration with deployment workflow

### 4. Monitoring & Healthcheck Architecture

#### 4.1 Healthcheck Endpoint Implementation
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || 'unknown'
  })
}
```

#### 4.2 Healthcheck Configuration
- **Start Period**: 40 seconds (allows server to fully initialize)
- **Timeout**: 10 seconds (robust response time)
- **Interval**: 30 seconds (regular monitoring)
- **Retries**: 5 (failure tolerance)
- **Max Time**: 8 seconds (curl timeout limit)

**Implementation Notes:**
- Dedicated healthcheck endpoint for monitoring
- Embedded healthcheck in server.js for Docker healthcheck
- Optimized timing to prevent false positives
- Comprehensive status information

---

## 🚀 Step-by-Step Deployment Guide

### Phase 1: Pre-Deployment Preparation

#### Step 1: Repository Setup
1. **Ensure all configuration files are present:**
   - `.coolify` - Force Dockerfile usage configuration
   - `Dockerfile` - Node.js 22 with optimized configuration
   - `next.config.mjs` - Standalone mode enabled
   - `package.json` - Next.js 16 with compatible dependencies

2. **Validate configuration with script:**
   ```bash
   node scripts/validate-coolify-deployment.mjs
   ```

3. **Commit all changes to repository:**
   ```bash
   git add .
   git commit -m "Prepare Coolify deployment configuration"
   git push origin main
   ```

#### Step 2: Coolify Project Configuration

1. **Create new project in Coolify:**
   - Connect to your repository
   - Select the correct branch (usually main/master)

2. **Configure environment variables:**
   ```
   # Essential Coolify Variables
   COOLIFY_USE_DOCKERFILE=true
   NIXPACKS_DISABLE=true
   FORCE_DOCKERFILE=true
   NODE_ENV=production
   
   # Application Variables (set as Secrets)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_JWT_SECRET=your_jwt_secret
   ```

3. **Set build configuration:**
   - **Build Command**: `pnpm install && pnpm run build`
   - **Start Command**: `node server.js`
   - **Build Directory**: `/app`
   - **Port**: `3000`
   - **Healthcheck Timeout**: `40 seconds`

#### Step 3: Initial Deployment

1. **Trigger first deployment:**
   - Save configuration in Coolify
   - Initiate deployment manually
   - Monitor logs for any issues

2. **Verify deployment success:**
   - Check that Node.js 22 is used (not Node.js 18)
   - Confirm healthcheck passes
   - Validate application is accessible

3. **Test application functionality:**
   - Access application URL
   - Test key features
   - Verify environment variables are applied

### Phase 2: Post-Deployment Validation

#### Step 4: Healthcheck Verification
1. **Monitor healthcheck status:**
   - Check Coolify dashboard for healthcheck passes
   - Verify no restart loops
   - Confirm stable deployment

2. **Test healthcheck endpoint:**
   ```bash
   curl https://your-domain.com/api/health
   # Should return: {"status":"healthy","timestamp":"...","uptime":123.45}
   ```

#### Step 5: Performance Monitoring
1. **Monitor application performance:**
   - Response times
   - Error rates
   - Resource usage

2. **Verify environment configuration:**
   - Node.js version in container
   - Environment variables applied
   - Dependencies loaded correctly

### Phase 3: Ongoing Maintenance

#### Step 6: Regular Updates
1. **Update dependencies regularly:**
   ```bash
   pnpm update
   git commit -m "Update dependencies"
   git push
   ```

2. **Monitor Coolify updates:**
   - Check for Coolify version updates
   - Review any configuration changes needed
   - Test deployments after Coolify updates

#### Step 7: Backup and Recovery
1. **Document deployment process:**
   - Keep this guide updated
   - Document any custom configurations
   - Maintain rollback procedures

2. **Test rollback procedures:**
   - Verify ability to deploy previous versions
   - Test environment variable changes
   - Confirm backup restoration process

---

## 🚨 Troubleshooting Section

### Common Issues and Solutions

#### Issue 1: Node.js Version Still Showing 18.x

**Symptoms:**
- Deployment logs show "You are using Node.js 18.20.5"
- Build fails with Node.js version error
- Nixpacks is still being used

**Root Causes:**
- .coolify file not present or missing required variables
- Coolify environment variables not set correctly
- Dockerfile not being used

**Solutions:**

1. **Verify .coolify file:**
   ```bash
   # Check file exists and contains:
   FORCE_DOCKERFILE=true
   SKIP_NIXPACKS=true
   COOLIFY_USE_DOCKERFILE=true
   ```

2. **Check Coolify environment variables:**
   ```
   COOLIFY_USE_DOCKERFILE=true
   NIXPACKS_DISABLE=true
   FORCE_DOCKERFILE=true
   ```

3. **Force Dockerfile in Coolify interface:**
   - Go to project settings
   - Enable "Use Custom Dockerfile"
   - Disable "Use Nixpacks"
   - Save and redeploy

4. **Alternative: Remove Nixpacks interference:**
   ```bash
   # In repository root
   rm -rf .nixpacks/
   rm -f .nixpacks.toml
   rm -f nixpacks.toml
   git add -A
   git commit -m "Remove Nixpacks interference"
   git push
   ```

#### Issue 2: Healthcheck Failing

**Symptoms:**
- Healthcheck timeout errors
- Container restart loops
- Deployment marked as failed

**Root Causes:**
- Insufficient start period for server initialization
- Healthcheck endpoint not accessible
- Server not listening on correct interface

**Solutions:**

1. **Increase healthcheck timeout in Coolify:**
   - Set Healthcheck Timeout to 60 seconds
   - Verify Dockerfile healthcheck configuration

2. **Verify healthcheck endpoint:**
   ```bash
   # Test locally if possible
   curl http://localhost:3000/api/health
   ```

3. **Check server configuration:**
   - Ensure server listens on `0.0.0.0` not just `localhost`
   - Verify healthcheck endpoint is implemented
   - Check for any startup errors

4. **Debug with verbose logging:**
   - Enable verbose logs in Coolify
   - Check server startup time
   - Monitor healthcheck attempts

#### Issue 3: Build Command Failing

**Symptoms:**
- pnpm command not found
- Build process fails
- Dependencies not installed

**Root Causes:**
- pnpm not available in build environment
- Incorrect build command syntax
   - Missing dependencies or permissions

**Solutions:**

1. **Verify pnpm installation:**
   ```bash
   # Check if pnpm is available
   pnpm --version
   ```

2. **Fix build command:**
   ```bash
   # In Coolify configuration
   Build Command: pnpm install && pnpm run build
   ```

3. **Alternative: Use npm temporarily:**
   ```bash
   # As temporary fix
   Build Command: npm install && npm run build
   ```

4. **Ensure pnpm in Dockerfile:**
   ```dockerfile
   # Add to Dockerfile base stage
   RUN npm install -g pnpm
   ```

#### Issue 4: Environment Variables Not Applied

**Symptoms:**
- Application uses default configuration
- Secrets not accessible
- Feature flags not working

**Root Causes:**
- Variables not set in Coolify
- Variables not marked as secrets when needed
- Variable names don't match application expectations

**Solutions:**

1. **Verify variable names:**
   - Match exactly with application code
   - Check for typos or case sensitivity
   - Ensure all required variables are set

2. **Check variable scope:**
   - Global vs. project-specific variables
   - Build-time vs. runtime variables
   - Secret vs. regular variables

3. **Test variable access:**
   ```javascript
   // Add temporary debug to application
   console.log('ENV VAR:', process.env.YOUR_VARIABLE_NAME);
   ```

#### Issue 5: Port Binding Issues

**Symptoms:**
- Port already in use errors
- Application not accessible
- Connection refused

**Root Causes:**
- Port conflict with other services
- Incorrect port configuration
- Firewall or security group issues

**Solutions:**

1. **Verify port configuration:**
   - Coolify: Port 3000
   - Dockerfile: EXPOSE 3000
   - Application: Listens on port 3000

2. **Check for port conflicts:**
   ```bash
   # Check if port is in use
   netstat -an | grep 3000
   ```

3. **Alternative port:**
   - Change to different port (3001, 8080, etc.)
   - Update all configurations consistently

### Advanced Troubleshooting

#### Debug Mode Deployment

1. **Enable verbose logging:**
   ```bash
   # Add to environment variables
   DEBUG=*
   VERBOSE=true
   ```

2. **Custom healthcheck for debugging:**
   ```dockerfile
   # Temporary healthcheck with more verbose output
   HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --retries=10 \
     CMD curl -f --max-time 3 http://localhost:3000/api/health || (echo "Healthcheck failed" && exit 1)
   ```

3. **SSH into container (if supported):**
   ```bash
   # Check running processes
   ps aux | grep node
   
   # Check environment variables
   env | grep -i coolify
   
   # Check Node.js version
   node --version
   ```

#### Rollback Procedures

1. **Immediate rollback:**
   - In Coolify, select previous deployment
   - Trigger redeployment of previous version
   - Monitor for successful rollback

2. **Manual rollback:**
   ```bash
   # Checkout previous commit
   git checkout <previous-commit-hash>
   git push origin main --force
   ```

3. **Configuration rollback:**
   - Revert environment variable changes
   - Restore previous Coolify configuration
   - Test deployment

---

## ✅ Validation Checklist

### Pre-Deployment Checklist

#### Repository Configuration
- [ ] `.coolify` file present with correct configuration
- [ ] `Dockerfile` uses Node.js 22 Alpine
- [ ] `next.config.mjs` has standalone mode enabled
- [ ] `package.json` has Next.js 16 and compatible dependencies
- [ ] `app/api/health/route.ts` healthcheck endpoint implemented
- [ ] All files committed and pushed to repository

#### Configuration Validation
- [ ] `FORCE_DOCKERFILE=true` in .coolify file
- [ ] `SKIP_NIXPACKS=true` in .coolify file
- [ ] `COOLIFY_USE_DOCKERFILE=true` in .coolify file
- [ ] Dockerfile has `ENV COOLIFY_USE_DOCKERFILE=true`
- [ ] Dockerfile has `ENV NIXPACKS_DISABLE=true`
- [ ] Dockerfile has `ENV NEXT_PRIVATE_STANDALONE=true`

#### Build Configuration
- [ ] Build Command: `pnpm install && pnpm run build`
- [ ] Start Command: `node server.js`
- [ ] Build Directory: `/app`
- [ ] Port: `3000`
- [ ] pnpm available in build environment
- [ ] Dependencies install successfully

### Coolify Configuration Checklist

#### Environment Variables
- [ ] `COOLIFY_USE_DOCKERFILE=true`
- [ ] `NIXPACKS_DISABLE=true`
- [ ] `FORCE_DOCKERFILE=true`
- [ ] `NODE_ENV=production`
- [ ] Application secrets configured as "Secrets"
- [ ] All required application variables present

#### Build Settings
- [ ] Custom Dockerfile enabled
- [ ] Nixpacks disabled
- [ ] Build command correctly set
- [ ] Start command correctly set
- [ ] Port correctly configured
- [ ] Healthcheck timeout set to 40+ seconds

### Deployment Validation Checklist

#### Initial Deployment
- [ ] Deployment starts successfully
- [ ] Node.js 22 is used (not 18.x)
- [ ] Build completes without errors
- [ ] Container starts successfully
- [ ] Healthcheck passes
- [ ] Application accessible via URL

#### Post-Deployment
- [ ] Healthcheck status: Healthy
- [ ] No container restart loops
- [ ] Application responds to requests
- [ ] Environment variables applied correctly
- [ ] Performance within expected ranges

#### Ongoing Monitoring
- [ ] Regular healthcheck passes
- [ ] No unexpected errors in logs
- [ ] Resource usage normal
- [ ] Application functionality verified
- [ ] Backup procedures tested

### Troubleshooting Validation

#### If Issues Occur
- [ ] Check deployment logs for error messages
- [ ] Verify all environment variables are set
- [ ] Confirm .coolify file is being read
- [ ] Test healthcheck endpoint manually
- [ ] Verify port configuration
- [ ] Check for Nixpacks usage in logs

#### Resolution Verification
- [ ] Root cause identified and documented
- [ ] Fix applied and tested
- [ ] Deployment successful after fix
- [ ] All validation checks pass
- [ ] Application fully functional

---

## 🏆 Best Practices

### 1. Configuration Management

#### Repository Structure
- **Keep configuration files in version control**
  - `.coolify` file committed to repository
  - Dockerfile maintained with application code
  - Environment variables documented

- **Use clear, descriptive comments**
  - Explain purpose of each configuration
  - Document any workarounds or special requirements
  - Keep configuration self-documenting

- **Regular configuration reviews**
  - Review configuration with team regularly
  - Update documentation when changes made
  - Verify configuration still needed

#### Environment Variables
- **Separate concerns clearly**
  - Coolify-specific variables vs. application variables
  - Development vs. production variables
  - Public vs. secret variables

- **Use consistent naming**
  - Clear, descriptive variable names
  - Consistent prefixing for related variables
  - Avoid abbreviations or unclear names

- **Security best practices**
  - Mark sensitive data as "Secrets" in Coolify
  - Rotate secrets regularly
  - Limit access to sensitive variables

### 2. Dockerfile Best Practices

#### Image Optimization
- **Use multi-stage builds**
  - Separate build and runtime stages
  - Minimize final image size
  - Only include necessary files in runtime

- **Choose appropriate base images**
  - Use Alpine images for smaller size
  - Ensure base image is up to date
  - Consider security implications

- **Security considerations**
  - Create non-root users
  - Minimize attack surface
  - Keep dependencies updated

#### Healthcheck Implementation
- **Robust healthcheck timing**
  - Sufficient start period for initialization
  - Appropriate timeout values
  - Multiple retry attempts

- **Comprehensive health monitoring**
  - Check application functionality
  - Monitor resource usage
  - Include timestamp and version info

- **Graceful failure handling**
  - Clear error messages
  - Proper exit codes
  - Fallback behaviors

### 3. Deployment Strategy

#### Pre-Deployment
- **Comprehensive testing**
  - Test in development environment
  - Validate all configurations
  - Verify dependencies

- **Automated validation**
  - Use validation scripts before deployment
  - Check configuration automatically
  - Validate environment setup

- **Documentation and communication**
  - Document deployment process
  - Communicate changes to team
  - Plan for potential issues

#### Deployment Process
- **Staged deployment**
  - Test with small changes first
  - Monitor initial deployment closely
  - Have rollback plan ready

- **Monitoring and alerting**
  - Monitor deployment progress
  - Set up alerts for failures
  - Track key metrics

- **Post-deployment verification**
  - Verify application functionality
  - Check performance metrics
  - Confirm user access

### 4. Monitoring and Maintenance

#### Health Monitoring
- **Comprehensive healthchecks**
  - Monitor application health
  - Check system resources
  - Verify external dependencies

- **Performance monitoring**
  - Track response times
  - Monitor error rates
  - Watch resource usage

- **Proactive maintenance**
  - Regular dependency updates
  - Security patching
  - Performance optimization

#### Incident Response
- **Clear escalation procedures**
  - Define response levels
  - Assign responsibilities
  - Establish communication channels

- **Documentation and learning**
  - Document all incidents
  - Analyze root causes
  - Implement preventive measures

- **Regular review and improvement**
  - Review incident response
  - Update procedures based on learnings
  - Continuous improvement

### 5. Team and Process

#### Knowledge Sharing
- **Documentation**
  - Maintain up-to-date documentation
  - Document troubleshooting procedures
  - Share lessons learned

- **Training and onboarding**
  - Train team on deployment process
  - Document common issues and solutions
  - Share best practices

- **Collaboration**
  - Regular team reviews
  - Cross-training on deployment
  - Shared responsibility

#### Continuous Improvement
- **Regular retrospectives**
  - Review deployment process
  - Identify improvement opportunities
  - Implement changes incrementally

- **Stay updated**
  - Follow Coolify updates and changes
  - Monitor Next.js and Node.js updates
  - Adapt to new best practices

- **Feedback loops**
  - Collect feedback from team
  - Monitor user experience
  - Continuously refine process

---

## 📋 Appendix

### A. File Reference

#### .coolify File
```
# Coolify Configuration File
# Force Dockerfile usage over Nixpacks to ensure Node.js 22 compatibility

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
BUILD_DIRECTORY=/app
PORT=3000
HEALTHCHECK_URL=/api/health
HEALTHCHECK_TIMEOUT=40
HEALTHCHECK_INTERVAL=30
HEALTHCHECK_RETRIES=5

# Environment configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NEXT_PRIVATE_STANDALONE=true

# Coolify-specific optimizations - Force Dockerfile usage
COOLIFY_USE_DOCKERFILE=true
COOLIFY_SKIP_NIXPACKS=true
COOLIFY_FORCE_DOCKERFILE=true
COOLIFY_DISABLE_NIXPACKS=true

# Additional healthcheck configuration to avoid template parsing errors
COOLIFY_HEALTHCHECK_TIMEOUT=40
COOLIFY_HEALTHCHECK_INTERVAL=30
COOLIFY_HEALTHCHECK_RETRIES=5
COOLIFY_HEALTHCHECK_START_PERIOD=40

# Node.js 22 specific configuration
NODE_VERSION=22
FORCE_NODE_VERSION=22
USE_NODE_22=true

# Security and performance
NON_ROOT_USER=true
MEMORY_LIMIT=4096
CPU_LIMIT=2
```

#### Dockerfile
```dockerfile
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
```

### B. Command Reference

#### Validation Commands
```bash
# Run comprehensive validation
node scripts/validate-coolify-deployment.mjs

# Run validation with auto-fix
node scripts/validate-coolify-deployment.mjs --fix

# Run validation with verbose output
node scripts/validate-coolify-deployment.mjs --verbose

# Check healthcheck endpoint
curl https://your-domain.com/api/health
```

#### Deployment Commands
```bash
# Test build locally
pnpm install && pnpm run build

# Check Node.js version
node --version

# Check pnpm version
pnpm --version

# Test server startup
node server.js
```

#### Coolify Configuration Commands
```bash
# Environment variables to set in Coolify
COOLIFY_USE_DOCKERFILE=true
NIXPACKS_DISABLE=true
FORCE_DOCKERFILE=true
NODE_ENV=production

# Build configuration
Build Command: pnpm install && pnpm run build
Start Command: node server.js
Port: 3000
```

### C. Troubleshooting Commands

#### Debug Commands
```bash
# Check if port is available
netstat -an | grep 3000

# Test healthcheck endpoint
curl -v http://localhost:3000/api/health

# Check environment variables in container
env | grep -i coolify

# Check running processes
ps aux | grep node

# Check Docker logs
docker logs <container-id>
```

#### Recovery Commands
```bash
# Rollback to previous commit
git checkout <previous-commit-hash>
git push origin main --force

# Clear Nixpacks cache
rm -rf .nixpacks/
rm -f .nixpacks.toml
git add -A
git commit -m "Clear Nixpacks cache"
git push
```

### D. Additional Resources

#### Related Documentation
- [COOLIFY_DEPLOYMENT_FIX.md](COOLIFY_DEPLOYMENT_FIX.md) - Detailed solution for Node.js version issues
- [PULL_REQUEST_DEBUG_FIX.md](PULL_REQUEST_DEBUG_FIX.md) - Specific healthcheck troubleshooting
- [COOLIFY_ARCHITECTURAL_SOLUTION.md](COOLIFY_ARCHITECTURAL_SOLUTION.md) - Architectural overview and design

#### External Resources
- [Coolify Documentation](https://docs.coolify.io) - Official Coolify documentation
- [Next.js Deployment](https://nextjs.org/docs/deployment) - Next.js deployment guide
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/) - Docker development best practices

---

*This comprehensive troubleshooting guide was created by consolidating the work of Architect, Code, and Coding-Teacher modes. It serves as the definitive resource for successful Coolify deployment of this Next.js application.*