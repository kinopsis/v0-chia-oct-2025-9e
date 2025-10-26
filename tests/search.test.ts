// Pruebas unitarias para funciones de búsqueda
// Estas pruebas pueden ejecutarse manualmente o con cualquier framework de testing

import { normalizarTexto, searchProcedures } from '@/lib/data'

// Mock de datos de trámites para pruebas
const mockProcedures = [
  {
    id: 1,
    nombre_tramite: "Licencia de construcción",
    descripcion: "Trámite para obtener licencia de construcción de vivienda",
    categoria: "Vivienda",
    dependencia_nombre: "Secretaría de Planeación",
    modalidad: "Presencial",
    requiere_pago: "Sí",
    requisitos: "Documento de propiedad, planos arquitectónicos",
    formulario: "",
    subdependencia_nombre: "",
    tiempo_respuesta: "30 días",
    instrucciones: "",
    url_suit: "",
    url_gov: ""
  },
  {
    id: 2,
    nombre_tramite: "Permiso de circulación para vehículos",
    descripcion: "Permiso para circular vehículos en la ciudad",
    categoria: "Tránsito",
    dependencia_nombre: "Secretaría de Movilidad",
    modalidad: "En línea",
    requiere_pago: "Sí",
    requisitos: "SOAT vigente, revisión tecnomecánica",
    formulario: "",
    subdependencia_nombre: "",
    tiempo_respuesta: "5 días",
    instrucciones: "",
    url_suit: "",
    url_gov: ""
  },
  {
    id: 3,
    nombre_tramite: "Certificado de tradición y libertad",
    descripcion: "Certificado que acredita la propiedad de un inmueble",
    categoria: "Notariado",
    dependencia_nombre: "Notaría",
    modalidad: "Presencial",
    requiere_pago: "Sí",
    requisitos: "Documento de identidad",
    formulario: "",
    subdependencia_nombre: "",
    tiempo_respuesta: "3 días",
    instrucciones: "",
    url_suit: "",
    url_gov: ""
  },
  {
    id: 4,
    nombre_tramite: "Inscripción en EPS",
    descripcion: "Trámite para afiliarse a un sistema de salud",
    categoria: "Salud",
    dependencia_nombre: "EPS",
    modalidad: "En línea",
    requiere_pago: "No",
    requisitos: "Documento de identidad, comprobante de ingresos",
    formulario: "",
    subdependencia_nombre: "",
    tiempo_respuesta: "10 días",
    instrucciones: "",
    url_suit: "",
    url_gov: ""
  }
]

