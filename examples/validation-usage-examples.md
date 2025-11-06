# Validation Script Usage Examples

This document provides practical examples of how to use the Coolify deployment validation script in different scenarios.

## Basic Usage Examples

### 1. Initial Validation Run

```bash
# Run basic validation
node scripts/validate-coolify-deployment.mjs
```

**Expected Output:**
```
🚀 Starting Comprehensive Coolify Deployment Validation

🔍 Running validation checks...

📁 Validating .coolify configuration file...
✅ .coolify file: All required variables present

🐳 Validating Dockerfile compliance...
✅ Dockerfile: All compliance checks passed

⚙️  Validating Next.js configuration...
✅ Next.js config: Standalone mode configured

📦 Validating package.json dependencies...
ℹ️  package.json: Next.js 16 detected (requires Node.js 20.9.0+), Node.js version requirement: >=18.0.0

💓 Validating healthcheck endpoint...
⏭️  Healthcheck endpoint: Server not running - cannot test endpoint

🔨 Validating build process...
✅ Build process: Build command syntax valid

================================================================================
📊 VALIDATION RESULTS
================================================================================

SUMMARY:
  ✅ Passed: 4
  ❌ Failed: 0
  ⚠️  Skipped: 1
  💥 Errors: 0
  ℹ️  Info: 1

DETAILED RESULTS:
  ✅ .coolify file: All required variables present
  ✅ Dockerfile: All compliance checks passed
  ✅ Next.js config: Standalone mode configured
  ℹ️  package.json: Next.js 16 detected (requires Node.js 20.9.0+), Node.js version requirement: >=18.0.0
  ⚠️  Healthcheck endpoint: Server not running - cannot test endpoint
  ✅ Build process: Build command syntax valid

================================================================================
🎉 ALL VALIDATIONS PASSED! Your Coolify deployment configuration is ready.
================================================================================

🚀 NEXT STEPS FOR COOLIFY DEPLOYMENT
================================================================================

1. COOLIFY ENVIRONMENT VARIABLES:
   Add these environment variables to your Coolify service:
   • COOLIFY_USE_DOCKERFILE=true
   • NIXPACKS_DISABLE=true
   • FORCE_DOCKERFILE=true
   • NODE_ENV=production
   • NEXT_TELEMETRY_DISABLED=1

2. COOLIFY SERVICE CONFIGURATION:
   • Build Command: pnpm install && pnpm run build
   • Start Command: node server.js
   • Port: 3000
   • Healthcheck Timeout: 40 seconds
   • Healthcheck Path: /api/health

3. PRE-DEPLOYMENT CHECKLIST:
   ☐ All validation checks pass
   ☐ .coolify file committed to repository
   ☐ Dockerfile uses Node.js 22
   ☐ Healthcheck endpoint implemented

4. TROUBLESHOOTING:
   If deployment fails:
   • Check Coolify logs for Nixpacks usage
   • Verify Node.js version in container
   • Ensure healthcheck has sufficient start period (40s)
   • Confirm all environment variables are set

📖 For more information, see:
   • COOLIFY_DEPLOYMENT_SOLUTION.md
   • COOLIFY_DEPLOYMENT_FIX.md
   • PULL_REQUEST_DEBUG_FIX.md
================================================================================
```

### 2. Validation with Auto-Fix

```bash
# Run validation with auto-fix for minor issues
node scripts/validate-coolify-deployment.mjs --fix
```

**Example Output (when .coolify file is missing):**
```
📁 Validating .coolify configuration file...
❌ .coolify file: File does not exist
  📝 The .coolify file is required to force Dockerfile usage over Nixpacks.
  💡 Creating .coolify file with required configuration
✅ Created .coolify file with default configuration
✅ .coolify file: All required variables present
```

### 3. Verbose Validation

```bash
# Run validation with detailed output
node scripts/validate-coolify-deployment.mjs --verbose
```

**Example Verbose Output:**
```
📁 Validating .coolify configuration file...
  ✅ .coolify file: All required variables present
     📝 The .coolify file forces Coolify to use Dockerfile instead of Nixpacks.
     💡 All required configuration variables are present.

🐳 Validating Dockerfile compliance...
  ✅ Dockerfile: All compliance checks passed
     📝 Dockerfile uses Node.js 22 and has proper healthcheck configuration.
     💡 Configuration is optimized for Coolify deployment.
```

## Common Validation Scenarios

### Scenario 1: Missing .coolify File

**Problem:**
```
❌ .coolify file: File does not exist
  📝 The .coolify file is required to force Dockerfile usage over Nixpacks.
  💡 Create .coolify file with required configuration
```

**Solution:**
```bash
# Use auto-fix to create the file
node scripts/validate-coolify-deployment.mjs --fix
```

**Result:**
```
✅ Created .coolify file with default configuration
✅ .coolify file: All required variables present
```

### Scenario 2: Dockerfile Using Node.js 18

