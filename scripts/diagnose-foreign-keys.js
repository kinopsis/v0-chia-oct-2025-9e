#!/usr/bin/env node

/**
 * Script para diagnosticar problemas con claves foráneas y el esquema de PostgREST
 * Este script ayudará a identificar el error: "tramites_dependencia_id_fkey" 
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

async function executeQuery(query, description) {
  console.log(`\n🔍 ${description}`);
  console.log(`   Consulta: ${query.substring(0, 80)}...`);
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({ query })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.log(`   ❌ Error: ${result.message || response.statusText}`);
      return null;
    } else {
      console.log(`   ✅ Consulta ejecutada exitosamente`);
      return result.result || result.data || [];
    }
  } catch (error) {
    console.log(`   ❌ Error de red: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🔍 Diagnosticando problemas con claves foráneas y esquema de PostgREST...');
  console.log('📋 Buscando el error: "tramites_dependencia_id_fkey" y relaciones tramites-dependencias');
  
  // 1. Verificar restricciones de clave foránea en tramites
  const foreignKeys = await executeQuery(`
    SELECT 
      tc.constraint_name,
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM 
      information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
        AND tc.table_schema = ccu.table_schema
    WHERE 
      tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'tramites'
    ORDER BY 
      tc.constraint_name;
  `, 'Verificando restricciones de clave foránea en tabla tramites');
  
  if (foreignKeys && foreignKeys.length > 0) {
    console.log('\n🔗 Restricciones de clave foránea encontradas en tramites:');
    foreignKeys.forEach(fk => {
      console.log(`   - ${fk.constraint_name}: ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });
  } else {
    console.log('\n⚠️  No se encontraron restricciones de clave foránea en tramites');
  }
  
  // 2. Verificar columnas dependencia_id y subdependencia_id
  const columns = await executeQuery(`
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM 
      information_schema.columns
    WHERE 
      table_name = 'tramites'
      AND column_name IN ('dependencia_id', 'subdependencia_id', 'dependencia_nombre')
    ORDER BY 
      column_name;
  `, 'Verificando columnas de dependencias en tramites');
  
  if (columns && columns.length > 0) {
    console.log('\n📋 Columnas de dependencias encontradas:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
  } else {
    console.log('\n⚠️  No se encontraron columnas de dependencias en tramites');
  }
  
  // 3. Verificar si existe la restricción específica que menciona el error
  const specificConstraint = await executeQuery(`
    SELECT 
      constraint_name,
      table_name
    FROM 
      information_schema.table_constraints
    WHERE 
      constraint_name = 'tramites_dependencia_id_fkey'
      AND table_name = 'tramites';
  `, 'Buscando la restricción específica tramites_dependencia_id_fkey');
  
  if (specificConstraint && specificConstraint.length > 0) {
    console.log('\n🎯 Encontrada la restricción problemática:');
    specificConstraint.forEach(constraint => {
      console.log(`   - ${constraint.constraint_name} en tabla ${constraint.table_name}`);
    });
  } else {
    console.log('\n❓ No se encontró la restricción tramites_dependencia_id_fkey');
    console.log('   Esto sugiere que PostgREST está buscando una restricción que no existe');
  }
  
  // 4. Verificar el esquema de dependencias
  const dependenciasColumns = await executeQuery(`
    SELECT 
      column_name,
      data_type,
      is_nullable
    FROM 
      information_schema.columns
    WHERE 
      table_name = 'dependencias'
      AND column_name = 'id'
    ORDER BY 
      column_name;
  `, 'Verificando columna ID en tabla dependencias');
  
  if (dependenciasColumns && dependenciasColumns.length > 0) {
    console.log('\n✅ Tabla dependencias tiene columna ID');
  } else {
    console.log('\n❌ Tabla dependencias no tiene columna ID o no existe');
  }
  
  // 5. Verificar si las tablas existen en el esquema público
  const tables = await executeQuery(`
    SELECT 
      table_name
    FROM 
      information_schema.tables
    WHERE 
      table_schema = 'public'
      AND table_name IN ('tramites', 'dependencias')
    ORDER BY 
      table_name;
  `, 'Verificando existencia de tablas en esquema público');
  
  if (tables && tables.length === 2) {
    console.log('\n✅ Ambas tablas (tramites y dependencias) existen en el esquema público');
  } else {
    console.log('\n⚠️  Una o ambas tablas no existen en el esquema público');
    if (tables) {
      console.log('   Tablas encontradas:', tables.map(t => t.table_name).join(', '));
    }
  }
  
  console.log('\n📋 Resumen del diagnóstico:');
  console.log('   1. Verifique que las migraciones se hayan ejecutado correctamente');
  console.log('   2. Asegúrese de que las restricciones de clave foránea existan con los nombres correctos');
  console.log('   3. Confirme que PostgREST tenga el caché de esquema actualizado');
  console.log('   4. Revise si hay discrepancias entre el esquema esperado y el real');
  
  console.log('\n🔧 Posibles soluciones:');
  console.log('   1. Ejecutar las migraciones faltantes');
  console.log('   2. Reiniciar/reinicializar PostgREST para actualizar el caché');
  console.log('   3. Verificar nombres exactos de restricciones vs. lo que espera PostgREST');
}

main().catch(error => {
  console.error('❌ Error fatal:', error.message);
  console.error(error.stack);
  process.exit(1);
});