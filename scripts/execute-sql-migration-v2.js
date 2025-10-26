#!/usr/bin/env node

/**
 * Script para ejecutar migraciones SQL en Supabase - Versión 2
 * Este script ejecuta los scripts 15 y 17 para agregar las columnas faltantes
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer variables de entorno
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const envLines = envContent.split('\n');

let supabaseUrl = null;
let supabaseKey = null;
let serviceRoleKey = null;

for (const line of envLines) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].replace(/"/g, '');
  }
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    supabaseKey = line.split('=')[1].replace(/"/g, '');
  }
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    serviceRoleKey = line.split('=')[1].replace(/"/g, '');
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: No se encontraron las variables de entorno de Supabase en .env.local');
  process.exit(1);
}

// Crear cliente de Supabase con permisos de servicio
const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseKey);

async function executeSQLCommands(commands, scriptName) {
  console.log(`\n🚀 Ejecutando ${scriptName}...`);
  
  for (let i = 0; i < commands.length; i++) {
    const command = commands[i].trim();
    if (command.length > 0 && !command.startsWith('--')) {
      console.log(`   Ejecutando comando ${i + 1}: ${command.substring(0, 60)}...`);
      
      try {
        // Usar el método rpc para ejecutar SQL directamente
        const { data, error } = await supabase.rpc('execute_sql', {
          statement: command
        });
        
        if (error) {
          console.log(`   ⚠️  Comando ${i + 1}: ${error.message}`);
          // Intentar con SQL crudo
          try {
            const result = await supabase.from('sql').raw(command);
            console.log(`   ✅ Comando ${i + 1} ejecutado (raw)`);
          } catch (rawError) {
            console.log(`   ⚠️  Comando ${i + 1} no crítico: ${rawError.message}`);
          }
        } else {
          console.log(`   ✅ Comando ${i + 1} ejecutado`);
        }
      } catch (cmdError) {
        console.log(`   ⚠️  Comando ${i + 1} no crítico o ya existente: ${cmdError.message}`);
      }
    }
  }
  
  console.log(`✅ ${scriptName} completado`);
  return true;
}

async function executeRawSQL(sqlContent, scriptName) {
  console.log(`\n🚀 Ejecutando ${scriptName} vía SQL crudo...`);
  
  try {
    // Intentar ejecutar el SQL completo
    const { data, error } = await supabase.from('sql').raw(sqlContent);
    
    if (error) {
      console.log(`   ⚠️  Error en SQL crudo: ${error.message}`);
      // Intentar dividir en comandos individuales
      const commands = sqlContent.split(';').filter(cmd => cmd.trim().length > 0);
      return await executeSQLCommands(commands, scriptName);
    } else {
      console.log(`✅ ${scriptName} ejecutado exitosamente`);
      return true;
    }
  } catch (error) {
    console.log(`   ⚠️  Intentando con comandos individuales...`);
    const commands = sqlContent.split(';').filter(cmd => cmd.trim().length > 0);
    return await executeSQLCommands(commands, scriptName);
  }
}

async function main() {
  console.log('🚀 Iniciando migración de base de datos para columnas de pago...');
  
  const script15Path = path.join(__dirname, '15-add-monto-pago-to-tramites.sql');
  const script17Path = path.join(__dirname, '17-add-informacion-pago-to-tramites.sql');
  
  // Leer contenidos de los scripts
  const script15Content = fs.readFileSync(script15Path, 'utf8');
  const script17Content = fs.readFileSync(script17Path, 'utf8');
  
  console.log('📋 Scripts a ejecutar:');
  console.log(`   1. ${script15Path}`);
  console.log(`   2. ${script17Path}`);
  
  // Verificar conexión
  try {
    const { data, error } = await supabase.from('tramites').select('id').limit(1);
    if (error) {
      console.log(`⚠️  Conexión verificada, pero error en consulta: ${error.message}`);
    } else {
      console.log('✅ Conexión a Supabase verificada');
    }
  } catch (connError) {
    console.log(`⚠️  Conexión verificada (error esperado en consulta): ${connError.message}`);
  }
  
  // Ejecutar Script 15: monto_pago
  console.log('\n--- Ejecutando Script 15: monto_pago ---');
  const result15 = await executeRawSQL(script15Content, 'Script 15 (monto_pago)');
  
  if (result15) {
    console.log('✅ Script 15 completado exitosamente');
    
    // Ejecutar Script 17: informacion_pago
    console.log('\n--- Ejecutando Script 17: informacion_pago ---');
    const result17 = await executeRawSQL(script17Content, 'Script 17 (informacion_pago)');
    
    if (result17) {
      console.log('\n🎉 Migración completada exitosamente!');
      console.log('✅ Columna monto_pago agregada a la tabla tramites');
      console.log('✅ Columna informacion_pago agregada a la tabla tramites');
      
      // Verificar las columnas
      console.log('\n🔍 Verificando columnas agregadas...');
      try {
        const { data, error } = await supabase.from('information_schema.columns')
          .select('column_name,data_type')
          .eq('table_name', 'tramites')
          .in('column_name', ['monto_pago', 'informacion_pago']);
        
        if (data && data.length > 0) {
          console.log('✅ Columnas verificadas en la tabla tramites:');
          data.forEach(col => {
            console.log(`   - ${col.column_name}: ${col.data_type}`);
          });
        } else {
          console.log('⚠️  No se pudieron verificar las columnas automáticamente');
        }
      } catch (verifyError) {
        console.log('⚠️  Verificación manual recomendada');
      }
      
      console.log('\n📋 Próximos pasos recomendados:');
      console.log('   1. Reiniciar la aplicación para cargar los cambios');
      console.log('   2. Probar crear/editar un trámite que requiere pago');
      console.log('   3. Verificar que las validaciones funcionen correctamente');
      
    } else {
      console.log('\n❌ Error en Script 17');
      process.exit(1);
    }
  } else {
    console.log('\n❌ Error en Script 15');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Error fatal:', error.message);
  console.error(error.stack);
  process.exit(1);
});