// Funciones de utilidad para pruebas
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FALLÓ: ${message}`)
    throw new Error(message)
  } else {
    console.log(`✅ PASÓ: ${message}`)
  }
}

function assertEquals(actual: any, expected: any, message: string): void {
  if (actual !== expected) {
    console.error(`❌ FALLÓ: ${message} - Esperado: ${expected}, Actual: ${actual}`)
    throw new Error(message)
  } else {
    console.log(`✅ PASÓ: ${message}`)
  }
}

function assertLength(array: any[], expectedLength: number, message: string): void {
  if (array.length !== expectedLength) {
    console.error(`❌ FALLÓ: ${message} - Esperado: ${expectedLength}, Actual: ${array.length}`)
    throw new Error(message)
  } else {
    console.log(`✅ PASÓ: ${message}`)
  }
}

// Pruebas para normalizarTexto
console.log('\n=== PRUEBAS normalizarTexto ===')

try {
  assertEquals(normalizarTexto('HOLA MUNDO'), 'hola mundo', 'convertir a minúsculas')
  assertEquals(normalizarTexto('café'), 'cafe', 'eliminar acentos')
  assertEquals(normalizarTexto('niño'), 'nino', 'eliminar acentos en ñ')
  assertEquals(normalizarTexto('música'), 'musica', 'eliminar acentos en ú')
  assertEquals(normalizarTexto('  hola  mundo  '), 'hola mundo', 'eliminar espacios extra')
  assertEquals(normalizarTexto('  CAFÉ  Español  '), 'cafe espanol', 'combinar todas las transformaciones')
  assertEquals(normalizarTexto(''), '', 'manejar texto vacío')
  assertEquals(normalizarTexto('   '), '', 'manejar espacios en blanco')
  console.log('✅ Todas las pruebas de normalizarTexto pasaron')
} catch (error) {
  console.error('❌ Algunas pruebas de normalizarTexto fallaron')
}

// Pruebas para searchProcedures
console.log('\n=== PRUEBAS searchProcedures ===')

try {
  const result1 = searchProcedures(mockProcedures, '')
  assertLength(result1, 4, 'retornar todos los procedimientos si la consulta está vacía')

  const result2 = searchProcedures(mockProcedures, 'licencia')
  assertLength(result2, 1, 'buscar por nombre del trámite')
  assertEquals(result2[0].nombre_tramite, 'Licencia de construcción', 'encontrar trámite por nombre')

  const result3a = searchProcedures(mockProcedures, 'construccion')
  const result3b = searchProcedures(mockProcedures, 'construcción')
  assertLength(result3a, 1, 'buscar con acentos eliminados')
  assertLength(result3b, 1, 'buscar con acentos presentes')
  assertEquals(result3a[0].id, result3b[0].id, 'resultados consistentes con/sin acentos')

  const result4 = searchProcedures(mockProcedures, 'vehiculos')
  assertLength(result4, 1, 'buscar en descripción')
  assertEquals(result4[0].nombre_tramite, 'Permiso de circulación para vehículos', 'encontrar por descripción')

  const result5 = searchProcedures(mockProcedures, 'salud')
  assertLength(result5, 1, 'buscar en categoría')
  assertEquals(result5[0].categoria, 'Salud', 'encontrar por categoría')

  const result6 = searchProcedures(mockProcedures, 'secretaría')
  assertLength(result6, 2, 'buscar en dependencia')
  assert(result6.every(proc => proc.dependencia_nombre.includes('Secretaría')), 'encontrar dependencias con "Secretaría"')

  const result7 = searchProcedures(mockProcedures, 'planos')
  assertLength(result7, 1, 'buscar en requisitos')
  assertEquals(result7[0].nombre_tramite, 'Licencia de construcción', 'encontrar por requisitos')

  const result8 = searchProcedures(mockProcedures, 'casa')
  assertLength(result8, 1, 'manejar sinónimos')
  assertEquals(result8[0].nombre_tramite, 'Licencia de construcción', 'sinónimo "casa" encuentra "vivienda"')

  const result9 = searchProcedures(mockProcedures, 'pago')
  assertLength(result9, 3, 'manejar sinónimos para impuestos')
  assert(result9.every(proc => proc.requiere_pago === 'Sí'), 'sinónimo "pago" encuentra trámites con pago')

  const result10 = searchProcedures(mockProcedures, 'carro')
  assertLength(result10, 1, 'manejar sinónimos para vehículos')
  assertEquals(result10[0].nombre_tramite, 'Permiso de circulación para vehículos', 'sinónimo "carro" encuentra "vehículos"')

  const result11 = searchProcedures(mockProcedures, 'medico')
  assertLength(result11, 1, 'manejar sinónimos para salud')
  assertEquals(result11[0].categoria, 'Salud', 'sinónimo "medico" encuentra categoría "Salud"')

  const result12 = searchProcedures(mockProcedures, 'licencia construcción')
  assertLength(result12, 1, 'manejar consultas con múltiples palabras (AND lógico)')
  assertEquals(result12[0].nombre_tramite, 'Licencia de construcción', 'encontrar por múltiples palabras')

  const result13 = searchProcedures(mockProcedures, 'licencia salud')
  assertLength(result13, 0, 'no encontrar resultados si no todas las palabras coinciden')

  const result14a = searchProcedures(mockProcedures, 'LICENCIA')
  const result14b = searchProcedures(mockProcedures, 'licencia')
  assertLength(result14a, 1, 'manejar mayúsculas')
  assertLength(result14b, 1, 'manejar minúsculas')
  assertEquals(result14a[0].id, result14b[0].id, 'resultados consistentes con mayúsculas/minúsculas')

  const result15 = searchProcedures(mockProcedures, 'en')
  assertLength(result15, 0, 'manejar palabras con menos de 3 caracteres')

  const result16 = searchProcedures(mockProcedures, 'notaría')
  assertLength(result16, 1, 'buscar en todos los campos combinados')
  assertEquals(result16[0].nombre_tramite, 'Certificado de tradición y libertad', 'encontrar por dependencia')

  console.log('✅ Todas las pruebas de searchProcedures pasaron')
} catch (error) {
  console.error('❌ Algunas pruebas de searchProcedures fallaron')
}

console.log('\n=== RESUMEN DE PRUEBAS ===')
console.log('Las pruebas unitarias han sido creadas y pueden ejecutarse manualmente.')
console.log('Para ejecutarlas, importe este archivo en una página de prueba o use un framework de testing.')