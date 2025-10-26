import { test, expect } from '@playwright/test';

test.describe('Creación de trámites con campo de pago mejorado', () => {
  test.beforeEach(async ({ page }) => {
    // Iniciar sesión como administrador
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Verificar que se haya iniciado sesión correctamente
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
  });

  test('debe crear un trámite que requiere pago con información detallada', async ({ page }) => {
    await page.goto('/admin/tramites/nuevo');

    // Llenar campos básicos
    await page.fill('input[name="nombre_tramite"]', 'Trámite de Prueba con Pago');
    await page.fill('textarea[name="descripcion"]', 'Descripción de prueba para trámite con pago');
    await page.selectOption('select[name="categoria"]', 'Vivienda');
    await page.selectOption('select[name="modalidad"]', 'presencial');
    await page.fill('input[name="tiempo_respuesta"]', '10 días hábiles');
    await page.fill('textarea[name="requisitos"]', 'Requisitos de prueba');
    await page.fill('textarea[name="instrucciones"]', 'Instrucciones de prueba');

    // Seleccionar dependencia
    await page.selectOption('select[name="dependencia_id"]', '1');

    // Seleccionar "Sí" para requiere_pago
    await page.check('input[name="requiere_pago_opcion"][value="Sí"]');

    // Verificar que aparece el campo de información de pago
    await expect(page.locator('textarea[name="informacion_pago"]')).toBeVisible();

    // Llenar información detallada del pago
    await page.fill('textarea[name="informacion_pago"]', '$50.000 (Cincuenta mil pesos)');

    // Enviar formulario
    await page.click('button[type="submit"]');

    // Verificar éxito
    await expect(page.locator('text=Trámite creado exitosamente')).toBeVisible();
  });

  test('debe crear un trámite que no requiere pago', async ({ page }) => {
    await page.goto('/admin/tramites/nuevo');

    // Llenar campos básicos
    await page.fill('input[name="nombre_tramite"]', 'Trámite de Prueba Gratis');
    await page.fill('textarea[name="descripcion"]', 'Descripción de prueba para trámite gratuito');
    await page.selectOption('select[name="categoria"]', 'Salud');
    await page.selectOption('select[name="modalidad"]', 'virtual');
    await page.fill('input[name="tiempo_respuesta"]', '5 días hábiles');
    await page.fill('textarea[name="requisitos"]', 'Requisitos de prueba');
    await page.fill('textarea[name="instrucciones"]', 'Instrucciones de prueba');

    // Seleccionar dependencia
    await page.selectOption('select[name="dependencia_id"]', '1');

    // Seleccionar "No" para requiere_pago
    await page.check('input[name="requiere_pago_opcion"][value="No"]');

    // Verificar que no aparece el campo de información de pago
    await expect(page.locator('textarea[name="informacion_pago"]')).not.toBeVisible();

    // Enviar formulario
    await page.click('button[type="submit"]');

    // Verificar éxito
    await expect(page.locator('text=Trámite creado exitosamente')).toBeVisible();
  });

  test('debe mostrar error si no se selecciona opción de pago', async ({ page }) => {
    await page.goto('/admin/tramites/nuevo');

    // Llenar campos básicos
    await page.fill('input[name="nombre_tramite"]', 'Trámite de Prueba Error');
    await page.fill('textarea[name="descripcion"]', 'Descripción de prueba');
    await page.selectOption('select[name="categoria"]', 'Educación');
    await page.selectOption('select[name="modalidad"]', 'mixta');
    await page.fill('input[name="tiempo_respuesta"]', '7 días hábiles');
    await page.fill('textarea[name="requisitos"]', 'Requisitos de prueba');
    await page.fill('textarea[name="instrucciones"]', 'Instrucciones de prueba');

    // No seleccionar ninguna opción de requiere_pago

    // Intentar enviar formulario
    await page.click('button[type="submit"]');

    // Verificar error
    await expect(page.locator('text=Debe seleccionar \'Sí\' o \'No\' para el campo \'requiere_pago\'')).toBeVisible();
  });

  test('debe mostrar error si requiere pago pero no hay información detallada', async ({ page }) => {
    await page.goto('/admin/tramites/nuevo');

    // Llenar campos básicos
    await page.fill('input[name="nombre_tramite"]', 'Trámite de Prueba Error Pago');
    await page.fill('textarea[name="descripcion"]', 'Descripción de prueba');
    await page.selectOption('select[name="categoria"]', 'Impuestos');
    await page.selectOption('select[name="modalidad"]', 'presencial');
    await page.fill('input[name="tiempo_respuesta"]', '15 días hábiles');
    await page.fill('textarea[name="requisitos"]', 'Requisitos de prueba');
    await page.fill('textarea[name="instrucciones"]', 'Instrucciones de prueba');

    // Seleccionar dependencia
    await page.selectOption('select[name="dependencia_id"]', '1');

    // Seleccionar "Sí" para requiere_pago
    await page.check('input[name="requiere_pago_opcion"][value="Sí"]');

    // No llenar información detallada del pago

    // Intentar enviar formulario
    await page.click('button[type="submit"]');

    // Verificar error
    await expect(page.locator('text=La información del pago es requerida cuando el trámite requiere pago')).toBeVisible();
  });
});