// Prueba de validación de la API de trámites con nueva estructura de dependencias
import { createClient } from './lib/supabase/server.js'

async function testTramitesAPI() {
  try {
    const supabase = createClient()

    // Test 1: Verificar que la API devuelve dependencias desde joins
    const { data, error } = await supabase
      .from("tramites")
      .select(`
        id,
        nombre_tramite,
        dependencia_id,
        subdependencia_id,
        dependencias!tramites_dependencia_id_fkey (
          nombre,
          tipo
        ),
        subdependencias!tramites_subdependencia_id_fkey (
          nombre,
          tipo
        )
      `)
      .eq("is_active", true)
      .limit(5)

    if (error) {
      console.error("❌ Error en consulta de trámites:", error)
      return false
    }

    console.log("✅ API de trámites funciona correctamente")
    console.log("📋 Resultados de muestra:")

    data.forEach((tramite, index) => {
      console.log(`\n${index + 1}. ${tramite.nombre_tramite}`)
      console.log(`   ID Dependencia: ${tramite.dependencia_id}`)
      console.log(`   ID Subdependencia: ${tramite.subdependencia_id}`)
      console.log(`   Dependencia: ${tramite.dependencias?.[0]?.nombre || 'Ninguna'}`)
      console.log(`   Subdependencia: ${tramite.subdependencias?.[0]?.nombre || 'Ninguna'}`)
    })

    // Test 2: Verificar que no existan campos antiguos
    const sampleTramite = data[0]
    const hasOldFields = 'dependencia_nombre' in sampleTramite || 'subdependencia_nombre' in sampleTramite
    
    if (hasOldFields) {
      console.error("❌ La API aún devuelve campos antiguos")
      return false
    } else {
      console.log("✅ No se detectan campos antiguos en la respuesta")
    }

    // Test 3: Verificar integridad referencial
    const tramite81388 = data.find(t => t.id === 81388)
    if (tramite81388) {
      console.log("\n🎯 Validación específica del trámite 81388:")
      console.log(`   Nombre: ${tramite81388.nombre_tramite}`)
      console.log(`   Dependencia: ${tramite81388.dependencias?.[0]?.nombre || 'Ninguna'}`)
      console.log(`   Subdependencia: ${tramite81388.subdependencias?.[0]?.nombre || 'Ninguna'}`)
      
      if (tramite81388.dependencias?.[0]?.nombre === 'Secretaría de Hacienda' &&
          tramite81388.subdependencias?.[0]?.nombre === 'Dirección de Rentas') {
        console.log("✅ Relación de dependencias correcta para el trámite 81388")
      } else {
        console.error("❌ Relación de dependencias incorrecta para el trámite 81388")
        return false
      }
    }

    console.log("\n🎉 Todas las pruebas pasaron exitosamente!")
    return true

  } catch (error) {
    console.error("❌ Error en la validación:", error)
    return false
  }
}

// Ejecutar la prueba
if (import.meta.url === `file://${process.argv[1]}`) {
    testTramitesAPI().then(success => {
      process.exit(success ? 0 : 1)
    })
}