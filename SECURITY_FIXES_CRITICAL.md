# 🔧 Guía de Corrección de Vulnerabilidades Críticas
**Prioridad:** ALTA | **Tiempo estimado:** 2-4 horas

---

## 1️⃣ Rotación de Credenciales de Supabase (URGENTE - 15 min)

### Pasos:

1. **Ir a Supabase Dashboard:**
   - https://app.supabase.com/project/mhzgppyjznotjopafpdw/settings/api

2. **Rotar Service Role Key:**
   - Click en "Regenerate" en SERVICE_ROLE_KEY
   - Copiar nueva clave

3. **Rotar Anon/Public Key:**
   - Click en "Regenerate" en API KEYS → anon/public
   - Copiar nueva clave

4. **Actualizar .env.local:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://mhzgppyjznotjopafpdw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=nueva_clave_aqui
SUPABASE_SERVICE_ROLE_KEY=nueva_clave_service_role_aqui
SUPABASE_JWT_SECRET=generar_nuevo_secreto
```

5. **Reiniciar aplicación:**
```bash
# Detener servidor actual
# Ctrl + C

# Reiniciar
npm run dev
```

6. **Verificar que funciona:**
```bash
curl http://localhost:3000/api/health
```

---

## 2️⃣ Validación Robusta de Contraseñas (30 min)

### Archivo: `lib/auth.ts`

```typescript
// Añadir al final del archivo

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 12) {
    errors.push("La contraseña debe tener al menos 12 caracteres")
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Debe incluir al menos una mayúscula")
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Debe incluir al menos una minúscula")
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Debe incluir al menos un número")
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Debe incluir al menos un carácter especial")
  }
  
  // Check common passwords
  const commonPasswords = [
    'password', '123456', 'qwerty', 'admin123', 
    'chia123', 'alcalde', 'colombia'
  ]
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Contraseña demasiado común, elija una más segura")
  }
  
  return { valid: errors.length === 0, errors }
}
```

### Archivo: `app/api/admin/users/route.ts`

```typescript
// Importar la función de validación
import { validatePassword } from "@/lib/auth"

// Dentro de POST, después de obtener el body (línea 22)
const validation = validatePassword(password)
if (!validation.valid) {
  return NextResponse.json({ 
    error: "Contraseña débil",
    details: validation.errors 
  }, { status: 400 })
}
```

---

## 3️⃣ Sanitización de CSV contra Injection (45 min)

### Archivo: `app/api/admin/dependencias/importar/route.ts`

```typescript
// Añadir esta función al inicio del archivo, después de los imports

/**
 * Sanitiza campos CSV para prevenir CSV Injection y XSS
 */
function sanitizeCSVField(field: string): string {
  if (!field) return ''
  
  let sanitized = field.trim()
  
  // Remover fórmulas peligrosas de Excel (=CMD, +CMD, @CMD, -CMD)
  sanitized = sanitized.replace(/^[=+\-@]/g, '_')
  
  // Escapar caracteres HTML especiales para prevenir XSS
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
  
  return sanitized
}

// Reemplazar la línea 78 (dentro del loop for)
// ANTES:
// const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));

// DESPUÉS:
const values = line.split(',').map(v => sanitizeCSVField(v.replace(/^"|"$/g, '')))

// También sanitizar antes de insertar (líneas 158-165)
dependenciasToInsert.push({
  codigo: sanitizeCSVField(codigo),
  sigla: sigla ? sanitizeCSVField(sigla) : null,
  nombre: sanitizeCSVField(nombre),
  tipo,
  dependencia_padre_id: dependenciaPadreId,
  orden: 0,
})
```

---

## 4️⃣ Rate Limiting en Backend (1 hora)

### Instalar dependencias:
```bash
npm install @upstash/ratelimit @upstash/redis
```

### Crear archivo: `lib/rate-limit.ts`

```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Inicializar Redis (usar variables de entorno)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Rate limits configurables
export const rateLimits = {
  // General API: 10 requests por minuto
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "ratelimit:api",
  }),
  
  // Login: 5 requests por minuto
  login: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
    prefix: "ratelimit:login",
  }),
  
  // Creación de usuarios: 3 por minuto
  createUser: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 m"),
    analytics: true,
    prefix: "ratelimit:createUser",
  }),
  
  // Exportaciones: 2 por minuto
  export: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(2, "1 m"),
    analytics: true,
    prefix: "ratelimit:export",
  }),
}

