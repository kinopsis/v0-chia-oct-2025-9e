# 🔧 Solución para Error de Despliegue en Coolify

## 📋 Problema Identificado

El error al desplegar en Coolify es de autenticación Git:

```
fatal: could not read Username for 'https://github.com': No such device or address
```

## 🔍 Análisis del Error

**Causa Raíz**: Coolify intenta clonar el repositorio usando HTTPS sin credenciales, pero el repositorio está configurado como privado.

**Flujo del Error**:
1. Coolify usa `git ls-remote https://github.com/kinopsis/v0-chia-oct-2025-9e`
2. GitHub requiere autenticación para repositorios privados
3. No hay credenciales disponibles en el contenedor helper
4. La operación falla con "No such device or address"

## 🛠️ Soluciones Recomendadas

### Opción 1: Usar SSH con Clave Privada (Recomendada)

1. **Generar par de claves SSH**:
   ```bash
   ssh-keygen -t ed25519 -C "coolify@deployment.com"
   ```

2. **Agregar clave pública al repositorio**:
   - Ir a Settings > Deploy Keys en GitHub
   - Añadir la clave pública con permisos de lectura

3. **Configurar Coolify con clave privada**:
   - En la configuración del proyecto, agregar la clave privada SSH
   - Cambiar URL del repositorio a: `git@github.com:kinopsis/v0-chia-oct-2025-9e.git`

### Opción 2: Usar Token de Acceso Personal

1. **Crear PAT (Personal Access Token)** en GitHub:
   - Settings > Developer settings > Personal access tokens
   - Permisos: `repo`, `read:packages`

2. **Modificar URL del repositorio**:
   ```
   https://<TOKEN>@github.com/kinopsis/v0-chia-oct-2025-9e.git
   ```

### Opción 3: Hacer Repositorio Público Temporalmente

Para pruebas rápidas:
- Cambiar configuración del repositorio a público
- Desplegar
- Volver a privado después del despliegue

## 📋 Configuración Adicional para Coolify

### Variables de Entorno Necesarias

Asegurar que estas variables estén configuradas en Coolify:

```bash
# Variables de entorno para producción
NEXT_PUBLIC_SUPABASE_URL=https://mhzgppyjznotjopafpdw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oemdwcHlqem5vdGpvcGFmcGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjk4NTIsImV4cCI6MjA3NjkwNTg1Mn0.e4_5x64VbRja885E6gkBJ8fW3g94rIW2vbKgi2JIjEE
NODE_ENV=production
```

### Configuración de Build

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

## 🔧 Verificación de Configuración

### 1. Verificar Acceso al Repositorio
```bash
# Desde cualquier máquina con Git
git ls-remote https://github.com/kinopsis/v0-chia-oct-2025-9e refs/heads/main
```

### 2. Probar Clonación
```bash
# Con SSH (recomendado)
git clone git@github.com:kinopsis/v0-chia-oct-2025-9e.git

# Con HTTPS + Token
git clone https://<TOKEN>@github.com/kinopsis/v0-chia-oct-2025-9e.git
```

## 🚀 Pasos para Solución Inmediata

1. **Generar SSH Key**:
   ```bash
   ssh-keygen -t ed25519 -f coolify_key -C "coolify@deployment.com"
   ```

2. **Agregar al GitHub**:
   - Copiar contenido de `coolify_key.pub`
   - Agregar como Deploy Key en GitHub

3. **Configurar en Coolify**:
   - URL: `git@github.com:kinopsis/v0-chia-oct-2025-9e.git`
   - Private Key: Contenido de `coolify_key`

4. **Reintentar Despliegue**

## 📝 Notas Importantes

- **Seguridad**: Usar SSH es más seguro que tokens en URLs
- **Permisos**: Solo necesitas lectura para despliegue
- **Persistencia**: Las claves SSH persisten entre despliegues
- **Auditoría**: Los tokens pueden revocarse fácilmente

## 🎯 Resultado Esperado

Después de aplicar la solución:
- ✅ Coolify puede clonar el repositorio exitosamente
- ✅ No hay errores de autenticación
- ✅ El contenedor se construye correctamente
- ✅ La aplicación se despliega sin problemas

---

**Tiempo estimado de solución**: 5-10 minutos
**Nivel de dificultad**: Bajo
**Impacto**: Alto (soluciona el bloqueo de despliegue)