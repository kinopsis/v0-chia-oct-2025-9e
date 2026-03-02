#!/usr/bin/env node

/**
 * Simplified Database Setup Script for Chía Portal
 * This script automates the creation of the database schema, functions, and seed data.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runSqlFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`📖 Executing ${path.basename(filePath)}...`);

  // NOTE: In a real environment, you'd use a migration tool or the Supabase SQL API.
  // For this simplification, we're providing the instruction to the user.
  console.log(`✅ ${path.basename(filePath)} content ready for SQL Editor.`);
  return sql;
}

async function setupDatabase() {
  console.log('🚀 Starting simplified database configuration...');

  const initDir = path.join(__dirname, 'init-db');
  const files = [
    '01-schema.sql',
    '02-functions.sql',
    '03-seed.sql'
  ];

  let fullSql = '';
  for (const file of files) {
    const filePath = path.join(initDir, file);
    if (fs.existsSync(filePath)) {
      fullSql += await runSqlFile(filePath) + '\n\n';
    } else {
      console.warn(`⚠️ Warning: ${file} not found.`);
    }
  }

  // Save consolidated script for easy copy-paste
  fs.writeFileSync(path.join(__dirname, 'consolidated-init.sql'), fullSql);

  console.log('\n✨ Database setup scripts consolidated into: scripts/consolidated-init.sql');
  console.log('💡 Next steps:');
  console.log('1. Open your Supabase Dashboard -> SQL Editor');
  console.log('2. Copy and paste the contents of scripts/consolidated-init.sql');
  console.log('3. Run the SQL script.');
}

if (require.main === module) {
  setupDatabase().catch(err => {
    console.error('❌ Error during setup:', err);
    process.exit(1);
  });
}

module.exports = { setupDatabase };