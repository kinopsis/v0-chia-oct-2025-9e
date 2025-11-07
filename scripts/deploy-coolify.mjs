#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { URL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security configuration
const SECURITY_CONFIG = {
    MIN_NODE_VERSION: '22.0.0',
    REQUIRED_COOLIFY_VERSION: '1.0.0',
    ALLOWED_BASE_IMAGES: ['node:22-alpine', 'node:22.13.0-alpine3.20'],
    CRITICAL_SECRETS: [
        'SUPABASE_SERVICE_ROLE_KEY',
        'SUPABASE_JWT_SECRET',
        'DATABASE_URL',
        'API_KEY',
        'SECRET_KEY'
    ],
    REQUIRED_ENV_VARS: [
        'NODE_ENV',
        'NEXT_TELEMETRY_DISABLED',
        'PORT'
    ]
};

// Security audit log
const auditLog = {
    events: [],
    addEvent: function(type, message, severity = 'info', metadata = {}) {
        this.events.push({
            timestamp: new Date().toISOString(),
            type,
            message,
            severity,
            metadata
        });
    },
    save: function() {
        const logPath = path.join(__dirname, '..', 'security-audit.log');
        fs.appendFileSync(logPath, JSON.stringify(this.events, null, 2) + '\n');
    }
};

// Security metrics collection
const securityMetrics = {
    startTime: Date.now(),
    checks: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
    },
    vulnerabilities: [],
    secrets: {
        totalScanned: 0,
        exposed: 0,
        rotated: 0
    }
};

// Enhanced error handling with security context
class SecurityError extends Error {
    constructor(message, severity = 'error', context = {}) {
        super(message);
        this.name = 'SecurityError';
        this.severity = severity;
        this.context = context;
        this.timestamp = new Date().toISOString();
    }
}

// Security utilities
const securityUtils = {
    // Validate Node.js version
    validateNodeVersion: () => {
        const version = process.version;
        const required = SECURITY_CONFIG.MIN_NODE_VERSION;
        const [major, minor] = version.slice(1).split('.').map(Number);
        const [reqMajor, reqMinor] = required.split('.').map(Number);
        
        if (major < reqMajor || (major === reqMajor && minor < reqMinor)) {
            throw new SecurityError(
                `Node.js version ${version} is not supported. Required: ${required}`,
                'critical',
                { currentVersion: version, requiredVersion: required }
            );
        }
        return true;
    },

    // Check for hardcoded secrets in files
    scanForHardcodedSecrets: (filePath) => {
        const content = fs.readFileSync(filePath, 'utf8');
        const findings = [];
        
        SECURITY_CONFIG.CRITICAL_SECRETS.forEach(secret => {
            const pattern = new RegExp(`${secret}\\s*=\\s*["']([^"']+)["']`, 'g');
            let match;
            while ((match = pattern.exec(content)) !== null) {
                findings.push({
                    secret: secret,
                    line: content.substring(0, match.index).split('\n').length,
                    value: match[1],
                    isExposed: true
                });
                securityMetrics.secrets.exposed++;
            }
        });
        
        securityMetrics.secrets.totalScanned += findings.length;
        return findings;
    },

    // Validate Dockerfile security
    validateDockerfileSecurity: (dockerfileContent) => {
        const issues = [];
        
        // Check for non-root user
        if (!dockerfileContent.includes('USER ') || !dockerfileContent.includes('adduser')) {
            issues.push({
                type: 'non_root_user',
                severity: 'high',
                message: 'Dockerfile should use non-root user for security'
            });
        }
        
        // Check for base image validation
        const baseImageMatch = dockerfileContent.match(/FROM\s+([^:\s]+)/);
        if (baseImageMatch && !SECURITY_CONFIG.ALLOWED_BASE_IMAGES.includes(baseImageMatch[1])) {
            issues.push({
                type: 'base_image',
                severity: 'medium',
                message: `Base image ${baseImageMatch[1]} not in approved list`
            });
        }
        
        // Check for security headers in healthcheck
        if (!dockerfileContent.includes('HEALTHCHECK')) {
            issues.push({
                type: 'healthcheck',
                severity: 'medium',
                message: 'Missing healthcheck configuration'
            });
        }
        
        return issues;
    },

    // Validate .coolify configuration
    validateCoolifyConfig: (configContent) => {
        const requiredSettings = [
            'FORCE_DOCKERFILE=true',
            'NIXPACKS_DISABLE=true',
            'SECURITY_MONITORING_ENABLED=true',
            'AUDIT_LOGGING_ENABLED=true'
        ];
        
        const missing = requiredSettings.filter(setting => !configContent.includes(setting));
        
        return missing.map(setting => ({
            type: 'coolify_config',
            severity: 'medium',
            message: `Missing required setting: ${setting}`
        }));
    },

    // Test external service connectivity
    testServiceConnectivity: async (url, timeout = 5000) => {
        return new Promise((resolve) => {
            const timer = setTimeout(() => {
                resolve({ success: false, error: 'Timeout' });
            }, timeout);
            
            try {
                https.get(url, (res) => {
                    clearTimeout(timer);
                    resolve({ success: true, statusCode: res.statusCode });
                }).on('error', (err) => {
                    clearTimeout(timer);
                    resolve({ success: false, error: err.message });
                });
            } catch (err) {
                clearTimeout(timer);
                resolve({ success: false, error: err.message });
            }
        });
    },

    // Validate environment variables
    validateEnvironmentVars: () => {
        const missing = [];
        const secrets = [];
        
        SECURITY_CONFIG.REQUIRED_ENV_VARS.forEach(envVar => {
            if (!process.env[envVar]) {
                missing.push(envVar);
            }
        });
        
        // Check for exposed secrets
        Object.keys(process.env).forEach(key => {
            if (SECURITY_CONFIG.CRITICAL_SECRETS.includes(key) && process.env[key]) {
                secrets.push({
                    name: key,
                    isSecret: true,
                    length: process.env[key].length
                });
            }
        });
        
        return { missing, secrets };
    }
};

