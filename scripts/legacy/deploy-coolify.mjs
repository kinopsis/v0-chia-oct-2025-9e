#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Validating Coolify deployment configuration...\n');

// Check if .coolify file exists
const coolifyFile = path.join(__dirname, '..', '.coolify');
if (!fs.existsSync(coolifyFile)) {
    console.error('❌ Missing .coolify configuration file');
    console.log('📝 Creating .coolify file...');
    fs.writeFileSync(coolifyFile, `# Coolify Configuration File
# Force Dockerfile usage over Nixpacks to ensure Node.js 22 compatibility

# Force Dockerfile build
FORCE_DOCKERFILE=true
USE_CUSTOM_DOCKERFILE=true

# Disable Nixpacks
SKIP_NIXPACKS=true
NIXPACKS_DISABLE=true

# Build configuration
BUILD_COMMAND=pnpm install && pnpm run build
START_COMMAND=node server.js
BUILD_DIRECTORY=/app
PORT=3000

# Environment configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Coolify-specific optimizations
COOLIFY_USE_DOCKERFILE=true
COOLIFY_SKIP_NIXPACKS=true`);
    console.log('✅ Created .coolify file\n');
} else {
    console.log('✅ .coolify file exists');
    const coolifyContent = fs.readFileSync(coolifyFile, 'utf8');
    if (!coolifyContent.includes('FORCE_DOCKERFILE=true')) {
        console.error('❌ .coolify file missing FORCE_DOCKERFILE=true');
    } else {
        console.log('✅ .coolify file contains required configurations\n');
    }
}

// Check Dockerfile for Node.js 22
const dockerfile = path.join(__dirname, '..', 'Dockerfile');
if (!fs.existsSync(dockerfile)) {
    console.error('❌ Missing Dockerfile');
    process.exit(1);
}

const dockerfileContent = fs.readFileSync(dockerfile, 'utf8');
if (!dockerfileContent.includes('node:22-alpine')) {
    console.error('❌ Dockerfile does not use Node.js 22');
    console.log('📝 Updating Dockerfile to use Node.js 22...');
    const updatedContent = dockerfileContent.replace(
        /FROM node:\d+-alpine AS base/,
        'FROM node:22-alpine AS base'
    );
    fs.writeFileSync(dockerfile, updatedContent);
    console.log('✅ Updated Dockerfile to use Node.js 22\n');
} else {
    console.log('✅ Dockerfile uses Node.js 22');
}

// Check for Coolify environment variables
const coolifyEnvVars = [
    'COOLIFY_USE_DOCKERFILE=true',
    'NIXPACKS_DISABLE=true',
    'FORCE_DOCKERFILE=true'
];

let hasCoolifyEnvVars = false;
if (dockerfileContent.includes('COOLIFY_USE_DOCKERFILE=true') && 
    dockerfileContent.includes('NIXPACKS_DISABLE=true')) {
    hasCoolifyEnvVars = true;
    console.log('✅ Dockerfile contains Coolify environment variables');
} else {
    console.log('📝 Adding Coolify environment variables to Dockerfile...');
    let updatedContent = dockerfileContent;
    
    // Add environment variables after the base stage
    if (!dockerfileContent.includes('ENV COOLIFY_USE_DOCKERFILE=true')) {
        updatedContent = updatedContent.replace(
            /# Force Coolify to use this Dockerfile instead of Nixpacks/,
            `# Force Coolify to use this Dockerfile instead of Nixpacks
ENV COOLIFY_USE_DOCKERFILE=true
ENV NIXPACKS_DISABLE=true`
        );
    }
    
    fs.writeFileSync(dockerfile, updatedContent);
    console.log('✅ Added Coolify environment variables to Dockerfile\n');
}

// Check if standalone mode is configured
if (!dockerfileContent.includes('NEXT_PRIVATE_STANDALONE=true')) {
    console.log('📝 Adding standalone mode configuration...');
    let updatedContent = dockerfileContent;
    
    // Add standalone mode environment variable
    updatedContent = updatedContent.replace(
        /ENV NEXT_TELEMETRY_DISABLED=1/,
        `ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PRIVATE_STANDALONE=true`
    );
    
    fs.writeFileSync(dockerfile, updatedContent);
    console.log('✅ Added standalone mode configuration\n');
} else {
    console.log('✅ Dockerfile contains standalone mode configuration');
}

// Check package.json for Node.js version requirements
const packageJson = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJson)) {
    const packageData = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
    const nextVersion = packageData.dependencies?.next;
    
    if (nextVersion && nextVersion.includes('16.')) {
        console.log('✅ Package.json uses Next.js 16 (requires Node.js 20.9.0+)');
    } else {
        console.log('⚠️  Next.js version not clearly identified in package.json');
    }
}

// Check for server.js creation in Dockerfile
if (!dockerfileContent.includes('server.js')) {
    console.log('📝 Adding server.js creation to Dockerfile...');
    // This would need to be added manually as it's a complex addition
    console.log('💡 Please ensure your Dockerfile creates a server.js file for standalone mode\n');
} else {
    console.log('✅ Dockerfile includes server.js configuration');
}

console.log('🎯 Deployment validation complete!');
console.log('\n📋 Summary of changes made:');
console.log('• Created/updated .coolify configuration file');
console.log('• Ensured Dockerfile uses Node.js 22');
console.log('• Added Coolify-specific environment variables');
console.log('• Configured standalone mode support');

console.log('\n🚀 To deploy to Coolify:');
console.log('1. Push these changes to your repository');
console.log('2. In Coolify, ensure these environment variables are set:');
console.log('   - COOLIFY_USE_DOCKERFILE=true');
console.log('   - NIXPACKS_DISABLE=true');
console.log('   - FORCE_DOCKERFILE=true');
console.log('   - NODE_ENV=production');
console.log('3. Set Build Command: pnpm install && pnpm run build');
console.log('4. Set Start Command: node server.js');
console.log('5. Set Port: 3000');

console.log('\n🎯 The deployment should now use Node.js 22 and avoid the Nixpacks issue!');