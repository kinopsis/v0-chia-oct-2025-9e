# Guía de Configuración del Servidor de Desarrollo

## Paso 1: Configurar Variables de Entorno

Actualiza el archivo `.env.local` con tus credenciales reales de Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=tu_url_real_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_real_aqui
SUPABASE_JWT_SECRET=tu_jwt_secret_opcional
NODE_ENV=development
```

### ¿Cómo obtener las credenciales de Supabase?

1. Ve a tu panel de control de Supabase
2. Navega a **Settings** > **API**
3. Copia la **URL** y la **anon public key**
4. Pégales en el archivo `.env.local`

## Paso 2: Configurar la Base de Datos

Ejecuta los siguientes scripts SQL en tu base de datos de Supabase (en orden):

```sql
-- Tablas principales
1. 01-create-profiles-table.sql
2. 02-create-tramites-table.sql  
3. 03-create-audit-logs-table.sql
4. 04-create-n8n-config-table.sql

-- Datos iniciales
5. 05-seed-admin-user.sql
6. 07-seed-n8n-config.sql
```

### Opciones para ejecutar los scripts:

**Opción A: Supabase SQL Editor**
1. Ve a tu proyecto de Supabase
2. Navega a **SQL** > **SQL Editor**
3. Copia y pega cada script
4. Ejecuta uno por uno

**Opción B: CLI de PostgreSQL**
```bash
psql -h tu-host.supabase.co -d postgres -U tu-usuario -f scripts/01-create-profiles-table.sql
```

## Paso 3: Verificar la Configuración

Ejecuta el script de verificación:

```bash
npm run db:setup
```

Este script verificará:
- Conexión a Supabase
- Disponibilidad de las tablas necesarias

## Paso 4: Iniciar el Servidor de Desarrollo

```bash
# Opción básica
npm run dev

# Opción con verificación de base de datos
npm run dev:setup
```

El servidor se iniciará en `http://localhost:3000`

## Paso 5: Verificar Funcionalidades

Una vez iniciado el servidor, verifica:

1. **Página principal**: `http://localhost:3000`
2. **Panel de administración**: `http://localhost:3000/admin` (requiere login)
3. **API de trámites**: `http://localhost:3000/api/tramites`
4. **Configuración de chat**: `http://localhost:3000/api/chat/config`

## Solución de Problemas Comunes

### Error: "Cannot read environment variable"
- Asegúrate de que `.env.local` esté en la raíz del proyecto
- Verifica que las variables tengan los nombres correctos
- Reinicia el servidor después de modificar el archivo

### Error: "Connection to database failed"
- Verifica las credenciales de Supabase
- Asegúrate de que las tablas estén creadas
- Revisa el firewall de Supabase

### Error: "Module not found"
- Ejecuta `npm install` nuevamente
- Verifica que `node_modules` exista

## Scripts Útiles

```bash
npm run dev              # Iniciar servidor de desarrollo
npm run build           # Construir para producción
npm run start           # Iniciar servidor de producción
npm run lint            # Verificar código
npm run db:setup        # Verificar conexión a base de datos