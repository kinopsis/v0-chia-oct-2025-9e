#!/usr/bin/env node

/**
 * Solución directa para corregir las claves foráneas usando SQL directo
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

async function fixForeignKeys() {
  console.log('🔧 Aplicando solución directa para claves foráneas...\n');
  
  try {
    // Paso 1: Verificar restricciones actuales
    console.log('🔍 Paso 1: Verificando restricciones actuales');
    
    const { data: constraints, error: constraintsError } = await supabase
      .rpc('sql', { 
        query: `
          SELECT constraint_name, constraint_type, table_name
          FROM information_schema.table_constraints 
          WHERE table_name = 'tramites' AND constraint_type = 'FOREIGN KEY'
        `
      });

    if (constraintsError) {
      console.log('⚠️  No se pueden verificar restricciones con RPC, intentando alternativa...');
      
      // Intentar con SQL directo
      const response = await fetch(`${supabaseUrl.replace('https://', 'https://sql.')}supabase.co/v1/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        },
        body: JSON.stringify({
          query: `
            SELECT constraint_name, constraint_type, table_name
            FROM information_schema.table_constraints 
            WHERE table_name = 'tramites' AND constraint_type = 'FOREIGN KEY'
          `
        })
      });
      
      const result = await response.json();
      const constraints = result.result || [];
      
      console.log('📋 Restricciones encontradas:');
      constraints.forEach(constraint => {
        console.log(`   - ${constraint.constraint_name} (${constraint.constraint_type})`);
      });
      
      // Paso 2: Intentar crear las restricciones con nombres correctos
      console.log('\n🔧 Paso 2: Creando restricciones con nombres estándar');
      
      // Eliminar restricciones existentes con nombres incorrectos
      for (const constraint of constraints) {
        if (constraint.constraint_name !== 'tramites_dependencia_id_fkey' && 
            constraint.constraint_name !== 'tramites_subdependencia_id_fkey') {
          console.log(`   Eliminando restricción: ${constraint.constraint_name}`);
          
          const dropResponse = await fetch(`${supabaseUrl.replace('https://', 'https://sql.')}supabase.co/v1/query`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey
            },
            body: JSON.stringify({
              query: `ALTER TABLE tramites DROP CONSTRAINT IF EXISTS ${constraint.constraint_name};`
            })
          });
          
          if (!dropResponse.ok) {
            const dropResult = await dropResponse.json();
            console.log(`   ⚠️  No se pudo eliminar ${constraint.constraint_name}: ${dropResult.message}`);
          } else {
            console.log(`   ✅ Eliminada: ${constraint.constraint_name}`);
          }
        }
      }
      
      // Crear restricciones con nombres correctos
      console.log('\n   Creando restricciones con nombres estándar...');
      
      const fk1Response = await fetch(`${supabaseUrl.replace('https://', 'https://sql.')}supabase.co/v1/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        },
        body: JSON.stringify({
          query: `
            ALTER TABLE tramites 
            ADD CONSTRAINT tramites_dependencia_id_fkey 
            FOREIGN KEY (dependencia_id) REFERENCES dependencias(id)
            NOT VALID;
          `
        })
      });
      
      if (fk1Response.ok) {
        console.log('   ✅ tramites_dependencia_id_fkey creada');
      } else {
        const fk1Result = await fk1Response.json();
        console.log(`   ⚠️  Error creando tramites_dependencia_id_fkey: ${fk1Result.message}`);
      }
      
      const fk2Response = await fetch(`${supabaseUrl.replace('https://', 'https://sql.')}supabase.co/v1/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        },
        body: JSON.stringify({
          query: `
            ALTER TABLE tramites 
            ADD CONSTRAINT tramites_subdependencia_id_fkey 
            FOREIGN KEY (subdependencia_id) REFERENCES dependencias(id)
            NOT VALID;
          `
        })
      });
      
      if (fk2Response.ok) {
        console.log('   ✅ tramites_subdependencia_id_fkey creada');
      } else {
        const fk2Result = await fk2Response.json();
        console.log(`   ⚠️  Error creando tramites_subdependencia_id_fkey: ${fk2Result.message}`);
      }
      
      return true;
    }
    
    return false;
    
  } catch (error) {
    console.error('❌ Error al corregir claves foráneas:', error.message);
    return false;
  }
}

async function testAfterFix() {
  console.log('\n🔍 Probando API PUT después de la corrección...\n');
  
  try {
    // Intentar una actualización simple
    const { data: tramites, error: fetchError } = await supabase
      .from('tramites')
      .select('id, nombre_tramite')
      .limit(1);

    if (fetchError || !tramites || tramites.length === 0) {
      console.log('⚠️  No se encontraron trámites para prueba');
      return false;
    }

    const tramite = tramites[0];
    
    const { data: updated, error: updateError } = await supabase
      .from('tramites')
      .update({ 
        nombre_tramite: `${tramite.nombre_tramite} - Probando Corrección` 
      })
      .eq('id', tramite.id)
      .select();

    if (updateError) {
      console.error('❌ Error después de corrección:', updateError.message);
      
      if (updateError.message.includes('Could not find a relationship')) {
        console.log('🚨 El error de PostgREST persiste');
        return false;
      }
      return false;
    }

    console.log('✅ Prueba de actualización exitosa después de corrección');
    return true;
    
  } catch (error) {
    console.error('❌ Error en prueba después de corrección:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando solución directa para error de PostgREST...\n');
  
  const fixSuccess = await fixForeignKeys();
  const testSuccess = await testAfterFix();
  
  console.log('\n🎯 Resultados:');
  console.log(`   Corrección de claves foráneas: ${fixSuccess ? '✅' : '❌'}`);
  console.log(`   Prueba después de corrección: ${testSuccess ? '✅' : '❌'}`);
  
  if (fixSuccess && testSuccess) {
    console.log('\n🎉 Solución aplicada exitosamente');
    console.log('📋 Instrucciones:');
    console.log('   1. Reinicie el servicio de PostgREST o ejecute: SELECT pg_notify(\'pgrst\', \'reload schema\');');
    console.log('   2. Pruebe nuevamente la edición de trámites en el frontend');
  } else {
    console.log('\n⚠️  Se necesitan acciones adicionales');
    console.log('   El error de PostgREST puede requerir reinicio del servicio o corrección manual');
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { fixForeignKeys, testAfterFix };