// Helper para obtener IP del cliente
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded 
    ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0])
    : "unknown"
  return ip.trim()
}
```

### Aplicar en rutas críticas:

#### Archivo: `app/api/admin/users/route.ts`

```typescript
// Añadir import al inicio
import { rateLimits, getClientIP } from "@/lib/rate-limit"

// Al inicio de POST (después del try)
export async function POST(request: Request) {
  try {
    const ip = getClientIP(request)
    
    // Check rate limit
    const { success, limit, reset, remaining } = await rateLimits.createUser.limit(ip)
    
    if (!success) {
      return NextResponse.json(
        { 
          error: "Demasiadas solicitudes",
          message: "Ha excedido el límite de creación de usuarios. Intente más tarde.",
          remaining,
          reset: new Date(reset).toISOString()
        }, 
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": new Date(reset).toISOString(),
          }
        }
      )
    }
    
    // ... resto del código existente
```

#### Archivo: `app/(public)/auth/login/page.tsx` (client-side)

```typescript
// Añadir estado para controlar intentos
const [attemptCount, setAttemptCount] = useState(0)
const [isLocked, setIsLocked] = useState(false)
const [lockTimer, setLockTimer] = useState(0)

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (isLocked) {
    setError(`Demasiados intentos. Espere ${lockTimer} segundos`)
    return
  }
  
  setError(null)
  setLoading(true)

  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    
    // Reset counter on success
    setAttemptCount(0)
    setIsLocked(false)

    router.push("/admin")
    router.refresh()
  } catch (err: any) {
    const newCount = attemptCount + 1
    setAttemptCount(newCount)
    
    if (newCount >= 5) {
      setIsLocked(true)
      const waitTime = 300 // 5 minutos
      setLockTimer(waitTime)
      
      // Countdown timer
      const interval = setInterval(() => {
        setLockTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            setIsLocked(false)
            setAttemptCount(0)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      setError("Demasiados intentos fallidos. Cuenta bloqueada por 5 minutos.")
    } else {
      setError(`Credenciales inválidas. Intento ${newCount} de 5`)
    }
  } finally {
    setLoading(false)
  }
}
```

---

## 5️⃣ Audit Logging Centralizado (45 min)

### Crear tabla en Supabase (SQL Editor):

```sql
-- Tabla de auditoría
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);

