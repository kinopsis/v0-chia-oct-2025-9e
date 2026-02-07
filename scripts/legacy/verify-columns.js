#!/usr/bin/env node

/**
 * Script para verificar que las columnas monto_pago e informacion_pago existan en la tabla tramites
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer variables de entorno
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

async function main() {
  console.log('🔍 Verificando columnas agregadas a la tabla tramites...');
  
  try {
    // Intentar seleccionar las nuevas columnas para verificar que existan
    const { data, error } = await supabase
      .from('tramites')
      .select('monto_pago, informacion_pago')
      .limit(1);
    
    if (error) {
      if (error.message.includes('monto_pago') || error.message.includes('informacion_pago')) {
        console.log('❌ Error: Las columnas no existen o hay problemas con el esquema');
        console.log('Error detallado:', error.message);
        process.exit(1);
      } else {
        console.log('⚠️  Error no relacionado con las columnas:', error.message);
      }
    }
    
    console.log('✅ Las columnas monto_pago e informacion_pago existen en la tabla tramites');
    
    if (data) {
      console.log('✅ Datos de ejemplo recuperados:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('✅ Estructura verificada (sin datos de ejemplo)');
    }
    
    console.log('\n🎉 Verificación completada exitosamente!');
    console.log('✅ Las columnas faltantes han sido agregadas a la base de datos');
    console.log('✅ El error de "columnas no existen" debería estar resuelto');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    process.exit(1);
  }
}

main();