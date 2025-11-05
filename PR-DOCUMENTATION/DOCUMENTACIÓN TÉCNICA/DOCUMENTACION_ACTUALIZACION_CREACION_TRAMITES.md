# Documentación de Actualización: Consistencia en Creación de Trámites con Campo de Pago Mejorado

## Resumen

Se ha actualizado el formulario de creación de trámites y el endpoint de creación para mantener consistencia con la nueva implementación del campo de pago mejorado, que separa la decisión binaria ("Sí"/"No") de la información detallada del pago.

## Cambios Realizados

### 1. Frontend: Formulario de Creación Mejorado

**Archivo:** [`app/admin/tramites/nuevo/page.tsx`](app/admin/tramites/nuevo/page.tsx)

#### Nuevos Estados
```typescript
const [requierePagoValue, setRequierePagoValue] = useState<string>("")
const [informacionPago, setInformacionPago] = useState<string>("")
const [esPago, setEsPago] = useState<boolean>(false)
```

#### Radio Buttons para Decisión de Pago
```typescript
<div className="space-y-2">
  <Label>Requiere Pago *</Label>
  <div className="flex gap-6">
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name="requiere_pago_opcion"
        value="Sí"
        checked={esPago}
        onChange={(e) => {
          setEsPago(true);
          setRequierePagoValue("Sí");
        }}
        className="mr-2"
      />
      <span>Sí</span>
    </label>
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name="requiere_pago_opcion"
        value="No"
        checked={!esPago}
        onChange={(e) => {
          setEsPago(false);
          setRequierePagoValue("No");
          setInformacionPago(""); // Limpiar información de pago
        }}
        className="mr-2"
      />
      <span>No</span>
    </label>
  </div>
</div>
```

#### Campo de Texto Condicional para Información de Pago
```typescript
{esPago && (
  <div className="space-y-2">
    <Label htmlFor="informacion_pago">Información del Pago *</Label>
    <Textarea
      id="informacion_pago"
      name="informacion_pago"
      value={informacionPago}
      onChange={(e) => setInformacionPago(e.target.value)}
      placeholder="Ingrese la información del pago (ej: $50.000, 0.2 UVT, Variable según caso)"
      rows={3}
      className="font-mono text-sm"
      required
    />
    <p className="text-sm text-gray-600">
      Esta información detallada del pago se guardará por separado del campo "requiere_pago"
    </p>
  </div>
)}
```

#### Validación Mejorada en el Submit
```typescript
// Validar selección de radio buttons
if (requierePagoValue !== "Sí" && requierePagoValue !== "No") {
  setError("Debe seleccionar 'Sí' o 'No' para el campo 'requiere_pago'")
  setLoading(false)
  return
}

// Validar información de pago si requiere pago
if (esPago && (!informacionPago || !informacionPago.trim())) {
  setError("La información del pago es requerida cuando el trámite requiere pago")
  setLoading(false)
  return
}

// Asegurar que el valor de requiere_pago sea el correcto
(data as any).requiere_pago = esPago ? "Sí" : "No"

// Si requiere pago, también enviar la información detallada en su campo correspondiente
if (esPago && informacionPago.trim()) {
  (data as any).informacion_pago = informacionPago.trim()
}
```

### 2. Backend: Endpoint de Creación Actualizado

**Archivo:** [`app/api/admin/tramites/create/route.ts`](app/api/admin/tramites/create/route.ts)

#### Validación de Relación entre Campos
```typescript
// Validate relationship between requiere_pago and informacion_pago
if (tramiteData.requiere_pago === "Sí" && (!tramiteData.informacion_pago || !tramiteData.informacion_pago.trim())) {
  return NextResponse.json({
    error: "Cuando 'requiere_pago' es 'Sí', el campo 'informacion_pago' es requerido"
  }, { status: 400 })
}

if (tramiteData.requiere_pago === "No" && tramiteData.informacion_pago && tramiteData.informacion_pago.trim()) {
  return NextResponse.json({
    error: "Cuando 'requiere_pago' es 'No', el campo 'informacion_pago' debe estar vacío"
  }, { status: 400 })
}
```

