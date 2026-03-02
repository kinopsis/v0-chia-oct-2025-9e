#!/usr/bin/env node

// Script simple para verificar información de contacto en dependencias
// Usa el cliente de Supabase existente en el proyecto

const { createClient } = require('../lib/supabase/server')

async function verifyContactInfo() {
  console.log('🔍 Verificando información de contacto en dependencias...\n')

  try {
    // Crear cliente de servidor
    const supabase = createClient()

    // Verificar que la tabla exista y tenga los campos de contacto
    const { data: tableInfo, error: tableError } = await supabase
      .from('dependencias')
      .select('id, nombre, sigla, tipo, direccion, telefono, email, horario_atencion, contacto_responsable, dependencia_padre_id')
      .limit(15)

    if (tableError) {
      console.log('❌ Error al consultar la tabla de dependencias:', tableError.message)
      return
    }

    if (!tableInfo || tableInfo.length === 0) {
      console.log('⚠️  No se encontraron dependencias en la base de datos')
      return
    }

    console.log(`✅ Se encontraron ${tableInfo.length} dependencias con información de contacto\n`)

    // Verificar campos de contacto
    const dependenciasConContacto = tableInfo.filter(dep => 
      dep.direccion || dep.telefono || dep.email || dep.horario_atencion || dep.contacto_responsable
    )

    console.log(`📊 Dependencias con información de contacto: ${dependenciasConContacto.length}/${tableInfo.length}`)

    // Mostrar ejemplo de dependencias con contacto
    if (dependenciasConContacto.length > 0) {
      console.log('\n📋 Ejemplo de dependencias con información de contacto:')
      dependenciasConContacto.slice(0, 5).forEach(dep => {
        console.log(`\n📍 ${dep.nombre} (${dep.sigla})`)
        console.log(`   Tipo: ${dep.tipo}`)
        console.log(`   Dirección: ${dep.direccion || 'No especificada'}`)
        console.log(`   Teléfono: ${dep.telefono || 'No especificado'}`)
        console.log(`   Email: ${dep.email || 'No especificado'}`)
        console.log(`   Horario: ${dep.horario_atencion || 'No especificado'}`)
        console.log(`   Contacto: ${dep.contacto_responsable || 'No especificado'}`)
      })
    }

    // Verificar dependencias sin contacto
    const dependenciasSinContacto = tableInfo.filter(dep => 
      !dep.direccion && !dep.telefono && !dep.email && !dep.horario_atencion && !dep.contacto_responsable
    )

    if (dependenciasSinContacto.length > 0) {
      console.log(`\n⚠️  Dependencias sin información de contacto: ${dependenciasSinContacto.length}`)
      dependenciasSinContacto.forEach(dep => {
        console.log(`   - ${dep.nombre} (${dep.sigla})`)
      })
    }

    console.log('\n✅ Verificación completada exitosamente')

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message)
  }
}

verifyContactInfo()