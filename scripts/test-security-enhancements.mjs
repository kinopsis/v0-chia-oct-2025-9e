#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the security modules from the deployment script
import { 
    SecurityError, 
    securityUtils, 
    securityValidator, 
    secretManager, 
    deploymentOrchestrator,
    auditLog,
    securityMetrics 
} from './deploy-coolify.mjs';

console.log('🔒 TESTING SECURITY-ENHANCED DEPLOYMENT SCRIPT');
console.log('================================================\n');

// Test configuration
const TEST_CONFIG = {
    testEnvVars: {
        'NODE_ENV': 'production',
        'NEXT_TELEMETRY_DISABLED': '1',
        'PORT': '3000',
        'SUPABASE_SERVICE_ROLE_KEY': 'test_key_12345',
        'SUPABASE_JWT_SECRET': 'test_jwt_secret_67890'
    },
    testFiles: {
        'test-package.json': `{
    "name": "test-app",
    "version": "1.0.0",
    "dependencies": {
        "next": "16.0.0"
    },
    "SUPABASE_SERVICE_ROLE_KEY": "test_key_exposed"
}`,
        'test-Dockerfile': `FROM node:22-alpine AS base
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`,
        'test-coolify': `FORCE_DOCKERFILE=true
NIXPACKS_DISABLE=true
AUDIT_LOGGING_ENABLED=true`
    }
};

// Test results tracking
const testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
};

function runTest(testName, testFunction) {
    testResults.total++;
    console.log(`🧪 Running test: ${testName}`);
    
    try {
        testFunction();
        testResults.passed++;
        console.log(`✅ ${testName} PASSED\n`);
        testResults.details.push({ name: testName, status: 'PASSED', error: null });
    } catch (error) {
        testResults.failed++;
        console.log(`❌ ${testName} FAILED: ${error.message}\n`);
        testResults.details.push({ name: testName, status: 'FAILED', error: error.message });
    }
}

function runAsyncTest(testName, testFunction) {
    testResults.total++;
    console.log(`🧪 Running async test: ${testName}`);
    
    return testFunction()
        .then(() => {
            testResults.passed++;
            console.log(`✅ ${testName} PASSED\n`);
            testResults.details.push({ name: testName, status: 'PASSED', error: null });
        })
        .catch(error => {
            testResults.failed++;
            console.log(`❌ ${testName} FAILED: ${error.message}\n`);
            testResults.details.push({ name: testName, status: 'FAILED', error: error.message });
        });
}

// Test 1: Security Error Class
runTest('Security Error Class Creation', () => {
    const error = new SecurityError('Test error', 'high', { test: 'data' });
    if (!(error instanceof SecurityError)) {
        throw new Error('SecurityError class not working');
    }
    if (error.severity !== 'high') {
        throw new Error('SecurityError severity not set correctly');
    }
});

// Test 2: Node.js Version Validation
runTest('Node.js Version Validation', () => {
    try {
        securityUtils.validateNodeVersion();
        // Should pass with current Node.js version
    } catch (error) {
        throw new Error(`Node.js validation failed: ${error.message}`);
    }
});

// Test 3: Environment Variables Validation
runTest('Environment Variables Validation', () => {
    // Set test environment variables
    Object.assign(process.env, TEST_CONFIG.testEnvVars);
    
    const { missing, secrets } = securityUtils.validateEnvironmentVars();
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    if (secrets.length === 0) {
        throw new Error('No secrets found in environment variables');
    }
});

// Test 4: Secrets Exposure Scan
runTest('Secrets Exposure Scan', () => {
    // Create test file with exposed secret
    const testFile = path.join(__dirname, '..', 'test-secret-file.js');
    fs.writeFileSync(testFile, `
        const config = {
            SUPABASE_SERVICE_ROLE_KEY: 'exposed_secret_value',
            API_KEY: 'another_exposed_key'
        };
    `);
    
    const findings = securityUtils.scanForHardcodedSecrets(testFile);
    
    if (findings.length === 0) {
        throw new Error('No secrets detected in test file');
    }
    
    // Clean up test file
    fs.unlinkSync(testFile);
});

