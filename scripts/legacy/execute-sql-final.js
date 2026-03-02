#!/usr/bin/env node

/**
 * Script final para ejecutar comandos SQL en Supabase usando el endpoint correcto
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer variables de entorno
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const envLines = envContent.split('\n');

let supabaseUrl = null;
let serviceRoleKey = null;

for (const line of envLines) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].replace(/"/g, '');
  }
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    serviceRoleKey = line.split('=')[1].replace(/"/g, '');
  }
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: No se encontraron las variables de entorno de Supabase (necesita SERVICE_ROLE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function executeSQLCommand(command, description) {
  console.log(`\n🚀 Ejecutando: ${description}`);
  console.log(`   Comando: ${command.substring(0, 80)}...`);
  
  try {
    // Usar el endpoint correcto de SQL de Supabase
    const response = await fetch(`${supabaseUrl.replace('https://', 'https://sql.')}supabase.co/v1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({
        statements: command
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.log(`   ❌ Error: ${result.message || result.error || response.statusText}`);
      return false;
    } else {
      console.log(`   ✅ Ejecutado exitosamente`);
      return true;
    }
  } catch (error) {
    console.log(`   ❌ Error de red: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando creación de columnas faltantes en tabla tramites...');
  
  // Comandos SQL para agregar las columnas (sin funciones complejas)
  const commands = [
    {
      command: 'ALTER TABLE tramites ADD COLUMN IF NOT EXISTS monto_pago TEXT;',
      description: 'Agregar columna monto_pago'
    },
    {
      command: 'ALTER TABLE tramites ADD COLUMN IF NOT EXISTS informacion_pago TEXT;',
      description: 'Agregar columna informacion_pago'
    }
  ];
  
  let successCount = 0;
  
  for (const { command, description } of commands) {
    const success = await executeSQLCommand(command, description);
    if (success) {
      successCount++;
    }
  }
  
  console.log(`\n📊 Resultados: ${successCount}/${commands.length} comandos ejecutados exitosamente`);
  
  if (successCount === commands.length) {
    console.log('\n🎉 Columnas principales creadas exitosamente!');
    console.log('✅ Columna monto_pago creada');
    console.log('✅ Columna informacion_pago creada');
    
    // Verificar las columnas
    console.log('\n🔍 Verificando columnas creadas...');
    try {
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('column_name,data_type,is_nullable')
        .eq('table_name', 'tramites')
        .in('column_name', ['monto_pago', 'informacion_pago']);
      
      if (error) {
        console.log('⚠️  Error en verificación:', error.message);
      } else if (data && data.length > 0) {
        console.log('✅ Columnas verificadas en la base de datos:');
        data.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
      } else {
        console.log('⚠️  No se encontraron las columnas en la verificación');
      }
    } catch (verifyError) {
      console.log('⚠️  Error durante verificación:', verifyError.message);
    }
    
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Reiniciar la aplicación (Ctrl+C y npm run dev)');
    console.log('   2. Probar crear/editar un trámite que requiere pago');
    console.log('   3. Verificar que el error de columnas faltantes haya desaparecido');
    
  } else {
    console.log('\n❌ Algunos comandos fallaron. Intenta nuevamente o verifica la conexión.');
  }
}

main().catch(error => {
  console.error('❌ Error fatal:', error.message);
  console.error(error.stack);
  process.exit(1);
});