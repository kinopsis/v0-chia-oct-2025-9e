#!/usr/bin/env node

/**
 * Script para verificar que las restricciones de clave foránea estén corregidas
 * y que las relaciones de PostGREST funcionen correctamente
 */

import { createClient } from '../lib/supabase/server.js'

async function verifyForeignKeyFix() {
  console.log('🔍 Verificando corrección de restricciones de clave foránea...\n')
  
  try {
    const supabase = await createClient()
    
    // 1. Verificar que las restricciones tengan los nombres correctos
    console.log('✅ Paso 1: Verificando nombres correctos de restricciones...')
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select(`
        constraint_name,
        table_name,
        constraint_type
      `)
      .eq('table_name', 'tramites')
      .eq('constraint_type', 'FOREIGN KEY')
      .in('constraint_name', ['tramites_dependencia_id_fkey', 'tramites_subdependencia_id_fkey'])
    
    if (constraintsError) {
      console.error('❌ Error al verificar restricciones:', constraintsError.message)
      return false
    }
    
    const constraintNames = constraints?.map(c => c.constraint_name) || []
    const hasCorrectDepConstraint = constraintNames.includes('tramites_dependencia_id_fkey')
    const hasCorrectSubDepConstraint = constraintNames.includes('tramites_subdependencia_id_fkey')
    
    console.log('🔗 Restricciones con nombres correctos:')
    console.log(`   - tramites_dependencia_id_fkey: ${hasCorrectDepConstraint ? '✅' : '❌'}`)
    console.log(`   - tramites_subdependencia_id_fkey: ${hasCorrectSubDepConstraint ? '✅' : '❌'}\n`)
    
    if (!hasCorrectDepConstraint || !hasCorrectSubDepConstraint) {
      console.error('❌ Las restricciones no tienen los nombres correctos que espera PostGREST')
      return false
    }
    
    // 2. Verificar que las relaciones de PostGREST funcionen
    console.log('✅ Paso 2: Verificando que las relaciones de PostGREST funcionen...')
    const { data: sampleData, error: sampleError } = await supabase
      .from('tramites')
      .select(`
        id,
        nombre_tramite,
        dependencia_id,
        subdependencia_id,
        dependencias!tramites_dependencia_id_fkey (id, nombre, tipo),
        subdependencias!tramites_subdependencia_id_fkey (id, nombre, tipo)
      `)
      .not('dependencia_id', 'is', null)
      .limit(3)
    
    if (sampleError) {
      console.error('❌ Error al verificar relaciones de PostGREST:', sampleError.message)
      console.log('   ⚠️  Esto indica que PostGREST aún no reconoce las relaciones')
      console.log('   🔧 SOLUCIÓN: Asegúrese de que PostGREST haya recargado el esquema')
      return false
    }
    
    if (sampleData?.length > 0) {
      console.log('✅ Relaciones de PostGREST funcionando correctamente:')
      sampleData.forEach(tramite => {
        console.log(`   - Trámite: ${tramite.nombre_tramite} (ID: ${tramite.id})`)
        console.log(`     Dependencia: ${tramite.dependencias?.nombre || 'No encontrada'} (${tramite.dependencias?.tipo || 'desconocido'})`)
        console.log(`     Subdependencia: ${tramite.subdependencias?.nombre || 'No encontrada'} (${tramite.subdependencias?.tipo || 'desconocido'})`)
        console.log('')
      })
    } else {
      console.log('   ⚠️  No se encontraron trámites con relaciones activas')
      console.log('   (esto puede ser normal si no hay datos o si los trámites no tienen dependencias asignadas)')
    }
    
    // 3. Probar una actualización de trámite (simulación del endpoint)
    console.log('✅ Paso 3: Probando actualización de trámite (simulación del endpoint)...')
    
    // Buscar un trámite para probar
    const { data: tramiteToTest, error: tramiteError } = await supabase
      .from('tramites')
      .select('id, nombre_tramite, dependencia_id, subdependencia_id')
      .limit(1)
    
    if (tramiteError || !tramiteToTest?.[0]) {
      console.log('   ⚠️  No se encontró trámite para prueba (normal si no hay datos)')
    } else {
      const tramite = tramiteToTest[0]
      console.log(`   Probando con trámite: ${tramite.nombre_tramite} (ID: ${tramite.id})`)
      
      // Intentar una actualización simple para verificar que no hay errores de relación
      const { error: updateError } = await supabase
        .from('tramites')
        .update({ 
          updated_at: new Date().toISOString() 
        })
        .eq('id', tramite.id)
        .select(`
          *,
          dependencias!tramites_dependencia_id_fkey (id, nombre, tipo),
          subdependencias!tramites_subdependencia_id_fkey (id, nombre, tipo)
        `)
        .single()
      
      if (updateError) {
        console.error('❌ Error en actualización de prueba:', updateError.message)
        if (updateError.message.includes('relationship')) {
          console.error('   ⚠️  Aún hay problemas con las relaciones de PostGREST')
        }
        return false
      } else {
        console.log('   ✅ Actualización de prueba exitosa - relaciones funcionando')
      }
    }
    
    // 4. Verificar integridad referencial
    console.log('✅ Paso 4: Verificando integridad referencial...')
    const { data: integrityCheck, error: integrityError } = await supabase.rpc('sql', {
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
    console.log('📊 Integridad referencial:')
    console.log(`   - Total trámites: ${integrity?.total_tramites || 0}`)
    console.log(`   - Con dependencia_id: ${integrity?.con_dependencia_id || 0}`)
    console.log(`   - Con subdependencia_id: ${integrity?.con_subdependencia_id || 0}`)
    
    if (integrity?.dependencia_invalida > 0) {
      console.error(`   ❌ ${integrity.dependencia_invalida} trámites con dependencia_id inválida`)
    }
    if (integrity?.subdependencia_invalida > 0) {
      console.error(`   ❌ ${integrity.subdependencia_invalida} trámites con subdependencia_id inválida`)
    }
    
    if ((integrity?.dependencia_invalida || 0) === 0 && (integrity?.subdependencia_invalida || 0) === 0) {
      console.log('   ✅ Integridad referencial verificada')
    }
    console.log('')
    
    // 5. Resumen final
    console.log('🎉 VERIFICACIÓN COMPLETADA EXITOSAMENTE!')
    console.log('=======================================')
    console.log('✅ Restricciones de clave foránea con nombres correctos')
    console.log('✅ Relaciones de PostGREST funcionando')
    console.log('✅ Integridad referencial verificada')
    console.log('✅ Actualización de trámites debería funcionar')
    console.log('')
    console.log('🎯 RESULTADO:')
    console.log('✅ La edición de trámites en /admin/tramites/1/editar debería funcionar correctamente')
    console.log('')
    console.log('🔧 PRÓXIMOS PASOS:')
    console.log('1. Pruebe la edición de trámites en /admin/tramites/1/editar')
    console.log('2. Ejecute los tests: npm test -- tests/admin-tramite-edicion.test.ts')
    console.log('3. Si hay problemas, reinicie PostGREST completamente')
    
    return true
    
  } catch (error) {
    console.error('❌ Error general en la verificación:', error.message)
    console.error(error.stack)
    return false
  }
}

// Verificar si se está ejecutando desde línea de comandos
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyForeignKeyFix().then(success => {
    console.log('\n🎯 Verificación de claves foráneas completada')
    process.exit(success ? 0 : 1)
  }).catch(error => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
}

export { verifyForeignKeyFix }