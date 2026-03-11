import { createClient } from "@/lib/supabase/server"

// NOTA: "use server" removido - este archivo exporta tanto utilidades como constantes
// Las funciones logAudit y withAudit deben llamarse desde contextos "use server"

export interface AuditLogData {
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

/**
 * Registra un evento de auditoría en la base de datos
 * OWASP: A09:2021 - Security Logging and Monitoring Failures
 */
export async function logAudit(data: AuditLogData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Filtrar datos sensibles antes de loguear
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
    console.error("🔒 Failed to write audit log:", error)
  }
}

/**
 * Elimina información sensible antes de loguear
 * Previene exposición de credenciales en logs
 */
function sanitizeForLogging(data: Record<string, any>): Record<string, any> {
  const sensitiveFields = [
    'password', 'secret', 'token', 'api_key', 'apikey',
    'credit_card', 'ssn', 'bank_account', 'pin', 'jwt'
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
export async function extractIP(request: Request): Promise<string> {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  return "unknown"
}

/**
 * Wrapper para acciones críticas con logging automático
 * Usa try-catch internally y loguea tanto éxitos como fallos
 */
export async function withAudit<T>(
  action: string,
  resource: string,
  resourceId: string,
  fn: () => Promise<T>,
  request: Request
): Promise<T> {
  const ip = await extractIP(request)
  const userAgent = request.headers.get("user-agent") || "unknown"
  
  try {
    const result = await fn()
    
    // Log exito
    await logAudit({
      action,
      resource,
      resourceId,
      details: { 
        success: true,
        timestamp: new Date().toISOString()
      },
      ipAddress: ip,
      userAgent
    })
    
    return result
  } catch (error: any) {
    // Log fallo
    await logAudit({
      action: `${action}_FAILED`,
      resource,
      resourceId,
      details: { 
        success: false, 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        timestamp: new Date().toISOString()
      },
      ipAddress: ip,
      userAgent
    })
    
    throw error
  }
}

/**
 * Tipos de acciones para auditoría
 */
export const AuditActions = {
  // Usuarios
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  
  // Trámites
  TRAMITE_CREATE: 'TRAMITE_CREATE',
  TRAMITE_UPDATE: 'TRAMITE_UPDATE',
  TRAMITE_DELETE: 'TRAMITE_DELETE',
  
  // Dependencias
  DEPENDENCIA_CREATE: 'DEPENDENCIA_CREATE',
  DEPENDENCIA_UPDATE: 'DEPENDENCIA_UPDATE',
  DEPENDENCIA_DELETE: 'DEPENDENCIA_DELETE',
  DEPENDENCIA_IMPORT: 'DEPENDENCIA_IMPORT',
  DEPENDENCIA_EXPORT: 'DEPENDENCIA_EXPORT',
  
  // Configuración
  CONFIG_UPDATE: 'CONFIG_UPDATE',
  
  // Seguridad
  LOGIN_FAILED: 'LOGIN_FAILED',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const
