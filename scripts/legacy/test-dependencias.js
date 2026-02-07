import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testDependencias() {
  try {
    console.log('🔍 Probando conexión con dependencias...')
    
    // Test 1: Contar dependencias
    const { count, error: countError } = await supabase
      .from('dependencias')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Error contando dependencias:', countError)
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
      console.error('❌ Error obteniendo dependencias principales:', principalesError)
      return
    }
    
    console.log('✅ Dependencias principales:')
    principales.forEach(dep => {
      console.log(`  - ${dep.codigo}: ${dep.nombre} (${dep.sigla})`)
    })
    
    // Test 3: Obtener subdependencias
    const { data: subdependencias, error: subError } = await supabase
      .from('dependencias')
      .select('*, dependencia_padre:dependencias(*)')
      .eq('nivel', 1)
      .order('orden')
    
    if (subError) {
      console.error('❌ Error obteniendo subdependencias:', subError)
      return
    }
    
    console.log('✅ Subdependencias encontradas:', subdependencias.length)
    subdependencias.forEach(dep => {
      console.log(`  - ${dep.codigo}: ${dep.nombre} → ${dep.dependencia_padre?.nombre || 'Sin padre'}`)
    })
    
    // Test 4: Probar árbol de dependencias
    const { data: arbol, error: arbolError } = await supabase
      .rpc('get_dependencias_arbol')
    
    if (arbolError) {
      console.error('❌ Error obteniendo árbol de dependencias:', arbolError)
    } else {
      console.log('✅ Árbol de dependencias generado correctamente')
      console.log('Estructura del árbol:', JSON.stringify(arbol, null, 2))
    }
    
    console.log('\n🎉 Todas las pruebas de dependencias pasaron!')
    
  } catch (error) {
    console.error('❌ Error en pruebas de dependencias:', error)
  }
}

testDependencias()