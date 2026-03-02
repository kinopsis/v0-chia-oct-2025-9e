#!/usr/bin/env node

/**
 * Script para ejecutar comandos SQL simples directamente en Supabase
 * Este script intentará agregar las columnas de forma más directa
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

async function executeSimpleCommand(command, description) {
  console.log(`\n🚀 Ejecutando: ${description}`);
  console.log(`   Comando: ${command.substring(0, 80)}...`);
  
  try {
    // Intentar ejecutar el comando SQL directamente usando el endpoint de SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({
        query: command
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.log(`   ❌ Error: ${result.message || response.statusText}`);
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
  
  // Comandos SQL simples para agregar las columnas
  const commands = [
    {
      command: 'ALTER TABLE tramites ADD COLUMN IF NOT EXISTS monto_pago TEXT;',
      description: 'Agregar columna monto_pago'
    },
    {
      command: 'COMMENT ON COLUMN tramites.monto_pago IS \'Monto del pago asociado al trámite cuando requiere_pago = \'\'Sí\'\';',
      description: 'Agregar comentario a monto_pago'
    },
    {
      command: 'CREATE INDEX IF NOT EXISTS idx_tramites_monto_pago ON tramites(monto_pago);',
      description: 'Crear índice para monto_pago'
    },
    {
      command: 'ALTER TABLE tramites ADD COLUMN IF NOT EXISTS informacion_pago TEXT;',
      description: 'Agregar columna informacion_pago'
    },
    {
      command: 'COMMENT ON COLUMN tramites.informacion_pago IS \'Información detallada del pago asociado al trámite cuando requiere_pago = \'\'Sí\'\';',
      description: 'Agregar comentario a informacion_pago'
    },
    {
      command: 'CREATE INDEX IF NOT EXISTS idx_tramites_informacion_pago ON tramites(informacion_pago);',
      description: 'Crear índice para informacion_pago'
    }
  ];
  
  let successCount = 0;
  
  for (const { command, description } of commands) {
    const success = await executeSimpleCommand(command, description);
    if (success) {
      successCount++;
    }
  }
  
  console.log(`\n📊 Resultados: ${successCount}/${commands.length} comandos ejecutados exitosamente`);
  
  if (successCount === commands.length) {
    console.log('\n🎉 Todas las columnas han sido agregadas exitosamente!');
    console.log('✅ Columna monto_pago creada');
    console.log('✅ Columna informacion_pago creada');
    console.log('✅ Índices creados para mejor performance');
    console.log('✅ Comentarios agregados para documentación');
    
    // Verificar las columnas
    console.log('\n🔍 Verificando columnas creadas...');
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        },
        body: JSON.stringify({
          query: `SELECT column_name, data_type, is_nullable 
                  FROM information_schema.columns 
                  WHERE table_name = 'tramites' 
                  AND column_name IN ('monto_pago', 'informacion_pago');`
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.result && result.result.length > 0) {
        console.log('✅ Columnas verificadas en la base de datos:');
        result.result.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
      } else {
        console.log('⚠️  No se pudieron verificar las columnas automáticamente');
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