-- RLS Policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver todos los logs
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Usuarios normales solo ven sus propios logs
CREATE POLICY "Users can view their own audit logs"
  ON audit_logs FOR SELECT
  USING (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Inserts permitidos para todos autenticados
CREATE POLICY "Authenticated users can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Nadie puede actualizar o eliminar logs
CREATE POLICY "No updates allowed"
  ON audit_logs FOR UPDATE
  USING (false);

CREATE POLICY "No deletes allowed"
  ON audit_logs FOR DELETE
  USING (false);
```

### Crear utility: `lib/audit-logger.ts`

```typescript
"use server"

import { createClient } from "@/lib/supabase/server"

export interface AuditLogData {
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export async function logAudit(data: AuditLogData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Filtrar datos sensibles
  const sanitizedDetails = sanitizeForLogging(data.details || {})
  
  const { error } = await supabase.from("audit_logs").insert({
    user_id: user?.id || null,
    action: data.action,
    resource: data.resource,
    resource_id: data.resourceId,
    details: sanitizedDetails,
    ip_address: data.ipAddress,
    user_agent: data.userAgent,
    timestamp: new Date().toISOString()
  })
  
  if (error) {
    console.error("Failed to write audit log:", error)
  }
}

/**
 * Elimina información sensible antes de loguear
 */
function sanitizeForLogging(data: Record<string, any>): Record<string, any> {
  const sensitiveFields = [
    'password', 'secret', 'token', 'api_key', 'apikey',
    'credit_card', 'ssn', 'bank_account', 'pin'
  ]
  
  const sanitized = { ...data }
  
  for (const [key, value] of Object.entries(sanitized)) {
    if (sensitiveFields.some(f => key.toLowerCase().includes(f))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForLogging(value)
    }
  }
  
  return sanitized
}

/**
 * Helper para obtener IP del request
 */
export function extractIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  return "unknown"
}

/**
 * Wrapper para acciones críticas con logging automático
 */
export async function withAudit<T>(
  action: string,
  resource: string,
  resourceId: string,
  fn: () => Promise<T>,
  request: Request
): Promise<T> {
  const ip = extractIP(request)
  const userAgent = request.headers.get("user-agent") || "unknown"
  
  try {
    const result = await fn()
    
    await logAudit({
      action,
      resource,
      resourceId,
      details: { success: true },
      ipAddress: ip,
      userAgent
    })
    
    return result
  } catch (error: any) {
    await logAudit({
      action,
      resource,
      resourceId,
      details: { 
        success: false, 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      ipAddress: ip,
      userAgent
    })
    
    throw error
  }
}
```

### Aplicar en endpoints críticos:

#### Archivo: `app/api/admin/tramites/[id]/route.ts` (DELETE)

```typescript
// Importar
import { withAudit, logAudit, extractIP } from "@/lib/audit-logger"

// Reemplazar DELETE function
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin()
  const ip = extractIP(request)
  const userAgent = request.headers.get("user-agent") || "unknown"
  const tramiteId = (await params).id
  
  try {
    const supabase = await createClient()
    
    // Obtener información del trámite antes de eliminar
    const { data: tramite } = await supabase
      .from("tramites")
      .select("nombre_tramite")
      .eq("id", tramiteId)
      .single()
    
    const { error } = await supabase.from("tramites").delete().eq("id", tramiteId)

    if (error) throw error
    
    // Log exitoso
    await logAudit({
      action: "DELETE",
      resource: "tramites",
      resourceId: tramiteId,
      details: { 
        tramiteName: tramite?.nombre_tramite,
        reason: "User requested deletion"
      },
      ipAddress: ip,
      userAgent
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    // Log fallo
    await logAudit({
      action: "DELETE_FAILED",
      resource: "tramites",
      resourceId: tramiteId,
      details: { 
        error: error.message,
        userId: user.id
      },
      ipAddress: ip,
      userAgent
    })
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

---

## 6️⃣ Validación de Origen en OAuth Callback (15 min)

### Archivo: `app/(public)/auth/callback/route.ts`

```typescript
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  
  // VALIDACIÓN DE ORIGEN - CRÍTICO
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'https://chia.gov.co',
    'https://www.chia.gov.co',
    'https://tramites.chia.gov.co'
  ]
  
  if (!allowedOrigins.includes(requestUrl.origin)) {
    console.error("🚨 Invalid origin attempt:", requestUrl.origin)
    
    // Redirigir a login sin procesar callback
    return NextResponse.redirect(
      new URL('/auth/login?error=invalid_origin', requestUrl.origin)
    )
  }
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error("Error exchanging code:", error)
      return NextResponse.redirect(
        new URL('/auth/login?error=auth_failed', requestUrl.origin)
      )
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}/admin`)
}
```

---

## ✅ Verificación Post-Corrección

### Tests rápidos:

```bash
# 1. Test rate limiting
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/admin/users \
    -H "Content-Type: application/json" \
    -d '{"email":"test'$i'@test.com","password":"Weak123","role":"user"}'
done

# Debería retornar 429 después del intento 10

# 2. Test validación de contraseña
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"weak","role":"admin"}'

# Debería rechazar con mensaje de contraseña débil

# 3. Test CSV injection
echo '=CMD|"/C calc"!A0,CODE,SIGLA,NOMBRE,TIPO' > test.csv
# Subir CSV y verificar que la fórmula es sanitizada
```

---

## 📊 Métricas de Éxito

- ✅ 0 credenciales expuestas
- ✅ 100% de contraseñas cumplen política de seguridad
- ✅ 0 intentos de CSV injection exitosos
- ✅ Rate limiting activo en todas las rutas críticas
- ✅ 100% de acciones críticas logged en audit_logs
- ✅ 0 redirecciones OAuth maliciosas

---

**Próximos pasos:** Continuar con vulnerabilidades HIGH y MEDIUM del reporte principal.
