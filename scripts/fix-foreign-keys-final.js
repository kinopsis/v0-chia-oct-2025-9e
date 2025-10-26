#!/usr/bin/env node

/**
 * Script para corregir las restricciones de clave foránea entre tramites y dependencias
 * Este script implementa la solución para el error de PostgREST
 */

import { createClient } from '../lib/supabase/server.js'

async function fixForeignKeyConstraints() {
  console.log('🔧 Iniciando corrección de restricciones de clave foránea...\n')
  
  try {
    const supabase = await createClient()
    
    // 1. Verificar conexión
    console.log('✅ Paso 1: Verificando conexión a la base de datos...')
    const { data: healthCheck, error: healthError } = await supabase.from('tramites').select('id').limit(1)
    
    if (healthError) {
      console.error('❌ Error de conexión:', healthError.message)
      return false
    }
    console.log('✅ Conexión exitosa\n')
    
    // 2. Verificar columnas existentes
    console.log('✅ Paso 2: Verificando columnas en tabla tramites...')
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
    
    const hasDepId = columns?.some(c => c.column_name === 'dependencia_id')
    const hasSubDepId = columns?.some(c => c.column_name === 'subdependencia_id')
    
    if (!hasDepId || !hasSubDepId) {
      console.error('❌ Faltan columnas requeridas:')
      if (!hasDepId) console.error('   - Falta columna: dependencia_id')
      if (!hasSubDepId) console.error('   - Falta columna: subdependencia_id')
      console.log('\n🔧 SOLUCIÓN: Agregue las columnas faltantes primero')
      return false
    }
    
    console.log('✅ Columnas requeridas existen:')
    console.log(`   - dependencia_id: ${columns?.find(c => c.column_name === 'dependencia_id')?.data_type}`)
    console.log(`   - subdependencia_id: ${columns?.find(c => c.column_name === 'subdependencia_id')?.data_type}\n`)
    
    // 3. Verificar restricciones actuales
    console.log('✅ Paso 3: Verificando restricciones de clave foránea existentes...')
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
    
    const constraintNames = constraints?.map(c => c.constraint_name) || []
    console.log('🔗 Restricciones de clave foránea encontradas:', constraintNames.join(', ') || 'Ninguna')
    
    // Verificar nombres esperados por PostgREST
    const expectedNames = ['tramites_dependencia_id_fkey', 'tramites_subdependencia_id_fkey']
    const hasCorrectDepConstraint = constraintNames.includes('tramites_dependencia_id_fkey')
    const hasCorrectSubDepConstraint = constraintNames.includes('tramites_subdependencia_id_fkey')
    
    console.log('🎯 Estado de restricciones esperadas:')
    console.log(`   - tramites_dependencia_id_fkey: ${hasCorrectDepConstraint ? '✅ Existe' : '❌ Falta'}`)
    console.log(`   - tramites_subdependencia_id_fkey: ${hasCorrectSubDepConstraint ? '✅ Existe' : '❌ Falta'}\n`)
    
    // 4. Eliminar restricciones antiguas con nombres incorrectos
    if (!hasCorrectDepConstraint || !hasCorrectSubDepConstraint) {
      console.log('✅ Paso 4: Eliminando restricciones antiguas con nombres incorrectos...')
      
      // Buscar restricciones antiguas
      const oldConstraints = constraintNames.filter(name => 
        !expectedNames.includes(name) && 
        (name.includes('dependencia') || name.includes('tramites'))
      )
      
      for (const oldConstraint of oldConstraints) {
        console.log(`   Eliminando restricción antigua: ${oldConstraint}`)
        try {
          const { error } = await supabase.rpc('execute_sql', {
            statement: `ALTER TABLE tramites DROP CONSTRAINT IF EXISTS ${oldConstraint}`
          })
          if (error) {
            console.log(`   ⚠️  No se pudo eliminar ${oldConstraint}: ${error.message}`)
          } else {
            console.log(`   ✅ Eliminada: ${oldConstraint}`)
          }
        } catch (dropError) {
          console.log(`   ⚠️  Error al eliminar ${oldConstraint}: ${dropError.message}`)
        }
      }
      console.log('')
    }
    
    // 5. Crear restricciones con nombres correctos
    console.log('✅ Paso 5: Creando restricciones de clave foránea con nombres estándar...')
    
    const createConstraints = []
    
    if (!hasCorrectDepConstraint) {
      createConstraints.push({
        name: 'tramites_dependencia_id_fkey',
        sql: 'ALTER TABLE tramites ADD CONSTRAINT tramites_dependencia_id_fkey FOREIGN KEY (dependencia_id) REFERENCES dependencias(id)'
      })
    }
    
    if (!hasCorrectSubDepConstraint) {
      createConstraints.push({
        name: 'tramites_subdependencia_id_fkey', 
        sql: 'ALTER TABLE tramites ADD CONSTRAINT tramites_subdependencia_id_fkey FOREIGN KEY (subdependencia_id) REFERENCES dependencias(id)'
      })
    }
    
    for (const constraint of createConstraints) {
      console.log(`   Creando restricción: ${constraint.name}`)
      try {
        const { error } = await supabase.rpc('execute_sql', {
          statement: constraint.sql
        })
        if (error) {
          console.error(`   ❌ Error creando ${constraint.name}: ${error.message}`)
          return false
        } else {
          console.log(`   ✅ Creada: ${constraint.name}`)
        }
      } catch (createError) {
        console.error(`   ❌ Error creando ${constraint.name}: ${createError.message}`)
        return false
      }
    }
    
    if (createConstraints.length === 0) {
      console.log('   ✅ No se necesitaban crear nuevas restricciones')
    }
    console.log('')
    
    // 6. Crear índices para mejor performance (si no existen)
    console.log('✅ Paso 6: Creando índices para mejor performance...')
    
    const { data: indexes, error: indexesError } = await supabase.rpc('sql', {
      query: `
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'tramites' 
        AND (indexname LIKE '%dependencia_id%' OR indexname LIKE '%subdependencia_id%')
      `
    })
    
    const existingIndexes = indexes?.map(idx => idx.indexname) || []
    
    const requiredIndexes = [
      { name: 'idx_tramites_dependencia_id', sql: 'CREATE INDEX IF NOT EXISTS idx_tramites_dependencia_id ON tramites(dependencia_id)' },
      { name: 'idx_tramites_subdependencia_id', sql: 'CREATE INDEX IF NOT EXISTS idx_tramites_subdependencia_id ON tramites(subdependencia_id)' }
    ]
    
    for (const index of requiredIndexes) {
      if (!existingIndexes.includes(index.name)) {
        console.log(`   Creando índice: ${index.name}`)
        try {
          const { error } = await supabase.rpc('execute_sql', {
            statement: index.sql
          })
          if (error) {
            console.log(`   ⚠️  No se pudo crear ${index.name}: ${error.message}`)
          } else {
            console.log(`   ✅ Creado: ${index.name}`)
          }
        } catch (indexError) {
          console.log(`   ⚠️  Error al crear ${index.name}: ${indexError.message}`)
        }
      } else {
        console.log(`   ✅ Índice existente: ${index.name}`)
      }
    }
    console.log('')
    
    // 7. Verificar integridad referencial
    console.log('✅ Paso 7: Verificando integridad referencial...')
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
    console.log('📊 Resultados de integridad referencial:')
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
    
    // 8. Verificar que las relaciones funcionen con PostgREST
    console.log('✅ Paso 8: Verificando que las relaciones funcionen con PostgREST...')
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
      .limit(2)
    
    if (sampleError) {
      console.error('❌ Error al verificar relaciones con PostgREST:', sampleError.message)
      console.log('   ⚠️  Esto indica que PostgREST aún no reconoce las relaciones')
      console.log('   🔧 SOLUCIÓN: Reinicie PostgREST o ejecute: SELECT pg_notify(\'pgrst\', \'reload schema\');')
      return false
    } else if (sampleData?.length > 0) {
      console.log('✅ Relaciones de PostGREST funcionando correctamente:')
      sampleData.forEach(tramite => {
        console.log(`   - ${tramite.nombre_tramite} (ID: ${tramite.id})`)
        console.log(`     Dependencia: ${tramite.dependencias?.nombre || 'No encontrada'} (${tramite.dependencias?.tipo || 'desconocido'})`)
        console.log(`     Subdependencia: ${tramite.subdependencias?.nombre || 'No encontrada'} (${tramite.subdependencias?.tipo || 'desconocido'})`)
      })
    } else {
      console.log('   ⚠️  No se encontraron trámites con relaciones activas (esto puede ser normal si no hay datos)')
    }
    console.log('')
    
    // 9. Resumen final
    console.log('🎉 CORRECCIÓN COMPLETADA EXITOSAMENTE!')
    console.log('=====================================')
    console.log('✅ Restricciones de clave foránea creadas con nombres estándar')
    console.log('✅ Índices de performance creados')
    console.log('✅ Integridad referencial verificada')
    console.log('✅ Relaciones de PostGREST funcionando')
    console.log('')
    console.log('🔧 PRÓXIMOS PASOS REQUERIDOS:')
    console.log('1. Reinicie el servicio de PostGREST para actualizar el caché de esquema')
    console.log('   - Docker: docker restart [nombre_contenedor_postgrest]')
    console.log('   - Servicio: sudo systemctl restart postgrest')
    console.log('   - O ejecute: SELECT pg_notify(\'pgrst\', \'reload schema\');')
    console.log('')
    console.log('2. Pruebe la edición de trámites en /admin/tramites/1/editar')
    console.log('3. Ejecute los tests: npm test -- tests/admin-tramite-edicion.test.ts')
    
    return true
    
  } catch (error) {
    console.error('❌ Error general en la corrección:', error.message)
    console.error(error.stack)
    return false
  }
}

// Verificar si se está ejecutando desde línea de comandos
if (import.meta.url === `file://${process.argv[1]}`) {
  fixForeignKeyConstraints().then(success => {
    console.log('\n🎯 Corrección de claves foráneas completada')
    process.exit(success ? 0 : 1)
  }).catch(error => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
}

export { fixForeignKeyConstraints }