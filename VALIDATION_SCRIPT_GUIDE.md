# Coolify Deployment Validation Script

## Overview

The `validate-coolify-deployment.mjs` script is a comprehensive validation tool designed to ensure all configuration changes are correctly implemented for successful Coolify deployment. This script addresses the common issues that prevent Next.js applications from deploying properly on Coolify, particularly those related to Node.js version mismatches and healthcheck failures.

## Purpose and Importance

### Why This Script Exists

Coolify deployment failures often occur due to:
1. **Node.js Version Mismatch**: Coolify's default Nixpacks system uses Node.js 18, but modern Next.js applications require Node.js 22
2. **Missing Dockerfile Configuration**: Without proper Dockerfile enforcement, Coolify falls back to Nixpacks
3. **Healthcheck Timing Issues**: Improperly configured healthchecks fail during container startup
4. **Missing Environment Variables**: Critical configuration variables are not set

### What This Script Validates

The script performs 6 comprehensive validation checks:

1. **.coolify File Validation**
   - Ensures the file exists and contains required configuration
   - Validates variables that force Dockerfile usage over Nixpacks
   - Checks build and start commands are properly configured

2. **Dockerfile Compliance**
   - Verifies Node.js 22 base image usage
   - Confirms proper healthcheck configuration with 40s start period
   - Validates Coolify-specific environment variables
   - Ensures standalone mode and non-root user configuration

3. **Next.js Configuration**
   - Checks for standalone mode output configuration
   - Validates production-ready settings

4. **Package.json Dependencies**
   - Verifies dependency compatibility with Node.js 22
   - Checks Next.js version requirements

5. **Healthcheck Endpoint Functionality**
   - Validates API route exists
   - Tests endpoint response when server is running
   - Confirms proper JSON response format

6. **Build Process Validation**
   - Ensures pnpm is available
   - Validates build command syntax
   - Checks dependency installation process

## Usage

### Basic Usage

```bash
node scripts/validate-coolify-deployment.mjs
```

### With Auto-Fix (Limited)

```bash
node scripts/validate-coolify-deployment.mjs --fix
```

### Verbose Output

```bash
node scripts/validate-coolify-deployment.mjs --verbose
```

### Help

```bash
node scripts/validate-coolify-deployment.mjs --help
```

## Validation Results

### Result Statuses

- **✅ PASS**: Validation successful
- **❌ FAIL**: Validation failed - action required
- **⏭️ SKIP**: Validation skipped (e.g., server not running)
- **💥 ERROR**: Script execution error
- **ℹ️ INFO**: Informational result

### Exit Codes

- **0**: All validations passed
- **1**: One or more validations failed
- **2**: Script execution error

## Detailed Validation Explanations

### 1. .coolify File Validation

**Why it's important**: The `.coolify` file forces Coolify to use your custom Dockerfile instead of its default Nixpacks system. Without this file, Coolify will use Node.js 18 instead of the required Node.js 22.

**What it checks**:
- File existence
- `FORCE_DOCKERFILE=true` - Forces Dockerfile usage
- `SKIP_NIXPACKS=true` - Disables Nixpacks completely
- `COOLIFY_USE_DOCKERFILE=true` - Coolify-specific Dockerfile enforcement
- Proper build and start commands
- Correct port configuration

**Common issues**:
- Missing file entirely
- Missing critical environment variables
- Incorrect build/start commands

### 2. Dockerfile Compliance

**Why it's important**: The Dockerfile must use Node.js 22 and include proper healthcheck configuration to work with Coolify's deployment system.

**What it checks**:
- `FROM node:22-alpine` - Node.js 22 base image
- `HEALTHCHECK --start-period=40s` - Proper healthcheck timing
- Coolify environment variables
- `NEXT_PRIVATE_STANDALONE=true` - Standalone mode
- `USER nextjs` - Non-root user
- `server.js` creation and execution

**Common issues**:
- Using older Node.js versions (18, 16)
- Missing or incorrect healthcheck configuration
- Missing Coolify-specific variables
- Running as root user

### 3. Next.js Configuration

