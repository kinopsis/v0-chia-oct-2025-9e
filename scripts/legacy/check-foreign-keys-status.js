#!/usr/bin/env node

/**
 * Script simple para verificar el estado de las claves foráneas entre tramites y dependencias
 * Este script ayuda a diagnosticar el error de PostgREST sobre relaciones no encontradas
 */

import { createClient } from '../lib/supabase/server.js'

async function checkForeignKeyStatus() {
  console.log('🔍 Verificando estado de claves foráneas tramites-dependencias\n')

  try {
    const supabase = await createClient()

    // 1. Verificar si existen las columnas necesarias
    console.log('✅ Paso 1: Verificando columnas en tabla tramites...')
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'tramites')
      .in('column_name', ['dependencia_id', 'subdependencia_id'])
      .order('column_name')

    if (columnsError) {
      console.error('❌ Error al verificar columnas:', columnsError.message)
      return false
    }

    console.log('📋 Columnas encontradas:')
    const hasDepId = columns?.some(c => c.column_name === 'dependencia_id')
    const hasSubDepId = columns?.some(c => c.column_name === 'subdependencia_id')
    
    if (hasDepId) {
      const depCol = columns?.find(c => c.column_name === 'dependencia_id')
      console.log(`   ✅ dependencia_id: ${depCol?.data_type} (${depCol?.is_nullable ? 'nullable' : 'not null'})`)
    } else {
      console.error('   ❌ Falta columna: dependencia_id')
    }

    if (hasSubDepId) {
      const subDepCol = columns?.find(c => c.column_name === 'subdependencia_id')
      console.log(`   ✅ subdependencia_id: ${subDepCol?.data_type} (${subDepCol?.is_nullable ? 'nullable' : 'not null'})`)
    } else {
      console.error('   ❌ Falta columna: subdependencia_id')
    }

    if (!hasDepId || !hasSubDepId) {
      console.log('\n🔧 SOLUCIÓN: Agregar columnas faltantes')
      console.log('Ejecute estas sentencias SQL:')
      if (!hasDepId) {
        console.log('ALTER TABLE tramites ADD COLUMN dependencia_id INTEGER;')
      }
      if (!hasSubDepId) {
        console.log('ALTER TABLE tramites ADD COLUMN subdependencia_id INTEGER;')
      }
      return false
    }
    console.log('')

    // 2. Verificar restricciones de clave foránea
    console.log('✅ Paso 2: Verificando restricciones de clave foránea...')
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select(`
        constraint_name,
        table_name,
        constraint_type
      `)
      .eq('table_name', 'tramites')
      .eq('constraint_type', 'FOREIGN KEY')

    if (constraintsError) {
      console.error('❌ Error al verificar restricciones:', constraintsError.message)
      return false
    }

    console.log('🔗 Restricciones de clave foránea encontradas:')
    if (constraints?.length === 0) {
      console.error('   ❌ No se encontraron restricciones de clave foránea en tramites')
      console.log('\n🔧 SOLUCIÓN: Crear restricciones de clave foránea')
      console.log('Ejecute estas sentencias SQL:')
      console.log('ALTER TABLE tramites ADD CONSTRAINT tramites_dependencia_id_fkey FOREIGN KEY (dependencia_id) REFERENCES dependencias(id);')
      console.log('ALTER TABLE tramites ADD CONSTRAINT tramites_subdependencia_id_fkey FOREIGN KEY (subdependencia_id) REFERENCES dependencias(id);')
      return false
    }

    // Verificar detalles de las restricciones
    const constraintNames = constraints?.map(c => c.constraint_name)
    console.log(`   ✅ Restricciones encontradas: ${constraintNames.join(', ')}`)

    // Verificar nombres esperados por PostgREST
    const expectedNames = ['tramites_dependencia_id_fkey', 'tramites_subdependencia_id_fkey']
    const hasCorrectNames = expectedNames.every(name => constraintNames?.includes(name))
    
    if (!hasCorrectNames) {
      console.warn('   ⚠️  Nombres de restricciones no estándar detectados')
      console.log('   PostgREST espera nombres como:', expectedNames.join(', '))
      console.log('   Si los nombres son diferentes, puede renombrarlos con:')
      console.log('   ALTER TABLE tramites RENAME CONSTRAINT [nombre_actual] TO tramites_dependencia_id_fkey;')
    }
    console.log('')

    // 3. Verificar integridad referencial
    console.log('✅ Paso 3: Verificando integridad referencial...')
    const { data: integrityCheck, error: integrityError } = await supabase
      .rpc('sql', { 
        query: `
          SELECT 
            COUNT(*) as total_tramites,
            COUNT(dependencia_id) as con_dependencia_id,
            COUNT(subdependencia_id) as con_subdependencia_id,
            COUNT(*) FILTER (WHERE dependencia_id IS NOT NULL AND dependencia_id NOT IN (SELECT id FROM dependencias)) as dependencia_invalida,
            COUNT(*) FILTER (WHERE subdependencia_id IS NOT NULL AND subdependencia_id NOT IN (SELECT id FROM dependencias)) as subdependencia_invalida
          FROM tramites
        `
      })

    if (integrityError) {
      console.error('❌ Error al verificar integridad:', integrityError.message)
      return false
    }

    const integrity = integrityCheck?.[0]
    console.log('📊 Estado de integridad referencial:')
    console.log(`   - Total trámites: ${integrity?.total_tramites || 0}`)
    console.log(`   - Con dependencia_id: ${integrity?.con_dependencia_id || 0}`)
    console.log(`   - Con subdependencia_id: ${integrity?.con_subdependencia_id || 0}`)
    
    if (integrity?.dependencia_invalida > 0) {
      console.error(`   ❌ ${integrity.dependencia_invalida} trámites con dependencia_id inválida`)
    }
    if (integrity?.subdependencia_invalida > 0) {
      console.error(`   ❌ ${integrity.subdependencia_invalida} trámites con subdependencia_id inválida`)
    }

    if ((integrity?.dependencia_invalida || 0) > 0 || (integrity?.subdependencia_invalida || 0) > 0) {
      console.log('\n🔧 SOLUCIÓN: Corregir referencias inválidas')
      console.log('Identifique y corrija los valores inválidos en dependencia_id/subdependencia_id')
      return false
    }
    console.log('   ✅ Integridad referencial verificada')
    console.log('')

    // 4. Verificar datos de ejemplo
    console.log('✅ Paso 4: Muestra de datos relacionados...')
    const { data: sampleData, error: sampleError } = await supabase
      .from('tramites')
      .select(`
        id,
        nombre_tramite,
        dependencia_id,
        subdependencia_id,
        dependencias:dependencias!tramites_dependencia_id_fkey (id, nombre, tipo),
        subdependencias:dependencias!tramites_subdependencia_id_fkey (id, nombre, tipo)
      `)
      .not('dependencia_id', 'is', null)
      .limit(3)

    if (sampleError) {
      console.error('❌ Error al obtener muestra de datos:', sampleError.message)
      console.log('   ⚠️  Este error confirma el problema con las relaciones de PostgREST')
      console.log('   ⚠️  Verifique los nombres de las restricciones y el caché de PostgREST')
    } else if (sampleData?.length > 0) {
      console.log('📋 Ejemplo de trámites con relaciones:')
      sampleData.forEach(tramite => {
        console.log(`   - ${tramite.nombre_tramite} (ID: ${tramite.id})`)
        console.log(`     Dependencia: ${tramite.dependencias?.nombre || 'No encontrada'} (${tramite.dependencias?.tipo || 'desconocido'})`)
        console.log(`     Subdependencia: ${tramite.subdependencias?.nombre || 'No encontrada'} (${tramite.subdependencias?.tipo || 'desconocido'})`)
      })
    } else {
      console.log('   ⚠️  No se encontraron trámites con relaciones activas')
    }

    console.log('\n✅ Diagnóstico completado exitosamente')
    console.log('\n📋 RESUMEN:')
    console.log('✅ Columnas de clave foránea existen')
    console.log('✅ Restricciones de clave foránea configuradas')
    console.log('✅ Integridad referencial verificada')
    
    if (!hasCorrectNames) {
      console.log('⚠️  Recomendación: Verifique los nombres de restricciones con PostgREST')
    }

    return true

  } catch (error) {
    console.error('❌ Error general en el diagnóstico:', error.message)
    return false
  }
}

// Verificar si se está ejecutando desde línea de comandos
if (import.meta.url === `file://${process.argv[1]}`) {
  checkForeignKeyStatus().then(success => {
    console.log('\n🎯 Verificación de claves foráneas completada')
    process.exit(success ? 0 : 1)
  }).catch(error => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
}

export { checkForeignKeyStatus }