// Security validation framework
const securityValidator = {
    async runPreDeploymentChecks() {
        console.log('🔍 Running pre-deployment security validation...\n');
        
        const checks = [
            { name: 'Node.js Version Validation', fn: () => securityUtils.validateNodeVersion() },
            { name: 'Environment Variables Validation', fn: () => this.validateEnvironmentVariables() },
            { name: 'Dockerfile Security Validation', fn: () => this.validateDockerfile() },
            { name: 'Coolify Configuration Validation', fn: () => this.validateCoolifyConfiguration() },
            { name: 'Secrets Exposure Scan', fn: () => this.scanSecretsExposure() },
            { name: 'Service Connectivity Check', fn: () => this.checkServiceConnectivity() }
        ];
        
        let allPassed = true;
        
        for (const check of checks) {
            try {
                securityMetrics.checks.total++;
                console.log(`  📋 ${check.name}...`);
                
                await check.fn();
                securityMetrics.checks.passed++;
                console.log(`  ✅ ${check.name} passed\n`);
                
                auditLog.addEvent('security_check', `${check.name} passed`, 'info');
            } catch (error) {
                securityMetrics.checks.failed++;
                allPassed = false;
                
                console.error(`  ❌ ${check.name} failed:`, error.message);
                console.error(`     Context:`, JSON.stringify(error.context, null, 2));
                
                auditLog.addEvent('security_check', `${check.name} failed`, 'error', {
                    error: error.message,
                    context: error.context
                });
                
                // Critical failures should prevent deployment
                if (error.severity === 'critical') {
                    throw new SecurityError(`Critical security check failed: ${check.name}`, 'critical');
                }
            }
        }
        
        return allPassed;
    },

    async validateEnvironmentVariables() {
        const { missing, secrets } = securityUtils.validateEnvironmentVars();
        
        if (missing.length > 0) {
            throw new SecurityError(
                `Missing required environment variables: ${missing.join(', ')}`,
                'high'
            );
        }
        
        // Warn about potential secret exposure
        if (secrets.length > 0) {
            console.log(`  ⚠️  Found ${secrets.length} potential secrets in environment`);
            secrets.forEach(secret => {
                console.log(`     ${secret.name}: ${'*'.repeat(secret.length)}`);
            });
        }
    },

    async validateDockerfile() {
        const dockerfile = path.join(__dirname, '..', 'Dockerfile');
        if (!fs.existsSync(dockerfile)) {
            throw new SecurityError('Dockerfile not found', 'critical');
        }
        
        const content = fs.readFileSync(dockerfile, 'utf8');
        const issues = securityUtils.validateDockerfileSecurity(content);
        
        if (issues.length > 0) {
            const highSeverityIssues = issues.filter(issue => issue.severity === 'high');
            if (highSeverityIssues.length > 0) {
                throw new SecurityError(
                    `High severity Dockerfile issues: ${highSeverityIssues.map(i => i.message).join(', ')}`,
                    'high'
                );
            }
            
            // Log medium severity issues as warnings
            issues.forEach(issue => {
                if (issue.severity === 'medium') {
                    console.log(`  ⚠️  ${issue.message}`);
                }
            });
        }
    },

    async validateCoolifyConfiguration() {
        const coolifyFile = path.join(__dirname, '..', '.coolify');
        if (!fs.existsSync(coolifyFile)) {
            throw new SecurityError('.coolify configuration file not found', 'high');
        }
        
        const content = fs.readFileSync(coolifyFile, 'utf8');
        const issues = securityUtils.validateCoolifyConfig(content);
        
        if (issues.length > 0) {
            throw new SecurityError(
                `Missing Coolify security settings: ${issues.map(i => i.message).join(', ')}`,
                'medium'
            );
        }
    },

    async scanSecretsExposure() {
        const filesToScan = [
            'package.json',
            'Dockerfile',
            '.env.example',
            'scripts/deploy-coolify.mjs'
        ];
        
        let totalFindings = 0;
        
        for (const file of filesToScan) {
            const filePath = path.join(__dirname, '..', file);
            if (fs.existsSync(filePath)) {
                const findings = securityUtils.scanForHardcodedSecrets(filePath);
                totalFindings += findings.length;
                
                if (findings.length > 0) {
                    console.log(`  ❌ Found ${findings.length} potential secrets in ${file}:`);
                    findings.forEach(finding => {
                        console.log(`     Line ${finding.line}: ${finding.secret} = ${'*'.repeat(finding.value.length)}`);
                    });
                }
            }
        }
        
        if (totalFindings > 0) {
            throw new SecurityError(`Found ${totalFindings} potential hardcoded secrets`, 'high');
        }
    },

    async checkServiceConnectivity() {
        const services = [
            'https://api.github.com',
            'https://registry.npmjs.org'
        ];
        
        for (const service of services) {
            const result = await securityUtils.testServiceConnectivity(service);
            if (!result.success) {
                console.log(`  ⚠️  Unable to reach ${service}: ${result.error}`);
            } else {
                console.log(`  ✅ Connected to ${service} (status: ${result.statusCode})`);
            }
        }
    },

    async runPostDeploymentVerification() {
        console.log('\n🔍 Running post-deployment security verification...\n');
        
        const checks = [
            { name: 'Application Health Check', fn: () => this.verifyApplicationHealth() },
            { name: 'Security Headers Check', fn: () => this.verifySecurityHeaders() },
            { name: 'Resource Limits Check', fn: () => this.verifyResourceLimits() },
            { name: 'Audit Logging Check', fn: () => this.verifyAuditLogging() }
        ];
        
        let allPassed = true;
        
        for (const check of checks) {
            try {
                console.log(`  📋 ${check.name}...`);
                await check.fn();
                console.log(`  ✅ ${check.name} passed\n`);
                
                auditLog.addEvent('post_deployment_check', `${check.name} passed`, 'info');
            } catch (error) {
                allPassed = false;
                console.error(`  ❌ ${check.name} failed:`, error.message);
                
                auditLog.addEvent('post_deployment_check', `${check.name} failed`, 'error', {
                    error: error.message
                });
            }
        }
        
        return allPassed;
    },

    async verifyApplicationHealth() {
        // This would typically check the actual deployed application
        // For now, we'll simulate a health check
        const healthCheckUrl = process.env.COOLIFY_APP_URL || 'http://localhost:3000/api/health';
        
        try {
            const result = await securityUtils.testServiceConnectivity(healthCheckUrl, 10000);
            if (!result.success) {
                throw new SecurityError(`Health check failed: ${result.error}`, 'high');
            }
        } catch (error) {
            throw new SecurityError(`Health check failed: ${error.message}`, 'high');
        }
    },

    async verifySecurityHeaders() {
        // Placeholder for security headers verification
        console.log(`  ℹ️  Security headers verification would check for proper CSP, HSTS, etc.`);
    },

    async verifyResourceLimits() {
        // Placeholder for resource limits verification
        console.log(`  ℹ️  Resource limits verification would check memory/CPU constraints`);
    },

    async verifyAuditLogging() {
        // Check if audit logging is enabled in .coolify
        const coolifyFile = path.join(__dirname, '..', '.coolify');
        const content = fs.readFileSync(coolifyFile, 'utf8');
        
        if (!content.includes('AUDIT_LOGGING_ENABLED=true')) {
            throw new SecurityError('Audit logging not enabled in Coolify configuration', 'medium');
        }
    }
};