**Why it's important**: Next.js must be configured for standalone mode to work properly in Docker containers.

**What it checks**:
- `output: 'standalone'` configuration
- Production-ready settings

**Common issues**:
- Missing standalone mode configuration
- Development-only settings

### 4. Package.json Dependencies

**Why it's important**: Dependencies must be compatible with Node.js 22 to prevent runtime errors.

**What it checks**:
- Next.js version (should be 16+ for Node.js 22 compatibility)
- Node.js version requirements
- General dependency health

**Common issues**:
- Outdated Next.js versions
- Incompatible dependencies

### 5. Healthcheck Endpoint

**Why it's important**: Docker uses healthchecks to determine if a container is running properly. A failing healthcheck causes deployment failures.

**What it checks**:
- API route existence (`app/api/health/route.ts`)
- Endpoint responsiveness (when server running)
- Proper JSON response format
- HTTP 200 status

**Common issues**:
- Missing healthcheck endpoint
- Incorrect response format
- Server not responding

### 6. Build Process

**Why it's important**: The build process must work correctly for deployment to succeed.

**What it checks**:
- pnpm availability
- Build command syntax
- Dependency installation

**Common issues**:
- pnpm not installed
- Invalid build commands
- Missing dependencies

## Auto-Fix Capabilities

The script can automatically fix:
- Missing `.coolify` file creation
- Missing variables in `.coolify` file

**Note**: Most Dockerfile fixes require manual intervention due to complexity.

## Pre-Deployment Checklist

Before deploying to Coolify, ensure:

1. ✅ All validation checks pass
2. ✅ `.coolify` file is committed to repository
3. ✅ Dockerfile uses Node.js 22
4. ✅ Healthcheck endpoint is implemented
5. ✅ Next.js standalone mode is configured
6. ✅ Coolify environment variables are set:
   - `COOLIFY_USE_DOCKERFILE=true`
   - `NIXPACKS_DISABLE=true`
   - `FORCE_DOCKERFILE=true`
   - `NODE_ENV=production`

## Coolify Service Configuration

When creating your Coolify service:

```
Build Command: pnpm install && pnpm run build
Start Command: node server.js
Port: 3000
Healthcheck Timeout: 40 seconds
Healthcheck Path: /api/health
```

## Troubleshooting

### If Validations Fail

1. **Review the specific error messages** - Each failure includes detailed explanation and suggestions
2. **Check the documentation files**:
   - `COOLIFY_DEPLOYMENT_SOLUTION.md`
   - `COOLIFY_DEPLOYMENT_FIX.md`
   - `PULL_REQUEST_DEBUG_FIX.md`
3. **Run validation again after fixes** - Ensure all issues are resolved
4. **Test locally** - Run the application locally to verify it works

### Common Deployment Issues

**Nixpacks still being used**:
- Ensure `.coolify` file is present and contains correct variables
- Check Coolify environment variables are set
- Verify file is committed to repository

**Healthcheck failures**:
- Ensure 40-second start period is configured
- Verify healthcheck endpoint returns proper response
- Check server startup time

**Node.js version issues**:
- Confirm Dockerfile uses `node:22-alpine`
- Check for any Node.js version overrides
- Verify Coolify environment variables

## Educational Value

This script serves as both a validation tool and an educational resource:

1. **Learn about Coolify requirements** - Each validation explains why it's important
2. **Understand common pitfalls** - Detailed error messages explain what goes wrong
3. **Best practices guidance** - Suggestions provide actionable improvement steps
4. **Deployment readiness** - Clear indication of when your application is ready for Coolify

## Integration with CI/CD

You can integrate this script into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Validate Coolify Deployment
  run: node scripts/validate-coolify-deployment.mjs
```

This ensures your application is always deployment-ready before pushing to production.

## Support and Updates

For issues or questions:
1. Check the validation output for specific guidance
2. Review the documentation files in the repository
3. Run the script with `--verbose` for detailed information
4. Ensure you're using the latest version of the script

The script is designed to be self-documenting and provide clear guidance for resolving any issues it detects.