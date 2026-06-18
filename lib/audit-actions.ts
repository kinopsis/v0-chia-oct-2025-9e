/**
 * Tipos de acciones para auditoría
 * NOTA: Este archivo NO tiene "use server" porque solo exporta constantes.
 * Next.js 16 solo permite async functions en archivos con "use server".
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

export type AuditAction = typeof AuditActions[keyof typeof AuditActions]