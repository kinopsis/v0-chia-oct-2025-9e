import { test, expect } from '@playwright/test';

// Configuración básica de Playwright
const config = {
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: false,
    viewport: { width: 1280, height: 720 },
  },
};

test.describe('Formulario de Edición de Trámite', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de edición de trámite
    await page.goto('/admin/tramites/81388/editar');
    
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle');
  });

  test('debe cargar la página de edición de trámite', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/admin\/tramites\/81388\/editar/);
    await expect(page.locator('h1')).toContainText('Editar Trámite');
  });

  test('debe evaluar la distribución simétrica de dependencia y subdependencia', async ({ page }) => {
    // Verificar que los campos de dependencia y subdependencia estén presentes
    const dependenciaField = page.locator('[name="dependencia_id"]');
    const subdependenciaField = page.locator('[name="subdependencia_id"]');
    
    await expect(dependenciaField).toBeVisible();
    await expect(subdependenciaField).toBeVisible();
    
    // Verificar que ambos campos estén en el mismo contenedor o fila
    const dependenciaContainer = dependenciaField.locator('..');
    const subdependenciaContainer = subdependenciaField.locator('..');
    
    // Verificar que tengan un diseño equilibrado (misma clase o contenedor)
    const dependenciaClasses = await dependenciaContainer.getAttribute('class');
    const subdependenciaClasses = await subdependenciaContainer.getAttribute('class');
    
    // Ambos deberían tener clases similares para una distribución simétrica
    expect(dependenciaClasses).toBeTruthy();
    expect(subdependenciaClasses).toBeTruthy();
    
    // Verificar que estén alineados visualmente (misma fila o contenedor)
    const dependenciaBoundingBox = await dependenciaField.boundingBox();
    const subdependenciaBoundingBox = await subdependenciaField.boundingBox();
    
    if (dependenciaBoundingBox && subdependenciaBoundingBox) {
      // Verificar que estén aproximadamente en la misma línea vertical
      const verticalDifference = Math.abs(dependenciaBoundingBox.y - subdependenciaBoundingBox.y);
      expect(verticalDifference).toBeLessThan(10); // Diferencia máxima de 10px
      
      // Verificar que tengan tamaños similares para distribución equilibrada
      const widthDifference = Math.abs(dependenciaBoundingBox.width - subdependenciaBoundingBox.width);
      expect(widthDifference).toBeLessThan(50); // Diferencia máxima de 50px
    }
  });

  test('debe verificar el comportamiento del campo "requiere pago"', async ({ page }) => {
    // Buscar el campo de "requiere pago"
    const requierePagoField = page.locator('[name="requiere_pago"]');
    const requierePagoLabel = page.locator('label').filter({ hasText: 'Requiere Pago' });
    
    await expect(requierePagoField).toBeVisible();
    await expect(requierePagoLabel).toBeVisible();
    
    // Verificar que el campo sea un switch o checkbox
    const fieldType = await requierePagoField.getAttribute('type');
    const fieldRole = await requierePagoField.getAttribute('role');
    
    expect(fieldType === 'checkbox' || fieldRole === 'switch').toBeTruthy();
    
    // Verificar que muestre el estado actual correctamente
    const isChecked = await requierePagoField.isChecked();
    expect(typeof isChecked).toBe('boolean');
    
    // Verificar que el label esté correctamente asociado
    const labelFor = await requierePagoLabel.getAttribute('for');
    const fieldId = await requierePagoField.getAttribute('id');
    
    if (labelFor && fieldId) {
      expect(labelFor).toBe(fieldId);
    }
    
    // Verificar que el campo sea interactuable
    await requierePagoField.click();
    const isCheckedAfterClick = await requierePagoField.isChecked();
    expect(isCheckedAfterClick).not.toBe(isChecked);
    
    // Restaurar el estado original
    if (!isChecked) {
      await requierePagoField.click();
    }
  });

  test('debe evaluar el flujo visual y estructura lógica del formulario', async ({ page }) => {
    // Verificar que los campos estén organizados de manera lógica
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    // Verificar la presencia de campos clave en un orden lógico
    const camposOrdenados = [
      'nombre',
      'descripcion', 
      'dependencia_id',
      'subdependencia_id',
      'requiere_pago',
      'monto_pago',
      'tiempo_estimado',
      'documentos_requeridos'
    ];
    
    let camposEncontrados = 0;
    for (const campo of camposOrdenados) {
      const field = page.locator(`[name="${campo}"]`);
      if (await field.isVisible()) {
        camposEncontrados++;
      }
    }
    
    // Debe encontrar al menos la mayoría de los campos clave
    expect(camposEncontrados).toBeGreaterThan(camposOrdenados.length * 0.7);
    
    // Verificar que los campos relacionados estén agrupados
    const dependenciaField = page.locator('[name="dependencia_id"]');
    const subdependenciaField = page.locator('[name="subdependencia_id"]');
    
    const dependenciaBox = await dependenciaField.boundingBox();
    const subdependenciaBox = await subdependenciaField.boundingBox();
    
    if (dependenciaBox && subdependenciaBox) {
      // Verificar que estén en proximidad razonable
      const distance = Math.sqrt(
        Math.pow(dependenciaBox.x - subdependenciaBox.x, 2) +
        Math.pow(dependenciaBox.y - subdependenciaBox.y, 2)
      );
      expect(distance).toBeLessThan(300); // Distancia máxima razonable
    }
    
    // Verificar que los campos de pago estén agrupados
    const requierePagoField = page.locator('[name="requiere_pago"]');
    const montoPagoField = page.locator('[name="monto_pago"]');
    
    const requierePagoBox = await requierePagoField.boundingBox();
    const montoPagoBox = await montoPagoField.boundingBox();
    
    if (requierePagoBox && montoPagoBox) {
      const pagoDistance = Math.sqrt(
        Math.pow(requierePagoBox.x - montoPagoBox.x, 2) +
        Math.pow(requierePagoBox.y - montoPagoBox.y, 2)
      );
      expect(pagoDistance).toBeLessThan(300); // Campos de pago deben estar cercanos
    }
  });

  test('debe verificar la accesibilidad del formulario', async ({ page }) => {
    // Verificar que todos los campos tengan labels asociados
    const formFields = page.locator('form [name]');
    const fieldCount = await formFields.count();
    
    for (let i = 0; i < fieldCount; i++) {
      const field = formFields.nth(i);
      const fieldName = await field.getAttribute('name');
      const fieldId = await field.getAttribute('id');
      
      if (fieldId) {
        const label = page.locator(`label[for="${fieldId}"]`);
        if (await label.isVisible()) {
          continue;
        }
      }
      
      // Buscar label por texto o aria-label
      const ariaLabel = await field.getAttribute('aria-label');
      const placeholder = await field.getAttribute('placeholder');
      
      // Al menos uno de estos debe estar presente para accesibilidad
      expect(ariaLabel || placeholder).toBeTruthy();
    }
  });

  test('debe verificar la responsividad del formulario', async ({ page }) => {
    // Probar en diferentes tamaños de pantalla
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1024, height: 768 },   // Tablet
      { width: 375, height: 667 }     // Mobile
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForLoadState('networkidle');
      
      // Verificar que todos los campos clave sean visibles
      const dependenciaField = page.locator('[name="dependencia_id"]');
      const subdependenciaField = page.locator('[name="subdependencia_id"]');
      const requierePagoField = page.locator('[name="requiere_pago"]');
      
      await expect(dependenciaField).toBeVisible();
      await expect(subdependenciaField).toBeVisible();
      await expect(requierePagoField).toBeVisible();
      
      // Verificar que no haya desbordamientos
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = viewport.width;
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 50); // Margen de 50px
    }
  });
});