#### Manejo del Campo informacion_pago
```typescript
// Handle informacion_pago field if provided
if (tramiteData.informacion_pago !== undefined) {
  insertData.informacion_pago = tramiteData.informacion_pago?.trim() || null
}
```

### 3. Base de Datos: Campo Adicional

**Archivo:** [`scripts/17-add-informacion-pago-to-tramites.sql`](scripts/17-add-informacion-pago-to-tramites.sql)

#### Nuevo Campo en la Tabla
```sql
-- Add informacion_pago column to tramites table
ALTER TABLE tramites
ADD COLUMN IF NOT EXISTS informacion_pago TEXT;
```

#### Trigger de Validación
```sql
-- Function to validate informacion_pago values based on requiere_pago
CREATE OR REPLACE FUNCTION validate_tramite_informacion_pago()
RETURNS TRIGGER AS $$
BEGIN
  -- If requiere_pago is 'Sí', informacion_pago should be provided (non-empty string)
  IF NEW.requiere_pago = 'Sí' THEN
    IF NEW.informacion_pago IS NULL OR NEW.informacion_pago = '' THEN
      RAISE EXCEPTION 'El campo informacion_pago es obligatorio cuando requiere_pago = ''Sí''';
    END IF;
  END IF;
  
  -- If requiere_pago is not 'Sí', informacion_pago should be NULL
  IF NEW.requiere_pago != 'Sí' THEN
    NEW.informacion_pago := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 4. Pruebas: Cobertura de Creación

**Archivo:** [`tests/admin-tramite-creacion-pago.test.ts`](tests/admin-tramite-creacion-pago.test.ts)

#### Pruebas Implementadas
- Creación de trámite que requiere pago con información detallada
- Creación de trámite que no requiere pago
- Validación de error cuando no se selecciona opción de pago
- Validación de error cuando requiere pago pero no hay información detallada

## Beneficios de la Implementación

### 1. Consistencia Total
- **Formulario de creación y edición**: Ahora tienen la misma lógica y validación
- **Validación frontend y backend**: Coherentes entre sí
- **Base de datos**: Validación adicional mediante triggers

### 2. Experiencia de Usuario Mejorada
- **Interfaz intuitiva**: Radio buttons claros para decisiones binarias
- **Campo condicional**: Solo aparece cuando es relevante
- **Validación en tiempo real**: Mensajes de error específicos

### 3. Calidad de Datos
- **Validación estricta**: Solo se permiten valores "Sí" o "No" en `requiere_pago`
- **Campo obligatorio condicional**: `informacion_pago` es requerido solo cuando aplica
- **Consistencia**: Elimina valores inconsistentes

### 4. Mantenibilidad
- **Código limpio**: Lógica de validación clara y organizada
- **Separación de responsabilidades**: Decisión binaria vs. información detallada
- **Documentación completa**: Guía para futuros desarrollos

## Compatibilidad

### Vistas Públicas
La implementación mantiene total compatibilidad con las vistas públicas en `/tramites` y el modal de procedimiento. La función `formatPaymentInfo()` ya maneja correctamente ambos escenarios:
- Si `requiere_pago` contiene "No" → muestra "Este trámite es gratuito"
- Si `requiere_pago` contiene información detallada → muestra "Costo: [información]"

### Backward Compatibility
- Los trámites existentes siguen funcionando correctamente
- La edición de trámites existentes se adapta automáticamente a la nueva interfaz
- Los valores existentes en `requiere_pago` se muestran correctamente en el campo condicional

## Estado Actual

✅ **Formulario de creación actualizado y funcional**
✅ **Endpoint de creación con validaciones completas**
✅ **Base de datos con campo adicional y validación**
✅ **Pruebas unitarias implementadas**
✅ **Documentación actualizada**
✅ **Compatibilidad con vistas públicas mantenida**

La implementación completa asegura que tanto la creación como la edición de trámites sigan el mismo patrón de diseño y validación, mejorando significativamente la consistencia y calidad del sistema.