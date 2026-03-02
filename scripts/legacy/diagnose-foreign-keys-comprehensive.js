#!/usr/bin/env node

/**
 * Script de diagnóstico completo para problemas de claves foráneas entre tramites y dependencias
 * Este script ayuda a identificar y solucionar el error de PostgREST:
 * "Could not find a relationship between 'tramites' and 'dependencias' in the schema cache"
 */

import { createClient } from '../lib/supabase/server.js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Configuración de Supabase para uso directo
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas')
  console.error('Asegúrese de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

// Función para crear cliente de servidor directo
function createDirectServerClient() {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {
        // No-op para diagnóstico
      }
    }
  })
}

// Consultas SQL para diagnóstico
const DIAGNOSTIC_QUERIES = {
  // 1. Verificar estructura de tabla tramites
  checkTramitesColumns: `
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns 
    WHERE table_name = 'tramites' 
    AND column_name IN ('dependencia_id', 'subdependencia_id', 'dependencia_nombre', 'subdependencia_nombre')
    ORDER BY column_name;
  `,

  // 2. Verificar estructura de tabla dependencias
  checkDependenciasColumns: `
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns 
    WHERE table_name = 'dependencias' 
    AND column_name = 'id'
    ORDER BY column_name;
  `,

  // 3. Verificar restricciones de clave foránea en tramites
  checkForeignKeyConstraints: `
    SELECT 
      tc.constraint_name,
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      tc.constraint_type
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
        AND tc.table_schema = ccu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'tramites'
      AND ccu.table_name = 'dependencias'
    ORDER BY tc.constraint_name;
  `,

  // 4. Verificar todas las restricciones que referencian dependencias
  checkAllDependenciasReferences: `
    SELECT 
      tc.constraint_name,
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
        AND tc.table_schema = ccu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_name = 'dependencias'
    ORDER BY tc.table_name, tc.constraint_name;
  `,

  // 5. Verificar datos en tramites
  checkTramitesData: `
    SELECT 
      COUNT(*) as total_tramites,
      COUNT(dependencia_id) as tramites_con_dependencia_id,
      COUNT(subdependencia_id) as tramites_con_subdependencia_id,
      COUNT(dependencia_nombre) as tramites_con_dependencia_nombre,
      COUNT(subdependencia_nombre) as tramites_con_subdependencia_nombre
    FROM tramites;
  `,

  // 6. Verificar integridad referencial
  checkReferentialIntegrity: `
    SELECT 
      t.id as tramite_id,
      t.dependencia_id,
      t.subdependencia_id,
      d.id as dependencia_valida,
      sd.id as subdependencia_valida
    FROM tramites t
    LEFT JOIN dependencias d ON t.dependencia_id = d.id
    LEFT JOIN dependencias sd ON t.subdependencia_id = sd.id
    WHERE (t.dependencia_id IS NOT NULL AND d.id IS NULL)
       OR (t.subdependencia_id IS NOT NULL AND sd.id IS NULL)
    LIMIT 10;
  `,

  // 7. Verificar nombres esperados por PostgREST
  checkExpectedConstraintNames: `
    SELECT 
      constraint_name,
      table_name,
      column_name
    FROM information_schema.key_column_usage 
    WHERE constraint_name LIKE '%tramites%dependencia%'
       OR constraint_name LIKE '%dependencia%tramites%'
    ORDER BY constraint_name;
  `
}