**Problem:**
```
❌ Dockerfile: Failed checks: Node.js 22 base image
  📝 Dockerfile must use Node.js 22, not Node.js 18.
  💡 Update Dockerfile to use 'FROM node:22-alpine'
```

**Solution:**
Manually update Dockerfile:
```dockerfile
# Change from:
FROM node:18-alpine AS base

# Change to:
FROM node:22-alpine AS base
```

### Scenario 3: Missing Healthcheck Configuration

**Problem:**
```
❌ Dockerfile: Failed checks: Healthcheck configuration
  📝 Dockerfile missing proper healthcheck with 40s start period.
  💡 Add healthcheck: HEALTHCHECK --start-period=40s --timeout=10s --retries=5
```

**Solution:**
Add to Dockerfile:
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=5 \
  CMD curl -f --max-time 8 http://localhost:3000/api/health || exit 1
```

### Scenario 4: Server Running - Healthcheck Testable

**When server is running on port 3000:**
```
💓 Validating healthcheck endpoint...
✅ Healthcheck endpoint: Endpoint responding correctly
```

**When server is not running:**
```
💓 Validating healthcheck endpoint...
⚠️  Healthcheck endpoint: Server not running - cannot test endpoint
  📝 Healthcheck can only be tested when server runs on port 3000.
  💡 Start server and re-run validation, or check Docker healthcheck config
```

## Integration Examples

### GitHub Actions CI/CD Integration

```yaml
# .github/workflows/deploy.yml
name: Deploy to Coolify

on:
  push:
    branches: [ main ]

jobs:
  validate-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Validate Coolify Deployment
        run: node scripts/validate-coolify-deployment.mjs
      
      - name: Deploy to Coolify
        if: success()
        run: echo "Proceed with Coolify deployment"
```

### Pre-commit Hook Integration

```bash
#!/bin/sh
# .git/hooks/pre-commit

echo "Running Coolify deployment validation..."
node scripts/validate-coolify-deployment.mjs

if [ $? -ne 0 ]; then
  echo "❌ Deployment validation failed. Commit blocked."
  echo "💡 Run 'node scripts/validate-coolify-deployment.mjs --verbose' for details"
  exit 1
fi
```

### Local Development Workflow

```bash
#!/bin/bash
# deploy-check.sh

echo "🔍 Running pre-deployment validation..."
node scripts/validate-coolify-deployment.mjs

if [ $? -eq 0 ]; then
  echo "✅ All validations passed!"
  echo "🚀 Ready for Coolify deployment"
else
  echo "❌ Validation failed. Please fix issues before deploying."
  exit 1
fi
```

## Error Resolution Examples

### Error: pnpm Not Found

**Problem:**
```
❌ Build process: pnpm not available
  📝 pnpm is required for dependency installation and building.
  💡 Install pnpm: npm install -g pnpm
```

**Solution:**
```bash
npm install -g pnpm
# Re-run validation
node scripts/validate-coolify-deployment.mjs
```

### Error: Build Command Syntax Invalid

**Problem:**
```
❌ Build process: Build command syntax invalid
  📝 Build command cannot be executed properly.
  💡 Check package.json scripts and dependencies
```

**Solution:**
Check `package.json`:
```json
{
  "scripts": {
    "build": "next build"
  }
}
```

Ensure dependencies are installed:
```bash
pnpm install
```

### Error: Healthcheck Endpoint Test Failed

**Problem:**
```
❌ Healthcheck endpoint: Endpoint test failed: HTTP 500
  📝 Healthcheck endpoint must respond with 200 status and proper JSON.
  💡 Fix healthcheck endpoint implementation
```

**Solution:**
Check `app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
}
```

## Best Practices

### 1. Regular Validation

Run validation regularly during development:
```bash
# Add to package.json
"scripts": {
  "validate:coolify": "node scripts/validate-coolify-deployment.mjs"
}
```

### 2. Pre-Deployment Checklist

Always run validation before deploying:
```bash
# Before pushing to production
git add .
git commit -m "Prepare for Coolify deployment"
node scripts/validate-coolify-deployment.mjs
git push origin main
```

### 3. Team Onboarding

Use validation script for team education:
```bash
# New team member setup
echo "Running Coolify deployment validation for education..."
node scripts/validate-coolify-deployment.mjs --verbose
```

### 4. Documentation Reference

The script provides educational value:
- Each validation explains **why** it's important
- Error messages include **specific guidance**
- Suggestions provide **actionable steps**
- Output serves as **deployment checklist**

## Summary

The validation script is designed to:
1. **Prevent deployment failures** by catching issues early
2. **Educate team members** about Coolify requirements
3. **Provide clear guidance** for resolving issues
4. **Ensure deployment readiness** with comprehensive checks
5. **Integrate with workflows** for continuous validation

Use it regularly to maintain deployment readiness and avoid common Coolify deployment pitfalls.