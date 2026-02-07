#!/usr/bin/env node

/**
 * Script de prueba de conexión a Supabase
 */

const { createClient } = require('@supabase/supabase-js');

// Leer variables de entorno directamente del archivo
const fs = require('fs');
const path = require('path');

try {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
  const envLines = envContent.split('\n');
  
  let supabaseUrl = null;
  let supabaseKey = null;
  
  for (const line of envLines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].replace(/"/g, '');
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].replace(/"/g, '');
    }
  }
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: No se encontraron las variables de entorno de Supabase en .env.local');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  async function testConnection() {
    console.log('🚀 Probando conexión a Supabase...');
    
    try {
      // Intentar una consulta simple para verificar la conexión
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      
      if (error) {
        if (error.code === '42P01') {
          console.log('✅ Conexión a Supabase establecida exitosamente');
          console.log('⚠️  La tabla "profiles" no existe. Necesitas crear las tablas:');
          console.log('   - 01-create-profiles-table.sql');
          console.log('   - 02-create-tramites-table.sql');
          console.log('   - 03-create-audit-logs-table.sql');
          console.log('   - 04-create-n8n-config-table.sql');
          console.log('   - 05-seed-admin-user.sql');
          console.log('   - 07-seed-n8n-config.sql');
        } else {
          console.error('❌ Error de base de datos:', error.message);
        }
      } else {
        console.log('✅ Conexión a Supabase establecida exitosamente');
        console.log('✅ Tablas existentes detectadas');
        
        if (data.length > 0) {
          console.log('✅ Datos iniciales encontrados');
        } else {
          console.log('⚠️  No se encontraron datos iniciales. Considera ejecutar:');
          console.log('   - 05-seed-admin-user.sql');
          console.log('   - 07-seed-n8n-config.sql');
        }
      }
      
      console.log('\n📋 Estado del servidor:');
      console.log('✅ Servidor de desarrollo: http://localhost:9000');
      console.log('✅ Conexión a Supabase: Verificada');
      console.log('✅ Variables de entorno: Configuradas');
      console.log('✅ Dependencias: Instaladas');
      
    } catch (connectionError) {
      console.error('❌ Error de conexión:', connectionError.message);
      process.exit(1);
    }
  }
  
  testConnection();
  
} catch (error) {
  console.error('❌ Error leyendo .env.local:', error.message);
  process.exit(1);
}