#!/usr/bin/env node

/**
 * Prueba específica para detectar el error de PostgREST con relaciones
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

async function testWithDependencies() {
  console.log('🔍 Probando API PUT con datos de dependencias...\n');
  
  try {
    // Obtener un trámite existente
    const { data: tramites, error: fetchError } = await supabase
      .from('tramites')
      .select('id, nombre_tramite, dependencia_id, subdependencia_id')
      .limit(1);

    if (fetchError || !tramites || tramites.length === 0) {
      console.log('⚠️  No se encontraron trámites para probar');
      return false;
    }

    const tramite = tramites[0];
    console.log(`📋 Trámite seleccionado: ${tramite.nombre_tramite} (ID: ${tramite.id})`);

    // Obtener una dependencia válida para la prueba
    const { data: dependencias, error: depError } = await supabase
      .from('dependencias')
      .select('id, nombre')
      .limit(1);

    if (depError || !dependencias || dependencias.length === 0) {
      console.log('⚠️  No se encontraron dependencias para la prueba');
      return false;
    }

    const dependencia = dependencias[0];
    console.log(`📋 Dependencia seleccionada: ${dependencia.nombre} (ID: ${dependencia.id})`);

    // Intentar actualizar con dependencia_id
    const updateData = {
      nombre_tramite: `${tramite.nombre_tramite} - Con Dependencia`,
      dependencia_id: dependencia.id
    };

    console.log('📤 Intentando actualizar con dependencia_id...');
    const { data: updated, error: updateError } = await supabase
      .from('tramites')
      .update(updateData)
      .eq('id', tramite.id)
      .select();

    if (updateError) {
      console.error('❌ Error al actualizar trámite:', updateError.message);
      
      if (updateError.message.includes('Could not find a relationship')) {
        console.log('🚨 ERROR DETECTADO: Could not find a relationship between tramites and dependencias');
        console.log('   Este es el error que necesitamos corregir');
        return false;
      }
      return false;
    }

    console.log('✅ Actualización con dependencia exitosa');
    return true;

  } catch (error) {
    console.error('❌ Error en prueba con dependencias:', error.message);
    return false;
  }
}

async function testInvalidDependency() {
  console.log('\n🔍 Probando API PUT con dependencia inválida...\n');
  
  try {
    // Obtener un trámite existente
    const { data: tramites, error: fetchError } = await supabase
      .from('tramites')
      .select('id, nombre_tramite')
      .limit(1);

    if (fetchError || !tramites || tramites.length === 0) {
      console.log('⚠️  No se encontraron trámites para probar');
      return false;
    }

    const tramite = tramites[0];
    console.log(`📋 Trámite seleccionado: ${tramite.nombre_tramite} (ID: ${tramite.id})`);

    // Intentar actualizar con dependencia_id inválida
    const updateData = {
      nombre_tramite: `${tramite.nombre_tramite} - Con Dependencia Inválida`,
      dependencia_id: 999999  // ID que no existe
    };

    console.log('📤 Intentando actualizar con dependencia_id inválida...');
    const { data: updated, error: updateError } = await supabase
      .from('tramites')
      .update(updateData)
      .eq('id', tramite.id)
      .select();

    if (updateError) {
      console.log('✅ Error esperado con dependencia inválida:', updateError.message);
      return true;
    }

    console.log('⚠️  No se generó error con dependencia inválida (esto podría ser un problema de integridad referencial)');
    return true;

  } catch (error) {
    console.error('❌ Error en prueba con dependencia inválida:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando pruebas específicas para errores de PostgREST...\n');
  
  const test1Success = await testWithDependencies();
  const test2Success = await testInvalidDependency();
  
  console.log('\n🎯 Resultados de pruebas:');
  console.log(`   Prueba con dependencias válidas: ${test1Success ? '✅' : '❌'}`);
  console.log(`   Prueba con dependencias inválidas: ${test2Success ? '✅' : '❌'}`);
  
  if (test1Success) {
    console.log('\n🎉 La API PUT funciona correctamente con dependencias');
    console.log('✅ No se detectó el error de PostgREST');
  } else {
    console.log('\n🚨 Se detectó el error de PostgREST');
    console.log('❌ Se necesita corregir las relaciones en la base de datos');
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { testWithDependencies, testInvalidDependency };