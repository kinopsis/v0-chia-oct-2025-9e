#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🚀 Starting Coolify deployment preparation...')

// Check if required files exist
const requiredFiles = [
  'Dockerfile',
  'docker-compose.yml',
  '.env.example',
  'package.json'
]

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Required file missing: ${file}`)
    process.exit(1)
  }
}

// Check if .env file exists (should be created from .env.example)
if (!fs.existsSync('.env')) {
  console.log('⚠️  Creating .env file from template...')
  fs.copyFileSync('.env.example', '.env')
  console.log('📝 Please update .env file with your actual values before deployment')
}

// Update pnpm lockfile if needed
console.log('🔧 Updating pnpm lockfile...')
try {
  execSync('pnpm install', { stdio: 'pipe' })
  console.log('✅ pnpm lockfile updated successfully')
} catch (error) {
  console.log('⚠️  pnpm lockfile update needed, updating...')
  try {
    execSync('pnpm install --no-frozen-lockfile', { stdio: 'inherit' })
    console.log('✅ pnpm lockfile updated successfully')
  } catch (updateError) {
    console.error('❌ Failed to update pnpm lockfile:', updateError.message)
    process.exit(1)
  }
}

// Validate Dockerfile
try {
  execSync('docker build -t test-build -f Dockerfile --target runner .', {
    stdio: 'pipe',
    timeout: 300000 // 5 minutes
  })
  console.log('✅ Dockerfile validation successful')
} catch (error) {
  console.error('❌ Dockerfile validation failed:', error.message)
  process.exit(1)
}

// Validate docker-compose
try {
  execSync('docker-compose config', { stdio: 'pipe' })
  console.log('✅ docker-compose validation successful')
} catch (error) {
  console.error('❌ docker-compose validation failed:', error.message)
  process.exit(1)
}

// Build the application
try {
  console.log('🏗️  Building application...')
  execSync('pnpm install', { stdio: 'inherit' })
  execSync('pnpm run build', { stdio: 'inherit' })
  console.log('✅ Application build successful')
} catch (error) {
  console.error('❌ Application build failed:', error.message)
  process.exit(1)
}

// Create SSL directory if it doesn't exist
if (!fs.existsSync('ssl')) {
  fs.mkdirSync('ssl', { recursive: true })
  console.log('📁 Created SSL directory for certificates')
}

console.log('\n🎉 Deployment preparation complete!')
console.log('\nNext steps:')
console.log('1. Update .env file with your actual values')
console.log('2. Place SSL certificates in the ssl/ directory')
console.log('3. Push to your repository')
console.log('4. Configure Coolify with the following settings:')
console.log('   - Repository: your-repo-url')
console.log('   - Branch: main')
console.log('   - Build Command: pnpm install && pnpm run build')
console.log('   - Start Command: docker-compose up -d')
console.log('   - Environment Variables: See .env file')