#!/usr/bin/env node

/**
 * Script de solución inmediata para el error de PostgREST
 * Este script detecta el problema específico y aplica la solución automáticamente
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

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function aplicarSolucionInmediata() {
  console.log('🚨 Aplicando solución inmediata para error de PostgREST\n')

  try {
    // Usar el cliente de Supabase ya creado

    // Paso 1: Verificar el estado actual
    console.log('🔍 Paso 1: Verificando estado actual de restricciones...')
    
    // Usar SQL directo para verificar restricciones
    const response = await fetch(`${supabaseUrl.replace('https://', 'https://sql.')}supabase.co/v1/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        query: `
          SELECT constraint_name, table_name, constraint_type
          FROM information_schema.table_constraints
          WHERE table_name = 'tramites' AND constraint_type = 'FOREIGN KEY'
        `
      })
    });
    
    const result = await response.json();
    const constraints = result.result || [];
    const constraintsError = response.ok ? null : new Error(result.message || 'Error al verificar restricciones');

    if (constraintsError) {
      console.error('❌ Error al verificar restricciones:', constraintsError.message)
      return false
    }

    const constraintNames = constraints?.map(c => c.constraint_name) || []
    console.log('📋 Restricciones actuales:', constraintNames)

    // Verificar si existen las restricciones con nombres correctos
    const tieneNombreCorrecto = constraintNames.includes('tramites_dependencia_id_fkey') && 
                               constraintNames.includes('tramites_subdependencia_id_fkey')

    if (tieneNombreCorrecto) {
      console.log('✅ Las restricciones ya tienen los nombres correctos para PostgREST')
      
      // Verificar integridad referencial con SQL directo
      const integrityResponse = await fetch(`${supabaseUrl.replace('https://', 'https://sql.')}supabase.co/v1/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        },
        body: JSON.stringify({
          query: `
            SELECT
              COUNT(*) FILTER (WHERE dependencia_id IS NOT NULL AND dependencia_id NOT IN (SELECT id FROM dependencias)) as dependencia_invalida,
              COUNT(*) FILTER (WHERE subdependencia_id IS NOT NULL AND subdependencia_id NOT IN (SELECT id FROM dependencias)) as subdependencia_invalida
            FROM tramites
          `
        })
      });
      
      const integrityResult = await integrityResponse.json();
      const integrityCheck = integrityResult.result || [];
      const integrityError = integrityResponse.ok ? null : new Error(integrityResult.message || 'Error al verificar integridad');

      if (integrityError) {
        console.error('❌ Error al verificar integridad:', integrityError.message)
        return false
      }

      const integrity = integrityCheck?.[0]
      if (integrity?.dependencia_invalida > 0 || integrity?.subdependencia_invalida > 0) {
        console.error('❌ Hay referencias inválidas que deben corregirse')
        console.log(`   - dependencia_id inválida: ${integrity.dependencia_invalida}`)
        console.log(`   - subdependencia_id inválida: ${integrity.subdependencia_invalida}`)
        return false
      }

      console.log('✅ Integridad referencial verificada')
      console.log('\n🎯 Solución: Reinicie PostgREST o ejecute: SELECT pg_notify(\'pgrst\', \'reload schema\');')
      return true
    }

    // Paso 2: Si no tienen nombres correctos, aplicar solución
    console.log('⚠️  Las restricciones no tienen nombres estándar para PostgREST')
    console.log('🔧 Aplicando solución automática...')

    // Eliminar restricciones con nombres incorrectos
    for (const constraintName of constraintNames) {
      if (constraintName !== 'tramites_dependencia_id_fkey' && 
          constraintName !== 'tramites_subdependencia_id_fkey') {
        console.log(`   Eliminando restricción: ${constraintName}`)
        // Eliminar restricción con SQL directo
        const dropResponse = await fetch(`${supabaseUrl.replace('https://', 'https://sql.')}supabase.co/v1/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey
          },
          body: JSON.stringify({
            query: `ALTER TABLE tramites DROP CONSTRAINT IF EXISTS ${constraintName};`
          })
        });
        
        const dropResult = await dropResponse.json();
        const dropError = dropResponse.ok ? null : new Error(dropResult.message || 'Error al eliminar restricción');
        
        if (dropError) {
          console.error(`❌ Error al eliminar ${constraintName}:`, dropError.message)
          return false
        }
      }
    }

    // Crear restricciones con nombres correctos
    console.log('   Creando restricciones con nombres estándar...')
    
    // Crear primera restricción con SQL directo
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
          FOREIGN KEY (dependencia_id) REFERENCES dependencias(id);
        `
      })
    });
    
    const fk1Result = await fk1Response.json();
    const fk1Error = fk1Response.ok ? null : new Error(fk1Result.message || 'Error al crear tramites_dependencia_id_fkey');
    
    if (fk1Error) {
      console.error('❌ Error al crear tramites_dependencia_id_fkey:', fk1Error.message)
      return false
    }

    // Crear segunda restricción con SQL directo
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
          FOREIGN KEY (subdependencia_id) REFERENCES dependencias(id);
        `
      })
    });
    
    const fk2Result = await fk2Response.json();
    const fk2Error = fk2Response.ok ? null : new Error(fk2Result.message || 'Error al crear tramites_subdependencia_id_fkey');
    
    if (fk2Error) {
      console.error('❌ Error al crear tramites_subdependencia_id_fkey:', fk2Error.message)
      return false
    }

    console.log('✅ Restricciones creadas con nombres correctos')

    // Paso 3: Verificar que todo funcione
    console.log('🔍 Paso 3: Verificando que la solución funcione...')
    
    // Probar relaciones con SQL directo
    const testResponse = await fetch(`${supabaseUrl.replace('https://', 'https://sql.')}supabase.co/v1/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        query: `
          SELECT
            t.id,
            t.nombre_tramite,
            d.nombre as dependencia_nombre
          FROM tramites t
          LEFT JOIN dependencias d ON t.dependencia_id = d.id
          WHERE t.dependencia_id IS NOT NULL
          LIMIT 3;
        `
      })
    });
    
    const testResult = await testResponse.json();
    const testQuery = testResult.result || [];
    const testError = testResponse.ok ? null : new Error(testResult.message || 'Error en prueba de relaciones');

    if (testError) {
      console.error('❌ Error en prueba de relaciones:', testError.message)
      return false
    }

    console.log('✅ Prueba de relaciones exitosa')
    console.log('📋 Ejemplo de datos relacionados:')
    testQuery?.forEach(row => {
      console.log(`   - ${row.nombre_tramite} -> ${row.dependencia_nombre || 'Sin dependencia'}`)
    })

    console.log('\n🎉 SOLUCIÓN APLICADA EXITOSAMENTE')
    console.log('\n📋 PASOS SIGUIENTES:')
    console.log('1. ✅ Reinicie el servicio de PostgREST')
    console.log('   - Docker: docker restart [nombre_contenedor_postgrest]')
    console.log('   - Servicio: sudo systemctl restart postgrest')
    console.log('   - O ejecute: SELECT pg_notify(\'pgrst\', \'reload schema\');')
    console.log('')
    console.log('2. ✅ Pruebe nuevamente la API PUT /api/admin/tramites/[id]')
    console.log('3. ✅ Verifique que las consultas REST con relaciones funcionen')
    
    return true

  } catch (error) {
    console.error('❌ Error en la solución automática:', error.message)
    console.log('\n📋 SOLUCIÓN MANUAL:')
    console.log('Ejecute manualmente el script SQL:')
    console.log('psql -d su_base_de_datos -f scripts/fix-foreign-keys.sql')
    return false
  }
}

// Verificar si se está ejecutando desde línea de comandos
if (require.main === module) {
  console.log('🚀 Iniciando solución para error de PostgREST...')
  console.log('Error detectado: "Could not find a relationship between \'tramites\' and \'dependencias\'"')
  console.log('')
  
  aplicarSolucionInmediata().then(success => {
    console.log('\n🎯 Proceso completado')
    if (success) {
      console.log('✅ El error debería estar resuelto')
    } else {
      console.log('❌ Se necesitan acciones manuales')
    }
    process.exit(success ? 0 : 1)
  }).catch(error => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
}
