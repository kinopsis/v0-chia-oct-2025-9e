# 🔧 Solución al Error de Healthcheck en Coolify

## 📋 Problema Identificado

Después de resolver el error de Node.js, apareció un nuevo error de healthcheck:

```
Custom healthcheck found in Dockerfile.
Waiting for healthcheck to pass on the new container.
Waiting for the start period (5 seconds) before starting healthcheck.
Oops something is not okay, are you okay? 😢
template parsing error: template: :1:13: executing "" at <.State.Health.Status>: map has no entry for key "Health"
```

## 🔍 Análisis del Error

**Causa Raíz**: El healthcheck se estaba ejecutando antes de que el servidor estuviera completamente iniciado, y Coolify tenía problemas para interpretar el estado de salud del contenedor.

## 🛠️ Solución Implementada

### 1. Optimización del Healthcheck en Dockerfile

Se actualizó el healthcheck para ser más robusto y compatible con Coolify:

```dockerfile
# Health check - optimized for Coolify
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f --max-time 5 http://localhost:3000/api/health || exit 1
```

**Cambios clave:**
- **start-period aumentado a 40s**: Permite más tiempo para que el servidor inicie completamente
- **timeout aumentado a 10s**: Mayor tiempo de espera para la respuesta del healthcheck
- **--max-time 5**: Limita el tiempo máximo de curl para evitar esperas infinitas

### 2. Mejoras en el Script de Validación

Se actualizó el script de validación para incluir verificación del healthcheck y proporcionar instrucciones más completas.

## 🚀 Configuración Recomendada para Coolify

### Variables de Entorno
```bash
COOLIFY_USE_DOCKERFILE=true
NIXPACKS_DISABLE=true
FORCE_DOCKERFILE=true
NODE_ENV=production
```

### Comandos de Build
**Build Command:**
```bash
pnpm install && pnpm run build
```

**Start Command:**
```bash
node server.js
```

**Configuración Adicional:**
- **Build Directory**: `/app`
- **Port**: `3000`
- **Healthcheck Timeout**: `40 seconds` (para permitir el tiempo de inicio)

## 📋 Verificación del Despliegue

### Mensajes de Éxito Esperados
```
# Inicio del servidor
> Ready on http://localhost:3000

# Healthcheck exitoso
Health check passed

# Despliegue completo
Deployment successful
```

### Solución de Problemas Comunes

**Si el healthcheck sigue fallando:**
1. Verificar que el endpoint `/api/health` esté funcionando
2. Aumentar el `start-period` a 60s
3. Verificar que el puerto 3000 esté correctamente expuesto
4. Asegurar que el servidor node.js esté escuchando en `0.0.0.0` y no solo en `localhost`

**Endpoint de salud verificado:**
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
}
```

## 🎯 Resultado Esperado

Con estas optimizaciones:
- ✅ El servidor tiene tiempo suficiente para iniciar antes del healthcheck
- ✅ Coolify puede interpretar correctamente el estado de salud
- ✅ El despliegue completa exitosamente sin errores de healthcheck
- ✅ La aplicación está completamente funcional en producción

## ⏱️ Tiempo de Solución

**Tiempo estimado**: 2-3 minutos
**Nivel de dificultad**: Bajo
**Impacto**: Alto (soluciona el bloqueo de despliegue por healthcheck)

La solución aborda tanto el problema inicial de Node.js como los problemas subsiguientes de healthcheck, proporcionando una configuración robusta para despliegues en Coolify.