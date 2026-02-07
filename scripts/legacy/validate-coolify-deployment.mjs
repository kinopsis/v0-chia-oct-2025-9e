#!/usr/bin/env node

/**
 * Comprehensive Coolify Deployment Validation Script
 * 
 * This script validates all configuration changes needed to fix Coolify deployment issues.
 * It provides detailed validation results, educational explanations, and specific guidance
 * for each component of the deployment configuration.
 * 
 * Usage: node scripts/validate-coolify-deployment.mjs [--fix] [--verbose]
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  PORT: 3000,
  HEALTHCHECK_TIMEOUT: 5000, // 5 seconds
  VALIDATION_TIMEOUT: 30000, // 30 seconds for server startup check
};

// Global state
let validationResults = [];
let options = {};
let serverCheckActive = false;

/**
 * Main validation function that orchestrates all checks
 */
async function validateCoolifyDeployment() {
  console.log('🚀 Starting Comprehensive Coolify Deployment Validation\n');
  console.log('='.repeat(80));
  
  // Parse command line arguments
  parseArguments();
  
  // Run all validation checks
  await runAllValidations();
  
  // Display results
  displayValidationResults();
  
  // Provide next steps
  displayNextSteps();
  
  // Return success status
  const allPassed = validationResults.every(result => result.status === 'PASS');
  process.exit(allPassed ? 0 : 1);
}

/**
 * Parse command line arguments
 */
