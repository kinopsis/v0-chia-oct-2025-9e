// Prueba simple de las funciones de validación
// Este archivo se puede ejecutar con Node.js para verificar el funcionamiento

// Simulación de las funciones de validación
function isValidRequierePago(value) {
  return value === "Sí" || value === "No" || value === null || value === undefined || value === ""
}

function normalizeRequierePago(value) {
  if (value === "Sí" || value === "No") {
    return value
  }
  if (value === null || value === undefined || value === "") {
    return null
  }
  return null // For invalid values, return null instead of empty string
}

function validateAndNormalizeRequierePago(value) {
  if (value === "Sí" || value === "No") {
    return { isValid: true, normalizedValue: value }
  }
  if (value === null || value === undefined || value === "") {
    return { isValid: true, normalizedValue: null }
  }
  return { isValid: false, normalizedValue: null }
}

// Pruebas
console.log("=== PRUEBAS DE VALIDACIÓN requiere_pago ===\n");

const testCases = [
  { input: "Sí", expectedValid: true, expectedNormalized: "Sí" },
  { input: "No", expectedValid: true, expectedNormalized: "No" },
  { input: null, expectedValid: true, expectedNormalized: null },
  { input: undefined, expectedValid: true, expectedNormalized: null },
  { input: "", expectedValid: true, expectedNormalized: null },
  { input: "SI", expectedValid: false, expectedNormalized: null }, // Invalido (case sensitive)
  { input: "NO", expectedValid: false, expectedNormalized: null }, // Invalido (case sensitive)
  { input: "sí", expectedValid: false, expectedNormalized: null }, // Invalido (case sensitive)
  { input: "no", expectedValid: false, expectedNormalized: null }, // Invalido (case sensitive)
  { input: "1", expectedValid: false, expectedNormalized: null }, // Invalido
  { input: 1, expectedValid: false, expectedNormalized: null }, // Invalido
  { input: true, expectedValid: false, expectedNormalized: null }, // Invalido
  { input: "Tal vez", expectedValid: false, expectedNormalized: null }, // Invalido
];

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
  const isValid = isValidRequierePago(testCase.input);
  const normalized = normalizeRequierePago(testCase.input);
  const { isValid: isValid2, normalizedValue } = validateAndNormalizeRequierePago(testCase.input);
  
  const validTest = isValid === testCase.expectedValid;
  const normalizedTest = normalized === testCase.expectedNormalized;
  const combinedTest = isValid2 === testCase.expectedValid && normalizedValue === testCase.expectedNormalized;
  
  const allPassed = validTest && normalizedTest && combinedTest;
  
  console.log(`Test ${index + 1}: ${JSON.stringify(testCase.input)}`);
  console.log(`  Validación simple: ${isValid} (esperado: ${testCase.expectedValid}) ${validTest ? '✓' : '✗'}`);
  console.log(`  Normalización: ${JSON.stringify(normalized)} (esperado: ${JSON.stringify(testCase.expectedNormalized)}) ${normalizedTest ? '✓' : '✗'}`);
  console.log(`  Validación combinada: isValid=${isValid2}, normalized=${JSON.stringify(normalizedValue)} ${combinedTest ? '✓' : '✗'}`);
  console.log(`  Resultado: ${allPassed ? 'PASSED' : 'FAILED'}\n`);
  
  if (allPassed) passedTests++;
});

console.log(`=== RESUMEN ===`);
console.log(`Pruebas pasadas: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);

if (passedTests === totalTests) {
  console.log("🎉 ¡Todas las pruebas pasaron! La validación está funcionando correctamente.");
} else {
  console.log("❌ Algunas pruebas fallaron. Revisa la implementación.");
}