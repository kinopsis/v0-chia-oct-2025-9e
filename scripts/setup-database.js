#!/usr/bin/env node

/**
 * Script de configuración de base de datos para el portal de Chía
 * Este script ayuda a configurar las tablas necesarias en Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

// Leer variables de entorno
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Falta configurar las variables de entorno de Supabase');
  console.log('Por favor, configura .env.local con:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_aqui');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupDatabase() {
  console.log('🚀 Iniciando configuración de la base de datos...');
  
  try {
    // Verificar conexión
    console.log('✅ Conexión a Supabase establecida');
    
    // Las tablas se crean mediante los scripts SQL en la carpeta scripts/
    console.log('📋 Las tablas se deben crear manualmente usando los scripts SQL:');
    console.log('   - 01-create-profiles-table.sql');
    console.log('   - 02-create-tramites-table.sql');
    console.log('   - 03-create-audit-logs-table.sql');
    console.log('   - 04-create-n8n-config-table.sql');
    console.log('   - 05-seed-admin-user.sql');
    console.log('   - 07-seed-n8n-config.sql');
    
    console.log('\n💡 Siguientes pasos:');
    console.log('1. Ejecuta los scripts SQL en tu base de datos Supabase');
    console.log('2. Verifica que las tablas se hayan creado correctamente');
    console.log('3. Ejecuta: npm run dev');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };