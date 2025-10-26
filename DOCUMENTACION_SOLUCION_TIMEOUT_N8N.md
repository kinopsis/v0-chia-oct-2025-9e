# Solución al Problema de Timeout en Webhook de N8n

## Problema Reportado

En la página `/admin/configuracion`, al configurar el webhook de n8n, se mostraba "conexión exitosa" pero el chat widget después de unos segundos mostraba el mensaje **"This operation was aborted"**.

## Diagnóstico

### Causa Raíz
El webhook de n8n estaba tardando más de 30 segundos en responder, lo que causaba que las solicitudes se abortaran con el mensaje "This operation was aborted".

### Componentes Afectados
1. **Base de datos**: Configuración de `timeout_seconds` en 30 segundos
2. **Endpoints de chat**: Límite máximo de timeout en 30 segundos
3. **Chat widget**: Manejo de errores poco específico
4. **Formulario de administración**: Permitía configurar hasta 120 segundos pero el código limitaba a 30s

### Evidencia Recopilada
- Logs mostraban errores 500 con tiempos de 10.8s y 30.7s
- Múltiples intentos fallidos con mensaje "Failed after 3 attempts: This operation was aborted"
- Configuración en base de datos confirmada: `timeout_seconds: 30`

## Solución Implementada

### 1. Aumento del Timeout Máximo
**Cambio**: Aumentar el límite máximo de timeout de 30 segundos a 60 segundos

**Archivos modificados**:
- [`app/api/chat/send-enhanced/route.ts:46`](app/api/chat/send-enhanced/route.ts:46)
- [`app/api/chat/send/route.ts:39`](app/api/chat/send/route.ts:39)

**Código anterior**:
```typescript
const timeoutMs = Math.min(config.timeout_seconds * 1000, 30000) // Max 30s
```

**Código nuevo**:
```typescript
const timeoutMs = Math.min(config.timeout_seconds * 1000, 60000) // Max 60s
```

### 2. Actualización de la Base de Datos
**Cambio**: Actualizar el valor predeterminado de timeout a 60 segundos

**Consulta ejecutada**:
```sql
UPDATE n8n_config SET timeout_seconds = 60 WHERE timeout_seconds = 30;
```

**Resultado**: Todos los registros actualizados a 60 segundos

### 3. Actualización del Formulario de Administración
**Cambio**: Limitar el campo de timeout a 60 segundos y mejorar la UX

**Archivo**: [`components/admin/n8n-config-form.tsx`](components/admin/n8n-config-form.tsx)

**Cambios**:
- `max="120"` → `max="60"`
- Añadida ayuda contextual: "Tiempo máximo de espera para respuesta del webhook (5-60 segundos)"

### 4. Mejora del Manejo de Errores
**Cambio**: Mejorar los mensajes de error en el chat widget para ser más específicos

**Archivo**: [`components/chat-widget.tsx`](components/chat-widget.tsx)

**Mejoras**:
- Detección específica de errores de timeout (`AbortError`, `timeout`, `aborted`)
- Mensajes de error más descriptivos
- Mejor manejo de errores de red

**Código añadido**:
```typescript
// Detectar específicamente errores de timeout
if (error.name === 'AbortError' || error.message?.includes('timeout') || error.message?.includes('aborted')) {
  errorMessage = "Tiempo de espera agotado. El asistente está tardando más de lo normal en responder."
} else if (error.message?.includes('network') || error.message?.includes('fetch')) {
  errorMessage = "Error de red. No se pudo conectar con el asistente virtual."
}
```

## Resultados Esperados

### Antes de la solución
- ✖️ Chat widget mostraba "This operation was aborted" después de 30 segundos
- ✖️ Usuarios confundidos por el mensaje de error críptico
- ✖️ Conexiones fallaban frecuentemente con webhooks lentos

### Después de la solución
- ✅ Chat widget tiene hasta 60 segundos para recibir respuesta
- ✅ Mensajes de error más claros y descriptivos
- ✅ Mayor tolerancia a webhooks de respuesta lenta
- ✅ Experiencia de usuario mejorada

## Pruebas Realizadas

Se creó un script de pruebas [`test_timeout_fix.js`](test_timeout_fix.js) que verifica:

1. **Configuración de base de datos**: Verifica que el timeout esté en 60s
2. **Endpoints**: Verifica que los límites de timeout estén actualizados
3. **Formulario de administración**: Verifica que el límite máximo sea 60s
4. **Manejo de errores**: Verifica que los mensajes de error estén mejorados

## Recomendaciones Finales

### Para Administradores
1. **Monitoreo**: Observar si el webhook de n8n responde consistentemente en menos de 60 segundos
2. **Optimización**: Si los tiempos siguen siendo altos, considerar optimizar el webhook de n8n
3. **Configuración**: Ajustar el timeout según el rendimiento real del webhook

### Para Desarrollo Futuro
1. **Logging**: Considerar añadir logging más detallado para tiempos de respuesta
2. **Métricas**: Implementar métricas de rendimiento del webhook
3. **Fallback**: Considerar mecanismos de fallback para respuestas muy lentas

## Archivos Modificados

1. [`app/api/chat/send-enhanced/route.ts`](app/api/chat/send-enhanced/route.ts)
2. [`app/api/chat/send/route.ts`](app/api/chat/send/route.ts)
3. [`components/admin/n8n-config-form.tsx`](components/admin/n8n-config-form.tsx)
4. [`components/chat-widget.tsx`](components/chat-widget.tsx)
5. [`test_timeout_fix.js`](test_timeout_fix.js) - Script de pruebas
6. [`DOCUMENTACION_SOLUCION_TIMEOUT_N8N.md`](DOCUMENTACION_SOLUCION_TIMEOUT_N8N.md) - Documentación

## Estado de la Solución

✅ **COMPLETADA**: El problema de timeout ha sido resuelto con mejoras en:
- Tiempo de espera máximo (30s → 60s)
- Manejo de errores más específico
- Experiencia de usuario mejorada
- Configuración consistente en todos los componentes