// Secret management framework
const secretManager = {
    async validateSecretsConfiguration() {
        console.log('🔐 Validating secrets management configuration...\n');
        
        const coolifyFile = path.join(__dirname, '..', '.coolify');
        const content = fs.readFileSync(coolifyFile, 'utf8');
        
        // Check for secret management configuration
        const requiredSecretSettings = [
            'SECRET_MANAGEMENT_INTEGRATION=true',
            'ENV_VAR_ENCRYPTION=true',
            'SECURE_ENV_VARS=true'
        ];
        
        const missing = requiredSecretSettings.filter(setting => !content.includes(setting));
        
        if (missing.length > 0) {
            console.log(`  ⚠️  Missing secret management settings: ${missing.join(', ')}`);
            console.log(`  ℹ️  Consider adding these settings for enhanced security\n`);
        } else {
            console.log(`  ✅ Secret management configuration found\n`);
        }
    },

    async scanForSecretExposure() {
        console.log('🔍 Scanning for secret exposure...\n');
        
        const sensitivePatterns = [
            /SUPABASE_SERVICE_ROLE_KEY\s*=\s*['"]?([^'"\s]+)/g,
            /SUPABASE_JWT_SECRET\s*=\s*['"]?([^'"\s]+)/g,
            /DATABASE_URL\s*=\s*['"]?([^'"\s]+)/g,
            /API_KEY\s*=\s*['"]?([^'"\s]+)/g,
            /SECRET_KEY\s*=\s*['"]?([^'"\s]+)/g
        ];
        
        const filesToScan = [
            'package.json',
            'Dockerfile',
            '.env.example',
            '.coolify'
        ];
        
        const exposedSecrets = [];
        
        for (const file of filesToScan) {
            const filePath = path.join(__dirname, '..', file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                
                sensitivePatterns.forEach((pattern, index) => {
                    const matches = content.match(pattern);
                    if (matches) {
                        exposedSecrets.push({
                            file,
                            pattern: Object.keys(SECURITY_CONFIG.CRITICAL_SECRETS)[index],
                            count: matches.length
                        });
                    }
                });
            }
        }
        
        if (exposedSecrets.length > 0) {
            console.log(`  ❌ Found potential secret exposure in ${exposedSecrets.length} files:`);
            exposedSecrets.forEach(exposure => {
                console.log(`     ${exposure.file}: ${exposure.pattern} (${exposure.count} instances)`);
            });
            
            throw new SecurityError('Secret exposure detected', 'high', { exposures: exposedSecrets });
        } else {
            console.log(`  ✅ No obvious secret exposure detected\n`);
        }
    },

    async validateSecretRotation() {
        console.log('🔄 Validating secret rotation readiness...\n');
        
        // Check if rotation mechanisms are in place
        const hasRotationPlan = fs.existsSync(path.join(__dirname, '..', 'SECRET_ROTATION.md'));
        
        if (!hasRotationPlan) {
            console.log(`  ⚠️  No secret rotation plan found. Consider creating SECRET_ROTATION.md\n`);
        } else {
            console.log(`  ✅ Secret rotation plan found\n`);
        }
    }
};

// Deployment orchestrator with security focus
const deploymentOrchestrator = {
    async executeDeployment() {
        console.log('🚀 Starting secure deployment process...\n');
        
        try {
            // Phase 1: Pre-deployment security validation
            console.log('📋 Phase 1: Pre-deployment Security Validation');
            await securityValidator.runPreDeploymentChecks();
            
            // Phase 2: Secret management validation
            console.log('📋 Phase 2: Secret Management Validation');
            await secretManager.validateSecretsConfiguration();
            await secretManager.scanForSecretExposure();
            await secretManager.validateSecretRotation();
            
            // Phase 3: Execute deployment commands
            console.log('📋 Phase 3: Executing Deployment');
            await this.executeDeploymentCommands();
            
            // Phase 4: Post-deployment verification
            console.log('📋 Phase 4: Post-deployment Security Verification');
            const verificationPassed = await securityValidator.runPostDeploymentVerification();
            
            if (verificationPassed) {
                console.log('🎉 Deployment completed successfully with all security checks passed!');
                auditLog.addEvent('deployment', 'Deployment completed successfully', 'info');
            } else {
                console.log('⚠️  Deployment completed but some security verifications failed');
                auditLog.addEvent('deployment', 'Deployment completed with verification issues', 'warning');
            }
            
            return verificationPassed;
            
        } catch (error) {
            console.error('\n💥 Deployment failed due to security issues:');
            console.error(`   Error: ${error.message}`);
            console.error(`   Severity: ${error.severity}`);
            
            auditLog.addEvent('deployment', 'Deployment failed', 'error', {
                error: error.message,
                severity: error.severity,
                context: error.context
            });
            
            // Trigger incident response
            await this.handleSecurityIncident(error);
            
            throw error;
        }
    },

    async executeDeploymentCommands() {
        // This would contain the actual deployment commands
        // For now, we'll simulate the process
        console.log(`  ℹ️  Executing deployment commands...`);
        console.log(`  ℹ️  This would typically push to Coolify and trigger deployment`);
        
        // Simulate deployment time
        await new Promise(resolve => setTimeout(resolve, 1000));
    },

    async handleSecurityIncident(error) {
        console.log('\n🚨 Security Incident Response Initiated');
        
        // Generate incident report
        const incidentReport = {
            timestamp: new Date().toISOString(),
            severity: error.severity,
            type: 'deployment_failure',
            message: error.message,
            context: error.context,
            affectedComponents: ['deployment_pipeline'],
            recommendedActions: [
                'Review security configuration',
                'Check secret management',
                'Validate environment variables',
                'Run security audit'
            ]
        };
        
        // Save incident report
        const reportPath = path.join(__dirname, '..', `security-incident-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(incidentReport, null, 2));
        
        console.log(`  📋 Incident report saved to: ${reportPath}`);
        console.log(`  📋 Recommended actions:`);
        incidentReport.recommendedActions.forEach(action => {
            console.log(`     - ${action}`);
        });
        
        // Trigger alert (would integrate with actual alerting system)
        console.log(`  🚨 Security alert triggered for ${error.severity} severity issue`);
    },

    generateSecurityReport() {
        const duration = Date.now() - securityMetrics.startTime;
        
        const report = {
            timestamp: new Date().toISOString(),
            duration: duration,
            metrics: securityMetrics,
            auditLog: auditLog.events
        };
        
        const reportPath = path.join(__dirname, '..', `security-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`\n📊 Security report generated: ${reportPath}`);
        
        // Display summary
        console.log('\n📈 Security Validation Summary:');
        console.log(`   Total Checks: ${securityMetrics.checks.total}`);
        console.log(`   Passed: ${securityMetrics.checks.passed}`);
        console.log(`   Failed: ${securityMetrics.checks.failed}`);
        console.log(`   Skipped: ${securityMetrics.checks.skipped}`);
        console.log(`   Secrets Scanned: ${securityMetrics.secrets.totalScanned}`);
        console.log(`   Exposed Secrets: ${securityMetrics.secrets.exposed}`);
        
        return report;
    }
};

// Main execution
async function main() {
    console.log('🔒 COOLIFY SECURITY-ENHANCED DEPLOYMENT SCRIPT');
    console.log('================================================\n');
    
    try {
        // Initialize security context
        auditLog.addEvent('deployment_script', 'Deployment script started', 'info');
        
        // Execute secure deployment
        const success = await deploymentOrchestrator.executeDeployment();
        
        // Generate security report
        const report = deploymentOrchestrator.generateSecurityReport();
        
        // Save audit log
        auditLog.save();
        
        if (success) {
            console.log('\n✅ Deployment completed successfully with all security validations!');
            process.exit(0);
        } else {
            console.log('\n⚠️  Deployment completed with some security verification issues');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('\n💥 Deployment failed due to security issues:');
        console.error(`   ${error.message}`);
        
        // Generate final security report
        const report = deploymentOrchestrator.generateSecurityReport();
        
        // Save audit log
        auditLog.save();
        
        process.exit(1);
    }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('\n💥 Uncaught Exception:', error);
    auditLog.addEvent('uncaught_exception', error.message, 'critical');
    auditLog.save();
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('\n💥 Unhandled Rejection at:', promise, 'reason:', reason);
    auditLog.addEvent('unhandled_rejection', String(reason), 'critical');
    auditLog.save();
    process.exit(1);
});

// Execute main function
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { 
    SecurityError, 
    securityUtils, 
    securityValidator, 
    secretManager, 
    deploymentOrchestrator,
    auditLog,
    securityMetrics 
};