async function runDiagnostic() {
  console.log('🔍 Iniciando diagnóstico de claves foráneas tramites-dependencias\n')

  const supabase = createDirectServerClient()
  let hasErrors = false

  try {
    // 1. Verificar conexión
    console.log('✅ Paso 1: Verificando conexión a la base de datos...')
    const { data: healthCheck, error: healthError } = await supabase.from('tramites').select('id').limit(1)
    
    if (healthError) {
      console.error('❌ Error de conexión:', healthError.message)
      hasErrors = true
      return
    }
    console.log('✅ Conexión exitosa\n')

    // 2. Verificar columnas en tramites
    console.log('✅ Paso 2: Verificando columnas en tabla tramites...')
    const { data: tramitesColumns, error: columnsError } = await supabase
      .rpc('sql', { query: DIAGNOSTIC_QUERIES.checkTramitesColumns })
    
    if (columnsError) {
      console.error('❌ Error al verificar columnas:', columnsError.message)
      hasErrors = true
    } else {
      console.log('📋 Columnas encontradas en tramites:')
      tramitesColumns?.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable ? 'nullable' : 'not null'})`)
      })
      
      const hasDepId = tramitesColumns?.some(c => c.column_name === 'dependencia_id')
      const hasSubDepId = tramitesColumns?.some(c => c.column_name === 'subdependencia_id')
      
      if (!hasDepId || !hasSubDepId) {
        console.error('❌ Faltan columnas de clave foránea:')
        if (!hasDepId) console.error('   - Falta dependencia_id')
        if (!hasSubDepId) console.error('   - Falta subdependencia_id')
        hasErrors = true
      }
      console.log('')
    }

    // 3. Verificar restricciones de clave foránea
    console.log('✅ Paso 3: Verificando restricciones de clave foránea...')
    const { data: fkConstraints, error: fkError } = await supabase
      .rpc('sql', { query: DIAGNOSTIC_QUERIES.checkForeignKeyConstraints })
    
    if (fkError) {
      console.error('❌ Error al verificar restricciones:', fkError.message)
      hasErrors = true
    } else {
      console.log('🔗 Restricciones de clave foránea encontradas:')
      if (fkConstraints?.length === 0) {
        console.error('❌ No se encontraron restricciones de clave foránea entre tramites y dependencias')
        hasErrors = true
      } else {
        fkConstraints?.forEach(constraint => {
          console.log(`   - ${constraint.constraint_name}: ${constraint.table_name}.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name}`)
          
          // Verificar nombres esperados por PostgREST
          const expectedNames = ['tramites_dependencia_id_fkey', 'tramites_subdependencia_id_fkey']
          if (!expectedNames.includes(constraint.constraint_name)) {
            console.warn(`   ⚠️  Nombre de restricción no estándar: ${constraint.constraint_name}`)
            console.warn(`      PostgREST espera: ${expectedNames.join(' o ')}`)
          }
        })
      }
      console.log('')
    }

    // 4. Verificar datos y migración
    console.log('✅ Paso 4: Verificando datos y migración...')
    const { data: tramitesData, error: dataError } = await supabase
      .rpc('sql', { query: DIAGNOSTIC_QUERIES.checkTramitesData })
    
    if (dataError) {
      console.error('❌ Error al verificar datos:', dataError.message)
      hasErrors = true
    } else {
      console.log('📊 Estado de datos en tramites:')
      const data = tramitesData?.[0]
      if (data) {
        console.log(`   - Total trámites: ${data.total_tramites}`)
        console.log(`   - Con dependencia_id: ${data.tramites_con_dependencia_id}`)
        console.log(`   - Con subdependencia_id: ${data.tramites_con_subdependencia_id}`)
        console.log(`   - Con dependencia_nombre (legacy): ${data.tramites_con_dependencia_nombre}`)
        console.log(`   - Con subdependencia_nombre (legacy): ${data.tramites_con_subdependencia_nombre}`)
        
        if (data.tramites_con_dependencia_nombre > 0 || data.tramites_con_subdependencia_nombre > 0) {
          console.warn('   ⚠️  Aún existen campos legacy que deberían migrarse')
        }
      }
      console.log('')
    }

    // 5. Verificar integridad referencial
    console.log('✅ Paso 5: Verificando integridad referencial...')
    const { data: integrityIssues, error: integrityError } = await supabase
      .rpc('sql', { query: DIAGNOSTIC_QUERIES.checkReferentialIntegrity })
    
    if (integrityError) {
      console.error('❌ Error al verificar integridad:', integrityError.message)
      hasErrors = true
    } else {
      console.log('🔍 Integridad referencial:')
      if (integrityIssues?.length === 0) {
        console.log('   ✅ No se encontraron violaciones de integridad referencial')
      } else {
        console.error('   ❌ Se encontraron violaciones de integridad referencial:')
        integrityIssues?.forEach(issue => {
          console.error(`     - Trámite ${issue.tramite_id}: dependencia_id=${issue.dependencia_id} (no encontrada), subdependencia_id=${issue.subdependencia_id} (no encontrada)`)
        })
        hasErrors = true
      }
      console.log('')
    }

    // 6. Verificar todas las referencias a dependencias
    console.log('✅ Paso 6: Verificando todas las referencias a dependencias...')
    const { data: allReferences, error: referencesError } = await supabase
      .rpc('sql', { query: DIAGNOSTIC_QUERIES.checkAllDependenciasReferences })
    
    if (referencesError) {
      console.error('❌ Error al verificar referencias:', referencesError.message)
      hasErrors = true
    } else {
      console.log('🌍 Todas las referencias a dependencias:')
      if (allReferences?.length === 0) {
        console.error('❌ No se encontraron referencias a dependencias')
        hasErrors = true
      } else {
        allReferences?.forEach(ref => {
          console.log(`   - ${ref.table_name}.${ref.column_name} -> dependencias.${ref.foreign_column_name} (${ref.constraint_name})`)
        })
      }
      console.log('')
    }

    // 7. Resumen y recomendaciones
    console.log('📋 RESUMEN DEL DIAGNÓSTICO')
    console.log('='.repeat(50))
    
    if (hasErrors) {
      console.log('❌ SE ENCONTRARON PROBLEMAS QUE DEBEN SOLUCIONARSE:')
      console.log('')
      console.log('🔧 SOLUCIONES RECOMENDADAS:')
      console.log('1. Si faltan columnas de clave foránea:')
      console.log('   ALTER TABLE tramites ADD COLUMN dependencia_id INTEGER;')
      console.log('   ALTER TABLE tramites ADD COLUMN subdependencia_id INTEGER;')
      console.log('')
      console.log('2. Si faltan restricciones de clave foránea:')
      console.log('   ALTER TABLE tramites ADD CONSTRAINT tramites_dependencia_id_fkey FOREIGN KEY (dependencia_id) REFERENCES dependencias(id);')
      console.log('   ALTER TABLE tramites ADD CONSTRAINT tramites_subdependencia_id_fkey FOREIGN KEY (subdependencia_id) REFERENCES dependencias(id);')
      console.log('')
      console.log('3. Si los nombres de restricciones no son estándar:')
      console.log('   ALTER TABLE tramites RENAME CONSTRAINT fk_tramites_dependencia_id TO tramites_dependencia_id_fkey;')
      console.log('   ALTER TABLE tramites RENAME CONSTRAINT fk_tramites_subdependencia_id TO tramites_subdependencia_id_fkey;')
      console.log('')
      console.log('4. Si hay violaciones de integridad referencial:')
      console.log('   - Corregir los valores inválidos en dependencia_id/subdependencia_id')
      console.log('   - O eliminar los registros con referencias inválidas')
      console.log('')
      console.log('5. Para actualizar el caché de PostgREST:')
      console.log('   - Reiniciar el servicio de PostgREST')
      console.log("   - O ejecutar: SELECT pg_notify('pgrst', 'reload schema');")
    } else {
      console.log('✅ No se encontraron problemas críticos')
      console.log('   El sistema de claves foráneas parece estar correctamente configurado.')
    }

  } catch (error) {
    console.error('❌ Error general en el diagnóstico:', error.message)
    hasErrors = true
  }
}

// Función para ejecutar consultas SQL directas (simulación de RPC)
async function executeDirectSQL(query) {
  // Esta es una implementación simplificada
  // En un entorno real, usaría el cliente de base de datos directo
  console.log(`[SIMULACIÓN] Ejecutando consulta: ${query.substring(0, 100)}...`)
  return { data: [], error: null }
}

// Verificar si se está ejecutando desde línea de comandos
if (import.meta.url === `file://${process.argv[1]}`) {
  runDiagnostic().then(() => {
    console.log('\n🎯 Diagnóstico completado')
    process.exit(0)
  }).catch(error => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
}

export { runDiagnostic, executeDirectSQL }