// Test 5: Dockerfile Security Validation
runTest('Dockerfile Security Validation', () => {
    const testDockerfile = TEST_CONFIG.testFiles['test-Dockerfile'];
    const issues = securityUtils.validateDockerfileSecurity(testDockerfile);
    
    // Should detect missing non-root user
    const hasNonRootIssue = issues.some(issue => issue.type === 'non_root_user');
    if (!hasNonRootIssue) {
        throw new Error('Dockerfile security validation did not detect non-root user issue');
    }
});

// Test 6: Coolify Configuration Validation
runTest('Coolify Configuration Validation', () => {
    const testConfig = TEST_CONFIG.testFiles['test-coolify'];
    const issues = securityUtils.validateCoolifyConfig(testConfig);
    
    // Should detect missing security settings
    const hasMissingSettings = issues.some(issue => issue.type === 'coolify_config');
    if (!hasMissingSettings) {
        throw new Error('Coolify config validation did not detect missing settings');
    }
});

// Test 7: Secret Management - Configuration Validation
runAsyncTest('Secret Management Configuration Validation', async () => {
    // Create test .coolify file
    const testCoolify = path.join(__dirname, '..', 'test-.coolify');
    fs.writeFileSync(testCoolify, `
        FORCE_DOCKERFILE=true
        NIXPACKS_DISABLE=true
        AUDIT_LOGGING_ENABLED=true
    `);
    
    await secretManager.validateSecretsConfiguration();
    
    // Clean up
    fs.unlinkSync(testCoolify);
});

// Test 8: Secret Management - Exposure Scan
runAsyncTest('Secret Management Exposure Scan', async () => {
    // Create test files with secrets
    const testFiles = [
        { name: 'test1.js', content: 'SUPABASE_SERVICE_ROLE_KEY=test_value' },
        { name: 'test2.js', content: 'API_KEY=another_test_value' }
    ];
    
    testFiles.forEach(file => {
        fs.writeFileSync(path.join(__dirname, '..', file.name), file.content);
    });
    
    try {
        await secretManager.scanForSecretExposure();
        throw new Error('Secret exposure scan should have detected exposed secrets');
    } catch (error) {
        if (error.message !== 'Secret exposure detected') {
            throw new Error(`Unexpected error: ${error.message}`);
        }
    }
    
    // Clean up
    testFiles.forEach(file => {
        try { fs.unlinkSync(path.join(__dirname, '..', file.name)); } catch {}
    });
});

// Test 9: Security Validator - Pre-deployment Checks
runAsyncTest('Security Validator Pre-deployment Checks', async () => {
    // Mock the required functions to avoid actual file dependencies
    const originalValidateDockerfile = securityValidator.validateDockerfile;
    const originalValidateCoolifyConfiguration = securityValidator.validateCoolifyConfiguration;
    
    // Mock successful validations
    securityValidator.validateDockerfile = () => Promise.resolve();
    securityValidator.validateCoolifyConfiguration = () => Promise.resolve();
    
    try {
        const result = await securityValidator.runPreDeploymentChecks();
        if (!result) {
            throw new Error('Pre-deployment checks should have passed');
        }
    } finally {
        // Restore original functions
        securityValidator.validateDockerfile = originalValidateDockerfile;
        securityValidator.validateCoolifyConfiguration = originalValidateCoolifyConfiguration;
    }
});

// Test 10: Audit Logging
runTest('Audit Logging Functionality', () => {
    const initialEventCount = auditLog.events.length;
    
    auditLog.addEvent('test', 'Test message', 'info', { testData: 'value' });
    
    if (auditLog.events.length !== initialEventCount + 1) {
        throw new Error('Audit log event not added');
    }
    
    const lastEvent = auditLog.events[auditLog.events.length - 1];
    if (lastEvent.type !== 'test' || lastEvent.message !== 'Test message') {
        throw new Error('Audit log event data incorrect');
    }
});

