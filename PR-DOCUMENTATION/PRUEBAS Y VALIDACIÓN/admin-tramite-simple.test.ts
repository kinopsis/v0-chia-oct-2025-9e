import { test, expect } from '@playwright/test';

test('evaluar pagina de edicion de tramite', async ({ page }) => {
  // Navegar a la página de edición de trámite
  await page.goto('http://localhost:3000/admin/tramites/81388/editar');
  
  // Esperar a que la página cargue
  await page.waitForLoadState('networkidle');
  
  // Verificar que la página se cargó correctamente
  await expect(page).toHaveURL(/.*\/admin\/tramites\/81388\/editar/);
  const titulo = page.locator('h1');
  await expect(titulo).toBeVisible();
  await expect(titulo).toContainText('Editar Trámite');
  
  // Evaluar distribución de dependencia y subdependencia
  const dependenciaField = page.locator('[name="dependencia_id"]');
  const subdependenciaField = page.locator('[name="subdependencia_id"]');
  
  await expect(dependenciaField).toBeVisible();
  await expect(subdependenciaField).toBeVisible();
  
  // Verificar que estén en la misma fila o contenedor
  const dependenciaBox = await dependenciaField.boundingBox();
  const subdependenciaBox = await subdependenciaField.boundingBox();
  
  if (dependenciaBox && subdependenciaBox) {
    // Verificar alineación vertical (misma fila)
    const verticalDifference = Math.abs(dependenciaBox.y - subdependenciaBox.y);
    console.log(`Diferencia vertical entre dependencia y subdependencia: ${verticalDifference}px`);
    
    // Verificar tamaños similares para distribución equilibrada
    const widthDifference = Math.abs(dependenciaBox.width - subdependenciaBox.width);
    console.log(`Diferencia de ancho: ${widthDifference}px`);
    
    // Verificar proximidad horizontal razonable
    const horizontalDistance = Math.abs(dependenciaBox.x - subdependenciaBox.x);
    console.log(`Distancia horizontal: ${horizontalDistance}px`);
  }
  
  // Verificar campo "requiere pago"
  const requierePagoField = page.locator('[name="requiere_pago"]');
  const requierePagoLabel = page.locator('label').filter({ hasText: 'Requiere Pago' });
  
  await expect(requierePagoField).toBeVisible();
  await expect(requierePagoLabel).toBeVisible();
  
  // Verificar tipo de campo
  const fieldType = await requierePagoField.getAttribute('type');
  const fieldRole = await requierePagoField.getAttribute('role');
  console.log(`Tipo de campo requiere_pago: ${fieldType || fieldRole}`);
  
  // Verificar estado actual
  const isChecked = await requierePagoField.isChecked();
  console.log(`Estado actual de requiere_pago: ${isChecked}`);
  
  // Verificar accesibilidad
  const labelFor = await requierePagoLabel.getAttribute('for');
  const fieldId = await requierePagoField.getAttribute('id');
  if (labelFor && fieldId) {
    console.log(`Label correctamente asociada: ${labelFor === fieldId}`);
  }
  
  // Evaluar flujo visual del formulario
  const form = page.locator('form');
  await expect(form).toBeVisible();
  
  // Verificar campos clave
  const camposClave = [
    'nombre',
    'descripcion',
    'dependencia_id', 
    'subdependencia_id',
    'requiere_pago',
    'monto_pago'
  ];
  
  let camposEncontrados = 0;
  for (const campo of camposClave) {
    const field = page.locator(`[name="${campo}"]`);
    if (await field.isVisible()) {
      camposEncontrados++;
      console.log(`Campo ${campo}: visible`);
    } else {
      console.log(`Campo ${campo}: NO visible`);
    }
  }
  console.log(`Campos clave encontrados: ${camposEncontrados}/${camposClave.length}`);
  
  // Verificar agrupamiento lógico
  const requierePagoBox = await requierePagoField.boundingBox();
  const montoPagoField = page.locator('[name="monto_pago"]');
  const montoPagoBox = await montoPagoField.boundingBox();
  
  if (requierePagoBox && montoPagoBox) {
    const pagoDistance = Math.sqrt(
      Math.pow(requierePagoBox.x - montoPagoBox.x, 2) +
      Math.pow(requierePagoBox.y - montoPagoBox.y, 2)
    );
    console.log(`Distancia entre campos de pago: ${pagoDistance}px`);
  }
  
  // Tomar captura de pantalla para evaluación visual
  await page.screenshot({ path: 'screenshots/evaluacion-tramite-edicion.png', fullPage: true });
  
  console.log('Evaluación completada. Revisar captura de pantalla para análisis visual.');
});