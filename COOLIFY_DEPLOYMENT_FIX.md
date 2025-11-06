# 🔧 Solución Definitiva - Error de Versión de Node.js en Coolify

## 📋 Problema Identificado

El despliegue falla con el siguiente error:

```
You are using Node.js 18.20.5. For Next.js, Node.js version ">=20.9.0" is required.
```

**Causa Raíz**: Coolify está usando Nixpacks en lugar del Dockerfile personalizado, lo que hace que utilice una imagen base de Node.js 18 en lugar de la imagen Node.js 22 especificada en el Dockerfile.

## 🛠️ Soluciones Implementadas

### 1. Archivo `.coolify` para Forzar Uso de Dockerfile

Se ha creado un archivo `.coolify` en la raíz del proyecto con configuraciones específicas para forzar el uso del Dockerfile:

```bash
# Coolify Configuration File
# Force Dockerfile usage over Nixpacks to ensure Node.js 22 compatibility

# Force Dockerfile build
FORCE_DOCKERFILE=true
USE_CUSTOM_DOCKERFILE=true

# Disable Nixpacks
SKIP_NIXPACKS=true
NIXPACKS_DISABLE=true

# Build configuration
BUILD_COMMAND=pnpm install && pnpm run build
START_COMMAND=node server.js
BUILD_DIRECTORY=/app
PORT=3000

# Environment configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Coolify-specific optimizations
COOLIFY_USE_DOCKERFILE=true
COOLIFY_SKIP_NIXPACKS=true
```

### 2. Dockerfile Optimizado para Coolify

El Dockerfile ha sido actualizado con:

- **Node.js 22 Alpine**: `FROM node:22-alpine AS base`
- **Variables de entorno específicas**: `COOLIFY_USE_DOCKERFILE=true`, `NIXPACKS_DISABLE=true`
- **Modo standalone de Next.js**: `NEXT_PRIVATE_STANDALONE=true`
- **Server.js para modo standalone**: Archivo generado automáticamente para ejecución en producción

### 3. Script de Validación

Se ha creado un script de validación en `scripts/deploy-coolify.mjs` que verifica:

- Existencia del archivo `.coolify`
- Uso correcto de Node.js 22 en el Dockerfile
- Presencia de variables de entorno necesarias
- Configuración de modo standalone

## 🚀 Pasos para Despliegue Exitoso

### Paso 1: Configurar Variables de Entorno en Coolify

Antes de desplegar, asegúrate de configurar estas variables en la sección de Environment Variables de tu proyecto en Coolify:

```bash
# Variables esenciales para forzar Dockerfile
COOLIFY_USE_DOCKERFILE=true
NIXPACKS_DISABLE=true
FORCE_DOCKERFILE=true
NODE_ENV=production

# Variables de Supabase (ajustar según tu configuración)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Variables de sitio
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
NEXT_PUBLIC_SITE_NAME="Tu Nombre de Sitio"
NEXT_PUBLIC_SITE_DESCRIPTION="Tu descripción de sitio"
```

**Importante**: Las claves de Supabase deben configurarse como "Secrets" en Coolify para mayor seguridad.

### Paso 2: Configurar Comandos de Build en Coolify

En la configuración de tu aplicación en Coolify, establece:

**Build Command:**
```bash
pnpm install && pnpm run build
```

**Start Command:**
```bash
node server.js
```

**Build Directory:**
```bash
/app
```

**Port:**
```bash
3000
```

### Paso 3: Verificar Configuración del Proyecto

Asegúrate de que estos archivos estén presentes en tu repositorio:

1. **Dockerfile** - Con la configuración de Node.js 22
2. **.coolify** - Archivo de configuración para Coolify
3. **package.json** - Con Next.js 16 y dependencias actualizadas
4. **next.config.mjs** - Con configuración de output standalone

### Paso 4: Desplegar

1. Guarda la configuración en Coolify
2. Inicia el despliegue
3. Monitorea los logs para verificar que se use Node.js 22

## 📋 Verificación del Despliegue

### Mensajes de Éxito Esperados

```
# Debe mostrar Node.js 22
> my-v0-project@0.1.0 build /app
> next build

# pnpm debe estar disponible en todos los stages
> pnpm run build

# Build exitoso sin errores de versión
Done in XX.Xs

# Inicio del servidor
> Ready on http://localhost:3000
```

### Mensajes de Error a Evitar

```
# Error de versión (indicativo de Nixpacks)
You are using Node.js 18.20.5. For Next.js, Node.js version ">=20.9.0" is required.

# Error de pnpm no encontrado (stage incorrecto)
/bin/sh: pnpm: not found
exit code: 127

# Error de server.js no encontrado
Error: Cannot find module '/app/server.js'
```

## 🔧 Solución Alternativa (si persiste el error)

Si después de aplicar estas soluciones el error persiste, prueba estos pasos adicionales:

### Opción 1: Eliminar posibles archivos de Nixpacks

Verifica que no existan archivos que puedan interferir con Nixpacks:

```bash
# Verifica y elimina si existen
rm -rf .nixpacks/
rm -f .nixpacks.toml
rm -f nixpacks.toml
```

### Opción 2: Forzar en el Dockerfile

Agrega estas líneas al inicio del Dockerfile:

```dockerfile
# Force Coolify to use this Dockerfile
ARG COOLIFY_USE_DOCKERFILE=true
ARG NIXPACKS_DISABLE=true
ENV COOLIFY_USE_DOCKERFILE=true
ENV NIXPACKS_DISABLE=true
```

### Opción 3: Configuración adicional en Coolify

Agrega estas variables de entorno adicionales:

```bash
# Variables adicionales para forzar Dockerfile
SKIP_NIXPACKS=true
USE_CUSTOM_DOCKERFILE=true
COOLIFY_SKIP_NIXPACKS=true
FORCE_DOCKER_BUILD=true
```

## 🎯 Resultado Esperado

Después de aplicar la solución:

- ✅ Coolify usa el Dockerfile personalizado con Node.js 22
- ✅ No hay errores de versión de Node.js
- ✅ La compilación de Next.js completa exitosamente
- ✅ La aplicación se despliega sin problemas
- ✅ El contenedor se inicia correctamente en el puerto 3000
- ✅ El modo standalone de Next.js funciona correctamente

## 📝 Notas Importantes

1. **Node.js 22**: Específicamente requerido para Next.js 16
2. **pnpm**: Asegurar que esté disponible en el contenedor
3. **Secrets**: Usar el sistema de secrets de Coolify para claves sensibles
4. **Persistencia**: Las variables de entorno se mantienen entre despliegues
5. **Modo Standalone**: Next.js 16 en modo standalone requiere un server.js personalizado

## ⏱️ Tiempo de Solución

**Tiempo estimado**: 5-10 minutos
**Nivel de dificultad**: Bajo
**Impacto**: Alto (soluciona el bloqueo de despliegue)

## 🔄 Resumen de Cambios Realizados

1. **Archivo `.coolify`** - Fuerza el uso de Dockerfile sobre Nixpacks
2. **Dockerfile actualizado** - Con variables de entorno para Coolify
3. **Script de validación** - Verifica la configuración antes del despliegue
4. **Documentación completa** - Con pasos específicos para la configuración

La solución aborda directamente la causa raíz del problema y proporciona una configuración clara para futuros despliegues en Coolify.