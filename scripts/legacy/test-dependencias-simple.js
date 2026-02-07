// Prueba simple de dependencias usando Supabase directamente
const { createClient } = require('@supabase/supabase-js')

// Configuración directa (reemplaza con tus credenciales reales)
const supabaseUrl = 'https://mhzgppyjznotjopafpdw.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseKey) {
  console.error('❌ Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDependencias() {
  try {
    console.log('🔍 Probando conexión con dependencias...')
    
    // Test 1: Contar dependencias
    const { count, error: countError } = await supabase
      .from('dependencias')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Error contando dependencias:', countError.message)
      return
    }
    
    console.log(`✅ Dependencias encontradas: ${count}`)
    
    // Test 2: Obtener dependencias principales
    const { data: principales, error: principalesError } = await supabase
      .from('dependencias')
      .select('*')
      .eq('nivel', 0)
      .order('orden')
    
    if (principalesError) {
      console.error('❌ Error obteniendo dependencias principales:', principalesError.message)
      return
    }
    
    console.log('✅ Dependencias principales:')
    principales.forEach(dep => {
      console.log(`  - ${dep.codigo}: ${dep.nombre} (${dep.sigla})`)
    })
    
    // Test 3: Obtener subdependencias
    const { data: subdependencias, error: subError } = await supabase
      .from('dependencias')
      .select('*, dependencia_padre:dependencias(nombre)')
      .eq('nivel', 1)
      .order('orden')
    
    if (subError) {
      console.error('❌ Error obteniendo subdependencias:', subError.message)
      return
    }
    
    console.log('✅ Subdependencias encontradas:', subdependencias.length)
    subdependencias.forEach(dep => {
      console.log(`  - ${dep.codigo}: ${dep.nombre} → ${dep.dependencia_padre?.nombre || 'Sin padre'}`)
    })
    
    console.log('\n🎉 Todas las pruebas de dependencias pasaron!')
    
  } catch (error) {
    console.error('❌ Error en pruebas de dependencias:', error.message)
  }
}

testDependencias()