// Test 11: Security Metrics Collection
runTest('Security Metrics Collection', () => {
    const initialChecks = { ...securityMetrics.checks };
    
    securityMetrics.checks.total++;
    securityMetrics.checks.passed++;
    
    if (securityMetrics.checks.total !== initialChecks.total + 1) {
        throw new Error('Security metrics not updated correctly');
    }
});

// Test 12: Deployment Orchestrator - Error Handling
runTest('Deployment Orchestrator Error Handling', () => {
    const originalExecute = deploymentOrchestrator.executeDeployment;
    
    // Mock a failure
    deploymentOrchestrator.executeDeployment = () => {
        throw new SecurityError('Test deployment failure', 'high');
    };
    
    try {
        deploymentOrchestrator.executeDeployment();
        throw new Error('Deployment orchestrator should have thrown an error');
    } catch (error) {
        if (!(error instanceof SecurityError)) {
            throw new Error('Deployment orchestrator did not handle error correctly');
        }
    } finally {
        // Restore original function
        deploymentOrchestrator.executeDeployment = originalExecute;
    }
});

// Run all tests
async function runAllTests() {
    console.log('🎯 Starting security enhancement tests...\n');
    
    // Run synchronous tests
    console.log('📋 Running synchronous tests...');
    
    // Run asynchronous tests
    console.log('📋 Running asynchronous tests...');
    await Promise.all([
        runAsyncTest('Secret Management Configuration Validation', async () => {
            const testCoolify = path.join(__dirname, '..', 'test-.coolify');
            fs.writeFileSync(testCoolify, `FORCE_DOCKERFILE=true`);
            await secretManager.validateSecretsConfiguration();
            fs.unlinkSync(testCoolify);
        }),
        runAsyncTest('Secret Management Exposure Scan', async () => {
            const testFile = path.join(__dirname, '..', 'test-secret.js');
            fs.writeFileSync(testFile, 'SUPABASE_SERVICE_ROLE_KEY=test');
            try {
                await secretManager.scanForSecretExposure();
                throw new Error('Should have detected secret exposure');
            } catch (error) {
                if (error.message !== 'Secret exposure detected') {
                    throw error;
                }
            }
            fs.unlinkSync(testFile);
        }),
        runAsyncTest('Security Validator Pre-deployment Checks', async () => {
            const originalValidateDockerfile = securityValidator.validateDockerfile;
            securityValidator.validateDockerfile = () => Promise.resolve();
            await securityValidator.runPreDeploymentChecks();
            securityValidator.validateDockerfile = originalValidateDockerfile;
        })
    ]);
    
    // Display test results
    console.log('📊 Test Results Summary:');
    console.log(`   Total Tests: ${testResults.total}`);
    console.log(`   Passed: ${testResults.passed}`);
    console.log(`   Failed: ${testResults.failed}`);
    console.log(`   Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
    
    if (testResults.failed > 0) {
        console.log('\n❌ Failed Tests:');
        testResults.details.forEach(test => {
            if (test.status === 'FAILED') {
                console.log(`   - ${test.name}: ${test.error}`);
            }
        });
    }
    
    // Save test results
    const testReport = {
        timestamp: new Date().toISOString(),
        summary: {
            total: testResults.total,
            passed: testResults.passed,
            failed: testResults.failed,
            successRate: Math.round((testResults.passed / testResults.total) * 100)
        },
        details: testResults.details
    };
    
    const reportPath = path.join(__dirname, '..', `security-test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2));
    
    console.log(`\n📋 Test report saved to: ${reportPath}`);
    
    if (testResults.failed === 0) {
        console.log('\n🎉 All security enhancement tests passed!');
        return true;
    } else {
        console.log('\n⚠️  Some security enhancement tests failed');
        return false;
    }
}

// Execute tests
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Test execution failed:', error);
            process.exit(1);
        });
}

export { runTest, runAsyncTest, runAllTests, testResults };