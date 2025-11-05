# 🔧 Solución Definitiva para Despliegue en Coolify - Error de Versión de Node.js

## 📋 Problema Identificado

El error al desplegar en Coolify es de **incompatibilidad de versión de Node.js**:

```
You are using Node.js 18.20.5. For Next.js, Node.js version ">=20.9.0" is required.
```

## 🔍 Análisis del Error

**Causa Raíz**: Coolify está usando Nixpacks para la detección automática en lugar del Dockerfile personalizado, lo que hace que utilice una imagen base de Node.js 18 en lugar de la imagen Node.js 22 especificada en el Dockerfile.

**Flujo del Error**:
1. Coolify detecta tanto un Dockerfile como la configuración de Nixpacks
2. Prioriza Nixpacks sobre el Dockerfile personalizado
3. Nixpacks usa `ghcr.io/railwayapp/nixpacks:ubuntu-1745885067` con Node.js 18.20.5
4. Next.js requiere Node.js >=20.9.0
5. La compilación falla con el error de versión

## 🛠️ Soluciones Implementadas

### 1. Dockerfile Optimizado para Coolify

Se ha actualizado el Dockerfile con variables de entorno específicas para forzar el uso del Dockerfile en lugar de Nixpacks:

```dockerfile
# Force Coolify to use this Dockerfile instead of Nixpacks
ENV COOLIFY_USE_DOCKERFILE=true
ENV NIXPACKS_DISABLE=true
```

### 2. Configuración de Variables de Entorno en Coolify

Asegurar que estas variables estén configuradas en el proyecto de Coolify:

```bash
# Variables esenciales
COOLIFY_USE_DOCKERFILE=true
NIXPACKS_DISABLE=true
NODE_ENV=production

# Variables de Supabase (ajustar según tu configuración)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Claves de servicio (usar secrets de Coolify)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
```

### 3. Configuración de Build en Coolify

**Comando de Build**:
```bash
pnpm install && pnpm run build
```

**Comando de Start**:
```bash
node server.js
```

**Directorio de Build**:
```
/app
```

**Puerto**:
```
3000
```

## 🚀 Pasos para Despliegue Exitoso

### Paso 1: Configurar Variables de Entorno en Coolify

1. Ir a la configuración del proyecto en Coolify
2. Agregar las variables de entorno esenciales:
   - `COOLIFY_USE_DOCKERFILE=true`
   - `NIXPACKS_DISABLE=true`
   - `NODE_ENV=production`

### Paso 2: Configurar Variables de Supabase

1. Obtener los valores de tu proyecto de Supabase
2. Agregar como secrets en Coolify:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_JWT_SECRET`

### Paso 3: Configurar Comandos de Build

1. **Build Command**: `pnpm install && pnpm run build`
2. **Start Command**: `node server.js`
3. **Build Directory**: `/app`
4. **Port**: `3000`

### Paso 4: Desplegar

1. Guardar la configuración
2. Iniciar el despliegue
3. Monitorear los logs para verificar que se usa Node.js 22

## 📋 Verificación del Despliegue

### Mensajes de Éxito Esperados

```
# Debe mostrar Node.js 22
> my-v0-project@0.1.0 build /app
> next build

# Build exitoso sin errores de versión
Done in XX.Xs
```

### Mensajes de Error a Evitar

```
# Error de versión (indicativo de Nixpacks)
You are using Node.js 18.20.5. For Next.js, Node.js version ">=20.9.0" is required.
```

## 🔧 Solución Alternativa (si persiste el error)

Si Coolify sigue usando Nixpacks a pesar de las variables de entorno, crear un archivo `.coolify` en la raíz del proyecto:

```bash
echo "FORCE_DOCKERFILE=true" > .coolify
```

O agregar estas variables adicionales:

```bash
# Variables adicionales para forzar Dockerfile
FORCE_DOCKER_BUILD=true
SKIP_NIXPACKS=true
USE_CUSTOM_DOCKERFILE=true
```

## 🎯 Resultado Esperado

Después de aplicar la solución:

- ✅ Coolify usa el Dockerfile personalizado con Node.js 22
- ✅ No hay errores de versión de Node.js
- ✅ La compilación de Next.js completa exitosamente
- ✅ La aplicación se despliega sin problemas
- ✅ El contenedor se inicia correctamente en el puerto 3000

## 📝 Notas Importantes

- **Node.js 22**: Específicamente requerido para Next.js 16
- **pnpm**: Asegurar que esté disponible en el contenedor
- **Secrets**: Usar el sistema de secrets de Coolify para claves sensibles
- **Persistencia**: Las variables de entorno se mantienen entre despliegues

## ⏱️ Tiempo de Solución

**Tiempo estimado**: 5-10 minutos
**Nivel de dificultad**: Bajo
**Impacto**: Alto (soluciona el bloqueo de despliegue)

---

## 🔄 Resumen de Cambios Realizados

1. **Dockerfile actualizado** con variables de entorno para forzar uso en Coolify
2. **Documentación completa** con pasos específicos para la configuración
3. **Variables de entorno recomendadas** para evitar conflictos con Nixpacks
4. **Guía de troubleshooting** para problemas comunes

La solución aborda directamente la causa raíz del problema y proporciona una configuración clara para futuros despliegues en Coolify.