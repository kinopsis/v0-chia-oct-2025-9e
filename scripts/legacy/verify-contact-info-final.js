#!/usr/bin/env node

/**
 * Script para verificar información de contacto en dependencias
 */

const { createClient } = require('@supabase/supabase-js')

// Leer variables de entorno directamente del archivo
const fs = require('fs')
const path = require('path')

try {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
  const envLines = envContent.split('\n')
  
  let supabaseUrl = null
  let supabaseKey = null
  
  for (const line of envLines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].replace(/"/g, '')
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].replace(/"/g, '')
    }
  }
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: No se encontraron las variables de entorno de Supabase en .env.local')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  async function verifyContactInfo() {
    console.log('🔍 Verificando información de contacto en dependencias...\n')
    
    try {
      // Verificar que la tabla exista y tenga los campos de contacto
      const { data: tableInfo, error: tableError } = await supabase
        .from('dependencias')
        .select('id, nombre, sigla, tipo, direccion, telefono, email, horario_atencion, contacto_responsable, dependencia_padre_id')
        .limit(20)

      if (tableError) {
        if (tableError.code === '42P01') {
          console.log('⚠️  La tabla "dependencias" no existe. Necesitas ejecutar:')
          console.log('   - 08-create-dependencias-table.sql')
          console.log('   - 10-seed-dependencias.sql')
          return
        } else {
          console.log('❌ Error al consultar la tabla de dependencias:', tableError.message)
          return
        }
      }

      if (!tableInfo || tableInfo.length === 0) {
        console.log('⚠️  No se encontraron dependencias en la base de datos')
        console.log('   Considera ejecutar: 10-seed-dependencias.sql')
        return
      }

      console.log(`✅ Se encontraron ${tableInfo.length} dependencias en la base de datos\n`)

      // Verificar campos de contacto
      const dependenciasConContacto = tableInfo.filter(dep => 
        dep.direccion || dep.telefono || dep.email || dep.horario_atencion || dep.contacto_responsable
      )

      console.log(`📊 Dependencias con información de contacto: ${dependenciasConContacto.length}/${tableInfo.length} (${Math.round((dependenciasConContacto.length/tableInfo.length)*100)}%)`)

      // Mostrar ejemplo de dependencias con contacto
      if (dependenciasConContacto.length > 0) {
        console.log('\n📋 Ejemplo de dependencias con información de contacto:')
        dependenciasConContacto.slice(0, 5).forEach(dep => {
          console.log(`\n📍 ${dep.nombre} (${dep.sigla})`)
          console.log(`   Tipo: ${dep.tipo}`)
          if (dep.direccion) console.log(`   🏠 Dirección: ${dep.direccion}`)
          if (dep.telefono) console.log(`   📞 Teléfono: ${dep.telefono}`)
          if (dep.email) console.log(`   📧 Email: ${dep.email}`)
          if (dep.horario_atencion) console.log(`   🕐 Horario: ${dep.horario_atencion}`)
          if (dep.contacto_responsable) console.log(`   👤 Contacto: ${dep.contacto_responsable}`)
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
  
} catch (error) {
  console.error('❌ Error leyendo .env.local:', error.message)
  process.exit(1)
}