function parseArguments() {
  const args = process.argv.slice(2);
  options = {
    fix: args.includes('--fix'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    help: args.includes('--help') || args.includes('-h')
  };
  
  if (options.help) {
    displayHelp();
    process.exit(0);
  }
}

/**
 * Display help information
 */
function displayHelp() {
  console.log(`
COOLIFY DEPLOYMENT VALIDATION SCRIPT

Usage: node scripts/validate-coolify-deployment.mjs [options]

Options:
  --fix        Automatically fix minor issues when possible
  --verbose, -v    Enable verbose output with detailed information
  --help, -h       Show this help message

This script validates all configuration changes needed for successful Coolify deployment:
- .coolify file presence and content
- Dockerfile compliance with Node.js 22 and healthcheck
- Coolify environment variables configuration
- Healthcheck endpoint functionality
- Next.js standalone mode configuration
- Package.json dependencies compatibility

Exit Codes:
  0   All validations passed
  1   One or more validations failed
  2   Script execution error
`);
}

/**
 * Run all validation checks
 */
async function runAllValidations() {
  console.log('🔍 Running validation checks...\n');
  
  // 1. Validate .coolify file
  await validateCoolifyFile();
  
  // 2. Validate Dockerfile compliance
  await validateDockerfile();
  
  // 3. Validate Next.js configuration
  await validateNextConfig();
  
  // 4. Validate package.json dependencies
  await validatePackageJson();
  
  // 5. Validate healthcheck endpoint (if server is running)
  await validateHealthcheckEndpoint();
  
  // 6. Validate build process
  await validateBuildProcess();
}

/**
 * Validate .coolify file presence and content
 */
async function validateCoolifyFile() {
  console.log('📁 Validating .coolify configuration file...');
  
  const coolifyPath = path.join(__dirname, '..', '.coolify');
  const requiredVariables = [
    'FORCE_DOCKERFILE=true',
    'SKIP_NIXPACKS=true', 
    'COOLIFY_USE_DOCKERFILE=true',
    'BUILD_COMMAND=pnpm install && pnpm run build',
    'START_COMMAND=node server.js',
    'PORT=3000'
  ];
  
  try {
    if (!fs.existsSync(coolifyPath)) {
      addValidationResult('FAIL', '.coolify file', 'File does not exist', {
        explanation: 'The .coolify file is required to force Dockerfile usage over Nixpacks.',
        suggestion: options.fix ? 'Creating .coolify file...' : 'Create .coolify file with required configuration'
      });
      
      if (options.fix) {
        await createCoolifyFile(coolifyPath);
      }
      return;
    }
    
    const content = fs.readFileSync(coolifyPath, 'utf8');
    const missingVariables = [];
    
    for (const variable of requiredVariables) {
      if (!content.includes(variable)) {
        missingVariables.push(variable);
      }
    }
    
    if (missingVariables.length > 0) {
      addValidationResult('FAIL', '.coolify file', `Missing required variables: ${missingVariables.join(', ')}`, {
        explanation: 'These variables ensure Coolify uses Dockerfile instead of Nixpacks and configures the build correctly.',
        suggestion: options.fix ? 'Adding missing variables...' : `Add these variables to .coolify file`
      });
      
      if (options.fix) {
        await fixCoolifyFile(coolifyPath, missingVariables);
      }
    } else {
      addValidationResult('PASS', '.coolify file', 'All required variables present');
    }
    
  } catch (error) {
    addValidationResult('ERROR', '.coolify file', `Error reading file: ${error.message}`);
  }
}

/**
 * Create .coolify file with default configuration
 */
async function createCoolifyFile(filePath) {
  try {
    const coolifyContent = `# Coolify Configuration File
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
CPU_LIMIT=2`;
    
    fs.writeFileSync(filePath, coolifyContent);
    console.log('  ✅ Created .coolify file with default configuration');
  } catch (error) {
    addValidationResult('ERROR', '.coolify file', `Failed to create file: ${error.message}`);
  }
}

/**
 * Fix missing variables in .coolify file
 */
async function fixCoolifyFile(filePath, missingVariables) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add missing variables
    for (const variable of missingVariables) {
      if (!content.includes(variable.split('=')[0])) {
        content += `\n${variable}`;
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Added missing variables to .coolify file`);
  } catch (error) {
    addValidationResult('ERROR', '.coolify file', `Failed to fix file: ${error.message}`);
  }
}

/**
 * Validate Dockerfile compliance
 */
async function validateDockerfile() {
  console.log('🐳 Validating Dockerfile compliance...');
  
  const dockerfilePath = path.join(__dirname, '..', 'Dockerfile');
  
  try {
    if (!fs.existsSync(dockerfilePath)) {
      addValidationResult('FAIL', 'Dockerfile', 'File does not exist', {
        explanation: 'Dockerfile is required for custom container build with Node.js 22.',
        suggestion: 'Create Dockerfile with Node.js 22 base image and proper configuration'
      });
      return;
    }
    
    const content = fs.readFileSync(dockerfilePath, 'utf8');
    const checks = [
      {
        name: 'Node.js 22 base image',
        pattern: /FROM node:22-alpine/,
        required: true
      },
      {
        name: 'Healthcheck configuration',
        pattern: /HEALTHCHECK.*--start-period=40s/,
        required: true
      },
      {
        name: 'Coolify environment variables',
        pattern: /ENV COOLIFY_USE_DOCKERFILE=true/,
        required: true
      },
      {
        name: 'Standalone mode configuration',
        pattern: /ENV NEXT_PRIVATE_STANDALONE=true/,
        required: true
      },
      {
        name: 'Non-root user configuration',
        pattern: /USER nextjs/,
        required: true
      },
      {
        name: 'Server.js creation',
        pattern: /server\.js/,
        required: true
      }
    ];
    
    const failedChecks = [];
    
    for (const check of checks) {
      if (check.required && !check.pattern.test(content)) {
        failedChecks.push(check.name);
      }
    }
    
    if (failedChecks.length > 0) {
      addValidationResult('FAIL', 'Dockerfile', `Failed checks: ${failedChecks.join(', ')}`, {
        explanation: 'Dockerfile must use Node.js 22, have proper healthcheck, and include Coolify-specific configurations.',
        suggestion: options.fix ? 'Dockerfile needs manual review and updating' : 'Review Dockerfile requirements in documentation'
      });
    } else {
      addValidationResult('PASS', 'Dockerfile', 'All compliance checks passed');
    }
    
  } catch (error) {
    addValidationResult('ERROR', 'Dockerfile', `Error reading file: ${error.message}`);
  }
}

/**
 * Validate Next.js configuration
 */
async function validateNextConfig() {
  console.log('⚙️  Validating Next.js configuration...');
  
  const nextConfigPath = path.join(__dirname, '..', 'next.config.mjs');
  
  try {
    if (!fs.existsSync(nextConfigPath)) {
      addValidationResult('FAIL', 'Next.js config', 'next.config.mjs file does not exist', {
        explanation: 'Next.js configuration is required for standalone mode build.',
        suggestion: 'Create next.config.mjs with standalone output configuration'
      });
      return;
    }
    
    const content = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Check for standalone mode
    const hasStandaloneMode = content.includes("output: 'standalone'");
    
    if (!hasStandaloneMode) {
      addValidationResult('FAIL', 'Next.js config', 'Standalone mode not configured', {
        explanation: 'Standalone mode is required for production deployment with Docker.',
        suggestion: options.fix ? 'Add standalone mode configuration' : 'Configure output: \'standalone\' in next.config.mjs'
      });
    } else {
      addValidationResult('PASS', 'Next.js config', 'Standalone mode configured');
    }
    
  } catch (error) {
    addValidationResult('ERROR', 'Next.js config', `Error reading file: ${error.message}`);
  }
}

/**
 * Validate package.json dependencies
 */
async function validatePackageJson() {
  console.log('📦 Validating package.json dependencies...');
  
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  
  try {
    if (!fs.existsSync(packageJsonPath)) {
      addValidationResult('FAIL', 'package.json', 'File does not exist', {
        explanation: 'package.json is required to define project dependencies.',
        suggestion: 'Create package.json with proper dependencies'
      });
      return;
    }
    
    const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const nextVersion = packageData.dependencies?.next;
    const nodeVersion = packageData.engines?.node;
    
    const checks = [];
    
    // Check Next.js version
    if (!nextVersion) {
      checks.push('Next.js dependency not found');
    } else if (nextVersion.includes('16')) {
      checks.push('Next.js 16 detected (requires Node.js 20.9.0+)');
    }
    
    // Check Node.js version requirement
    if (nodeVersion) {
      checks.push(`Node.js version requirement: ${nodeVersion}`);
    }
    
    if (checks.length > 0) {
      addValidationResult('INFO', 'package.json', checks.join(', '), {
        explanation: 'Dependencies should be compatible with Node.js 22 for Coolify deployment.',
        suggestion: 'Ensure dependencies are compatible with Node.js 22'
      });
    } else {
      addValidationResult('PASS', 'package.json', 'Dependencies appear compatible');
    }
    
  } catch (error) {
    addValidationResult('ERROR', 'package.json', `Error reading file: ${error.message}`);
  }
}

/**
 * Validate healthcheck endpoint
 */
async function validateHealthcheckEndpoint() {
  console.log('💓 Validating healthcheck endpoint...');
  
  // First check if healthcheck route exists
  const healthcheckPath = path.join(__dirname, '..', 'app/api/health/route.ts');
  
  if (!fs.existsSync(healthcheckPath)) {
    addValidationResult('FAIL', 'Healthcheck endpoint', 'API route does not exist', {
      explanation: 'Healthcheck endpoint is required for Docker health monitoring.',
      suggestion: 'Create app/api/health/route.ts with proper healthcheck implementation'
    });
    return;
  }
  
  // Try to test the endpoint if server is running
  try {
    const isServerRunning = await isPortAvailable(CONFIG.PORT);
    
    if (isServerRunning) {
      const healthcheckResult = await testHealthcheckEndpoint();
      if (healthcheckResult.success) {
        addValidationResult('PASS', 'Healthcheck endpoint', 'Endpoint responding correctly');
      } else {
        addValidationResult('FAIL', 'Healthcheck endpoint', `Endpoint test failed: ${healthcheckResult.error}`, {
          explanation: 'Healthcheck endpoint must respond with 200 status and proper JSON.',
          suggestion: 'Fix healthcheck endpoint implementation'
        });
      }
    } else {
      addValidationResult('SKIP', 'Healthcheck endpoint', 'Server not running - cannot test endpoint', {
        explanation: 'Healthcheck can only be tested when the server is running on port 3000.',
        suggestion: 'Start the server and run validation again, or check Docker healthcheck configuration'
      });
    }
  } catch (error) {
    addValidationResult('ERROR', 'Healthcheck endpoint', `Test failed: ${error.message}`);
  }
}

/**
 * Check if port is available (server is running)
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const timeout = 3000; // 3 seconds
    const start = Date.now();
    
    function check() {
      const socket = new net.Socket();
      
      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });
      
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      
      socket.setTimeout(timeout, () => {
        socket.destroy();
        resolve(false);
      });
      
      socket.connect(port, 'localhost');
    }
    
    check();
  });
}

/**
 * Test healthcheck endpoint
 */
function testHealthcheckEndpoint() {
  return new Promise((resolve) => {
    try {
      const options = {
        hostname: 'localhost',
        port: CONFIG.PORT,
        path: '/api/health',
        method: 'GET',
        timeout: CONFIG.HEALTHCHECK_TIMEOUT,
        headers: {
          'User-Agent': 'Coolify-Validation-Script/1.0'
        }
      };
      
      const request = http.request(options, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          try {
            if (response.statusCode === 200) {
              const healthData = JSON.parse(data);
              if (healthData.status === 'healthy' || healthData.status === 'ok') {
                resolve({ success: true, data: healthData });
              } else {
                resolve({ success: false, error: 'Invalid health status' });
              }
            } else {
              resolve({ success: false, error: `HTTP ${response.statusCode}` });
            }
          } catch (parseError) {
            resolve({ success: false, error: 'Invalid JSON response' });
          }
        });
      });
      
      request.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
      
      request.setTimeout(CONFIG.HEALTHCHECK_TIMEOUT, () => {
        request.destroy();
        resolve({ success: false, error: 'Request timeout' });
      });
      
      request.end();
    } catch (error) {
      resolve({ success: false, error: `Healthcheck test error: ${error.message}` });
    }
  });
}

/**
 * Validate build process
 */
async function validateBuildProcess() {
  console.log('🔨 Validating build process...');
  
  try {
    // Check if pnpm is available
    try {
      execSync('pnpm --version', { stdio: 'pipe' });
    } catch {
      addValidationResult('FAIL', 'Build process', 'pnpm not available', {
        explanation: 'pnpm is required for dependency installation and building.',
        suggestion: 'Install pnpm: npm install -g pnpm'
      });
      return;
    }
    
    // Check if build command works (dry run)
    try {
      execSync('pnpm run build --dry-run', { 
        stdio: 'pipe',
        cwd: path.join(__dirname, '..')
      });
      addValidationResult('PASS', 'Build process', 'Build command syntax valid');
    } catch (buildError) {
      addValidationResult('FAIL', 'Build process', 'Build command syntax invalid', {
        explanation: 'Build command cannot be executed properly.',
        suggestion: 'Check package.json scripts and dependencies'
      });
    }
    
  } catch (error) {
    addValidationResult('ERROR', 'Build process', `Validation failed: ${error.message}`);
  }
}

/**
 * Add validation result to results array
 */
function addValidationResult(status, component, message, metadata = {}) {
  validationResults.push({
    status,
    component,
    message,
    metadata,
    timestamp: new Date().toISOString()
  });
  
  // Display immediate feedback if verbose mode
  if (options.verbose) {
    displaySingleResult({ status, component, message, metadata });
  }
}

/**
 * Display single validation result
 */
function displaySingleResult(result) {
  const icons = {
    PASS: '✅',
    FAIL: '❌',
    SKIP: '⏭️',
    ERROR: '💥',
    INFO: 'ℹ️'
  };
  
  const icon = icons[result.status] || '❓';
  console.log(`  ${icon} ${result.component}: ${result.message}`);
  
  if (result.metadata.explanation) {
    console.log(`     📝 ${result.metadata.explanation}`);
  }
  
  if (result.metadata.suggestion) {
    console.log(`     💡 ${result.metadata.suggestion}`);
  }
}

/**
 * Display all validation results
 */
function displayValidationResults() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 VALIDATION RESULTS');
  console.log('='.repeat(80));
  
  const summary = validationResults.reduce((acc, result) => {
    acc[result.status] = (acc[result.status] || 0) + 1;
    return acc;
  }, {});
  
  // Display summary
  console.log(`\nSUMMARY:`);
  console.log(`  ✅ Passed: ${summary.PASS || 0}`);
  console.log(`  ❌ Failed: ${summary.FAIL || 0}`);
  console.log(`  ⚠️  Skipped: ${summary.SKIP || 0}`);
  console.log(`  💥 Errors: ${summary.ERROR || 0}`);
  console.log(`  ℹ️  Info: ${summary.INFO || 0}`);
  
  // Display detailed results
  console.log('\nDETAILED RESULTS:');
  validationResults.forEach(result => {
    displaySingleResult(result);
  });
  
  // Display overall status
  const allPassed = validationResults.every(result => result.status === 'PASS');
  console.log('\n' + '='.repeat(80));
  if (allPassed) {
    console.log('🎉 ALL VALIDATIONS PASSED! Your Coolify deployment configuration is ready.');
  } else {
    console.log('⚠️  SOME VALIDATIONS FAILED. Please review the issues above before deploying.');
  }
  console.log('='.repeat(80));
}

/**
 * Display next steps and recommendations
 */
function displayNextSteps() {
  console.log('\n🚀 NEXT STEPS FOR COOLIFY DEPLOYMENT');
  console.log('='.repeat(80));
  
  console.log('\n1. COOLIFY ENVIRONMENT VARIABLES:');
  console.log('   Add these environment variables to your Coolify service:');
  console.log('   • COOLIFY_USE_DOCKERFILE=true');
  console.log('   • NIXPACKS_DISABLE=true');
  console.log('   • FORCE_DOCKERFILE=true');
  console.log('   • NODE_ENV=production');
  console.log('   • NEXT_TELEMETRY_DISABLED=1');
  
  console.log('\n2. COOLIFY SERVICE CONFIGURATION:');
  console.log('   • Build Command: pnpm install && pnpm run build');
  console.log('   • Start Command: node server.js');
  console.log('   • Port: 3000');
  console.log('   • Healthcheck Timeout: 40 seconds');
  console.log('   • Healthcheck Path: /api/health');
  
  console.log('\n3. PRE-DEPLOYMENT CHECKLIST:');
  console.log('   ☐ All validation checks pass');
  console.log('   ☐ .coolify file committed to repository');
  console.log('   ☐ Dockerfile uses Node.js 22');
  console.log('   ☐ Healthcheck endpoint implemented');
  console.log('   ☐ Next.js standalone mode configured');
  
  console.log('\n4. TROUBLESHOOTING:');
  console.log('   If deployment fails:');
  console.log('   • Check Coolify logs for Nixpacks usage');
  console.log('   • Verify Node.js version in container');
  console.log('   • Ensure healthcheck has sufficient start period (40s)');
  console.log('   • Confirm all environment variables are set');
  
  console.log('\n📖 For more information, see:');
  console.log('   • COOLIFY_DEPLOYMENT_SOLUTION.md');
  console.log('   • COOLIFY_DEPLOYMENT_FIX.md');
  console.log('   • PULL_REQUEST_DEBUG_FIX.md');
  console.log('='.repeat(80));
}

// Run the validation
validateCoolifyDeployment().catch(error => {
  console.error('💥 Script execution failed:', error);
  process.exit(2);
});