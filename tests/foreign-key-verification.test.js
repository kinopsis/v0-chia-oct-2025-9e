#!/usr/bin/env node

/**
 * Prueba para verificar el estado de las claves foráneas y probar la API PUT
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

async function testForeignKeyStatus() {
  console.log('🔍 Verificando estado de claves foráneas...\n');
  
  try {
    // Verificar restricciones existentes
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, table_name, constraint_type')
      .eq('table_name', 'tramites')
      .eq('constraint_type', 'FOREIGN KEY');

    if (constraintsError) {
      console.error('❌ Error al verificar restricciones:', constraintsError.message);
      return false;
    }

    console.log('📋 Restricciones de clave foránea encontradas:');
    constraints.forEach(constraint => {
      console.log(`   - ${constraint.constraint_name}`);
    });

    const hasCorrectConstraints = constraints.some(c => c.constraint_name === 'tramites_dependencia_id_fkey') &&
                                 constraints.some(c => c.constraint_name === 'tramites_subdependencia_id_fkey');

    if (hasCorrectConstraints) {
      console.log('✅ Las restricciones tienen nombres correctos para PostgREST');
    } else {
      console.log('⚠️  Las restricciones no tienen nombres estándar para PostgREST');
      console.log('   Esto puede causar el error: "Could not find a relationship between tramites and dependencias"');
    }

    return hasCorrectConstraints;

  } catch (error) {
    console.error('❌ Error al verificar claves foráneas:', error.message);
    return false;
  }
}

async function testPUTAPI() {
  console.log('\n🔍 Probando API PUT /api/admin/tramites/[id]...\n');
  
  try {
    // Primero obtener un trámite existente
    const { data: tramites, error: fetchError } = await supabase
      .from('tramites')
      .select('id, nombre_tramite, dependencia_id')
      .limit(1);

    if (fetchError || !tramites || tramites.length === 0) {
      console.log('⚠️  No se encontraron trámites para probar');
      return false;
    }

    const tramite = tramites[0];
    console.log(`📋 Usando trámite: ${tramite.nombre_tramite} (ID: ${tramite.id})`);

    // Intentar actualizar el trámite
    const updateData = {
      nombre_tramite: `${tramite.nombre_tramite} - Actualizado`,
      descripcion: 'Descripción actualizada para prueba'
    };

    const { data: updated, error: updateError } = await supabase
      .from('tramites')
      .update(updateData)
      .eq('id', tramite.id)
      .select();

    if (updateError) {
      console.error('❌ Error al actualizar trámite:', updateError.message);
      
      if (updateError.message.includes('Could not find a relationship')) {
        console.log('🚨 Se detectó el error de PostgREST: relaciones no encontradas');
      }
      return false;
    }

    console.log('✅ Actualización exitosa');
    console.log('📋 Datos actualizados:', {
      id: updated && updated[0] ? updated[0].id : 'desconocido',
      nombre_tramite: updated && updated[0] ? updated[0].nombre_tramite : 'desconocido'
    });

    return true;

  } catch (error) {
    console.error('❌ Error en prueba de API PUT:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando verificación de claves foráneas y API PUT...\n');
  
  const hasCorrectConstraints = await testForeignKeyStatus();
  const apiTestSuccess = await testPUTAPI();
  
  console.log('\n🎯 Resultados:');
  console.log(`   Claves foráneas correctas: ${hasCorrectConstraints ? '✅' : '❌'}`);
  console.log(`   API PUT funcional: ${apiTestSuccess ? '✅' : '❌'}`);
  
  if (hasCorrectConstraints && apiTestSuccess) {
    console.log('\n🎉 Todo parece estar funcionando correctamente');
  } else {
    console.log('\n⚠️  Se detectaron problemas que necesitan atención');
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { testForeignKeyStatus, testPUTAPI };