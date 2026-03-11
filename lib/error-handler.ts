/**
 * Error Handler Utility - OWASP A05:2021 Security Misconfiguration
 * 
 * Previene exposición de información sensible en errores
 * mientras mantiene debugging para desarrollo
 */

export interface SafeError {
  message: string
  code: string
  status?: number
  details?: Record<string, any>
}

/**
 * Sanitiza errores para no exponer información interna
 */
export function sanitizeError(error: any, isProduction: boolean): SafeError {
  // En producción, errores genéricos
  if (isProduction) {
    console.error("🔒 Internal error:", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    })
    
    return {
      message: "Ocurrió un error procesando su solicitud",
      code: "INTERNAL_ERROR",
      status: 500
    }
  }
  
  // En desarrollo, mostrar más detalles pero filtrar sensitive data
  const safeError: SafeError = {
    message: error?.message || "Unknown error",
    code: error?.code || "UNKNOWN_ERROR",
    status: error?.status || 500
  }
  
  // Filtrar información sensible del stack trace
  if (error?.stack) {
    const filteredStack = error.stack
      .split('\n')
      .filter((line: string) => {
        // Remover líneas que contengan paths o variables de entorno
        return !line.includes('.env') && 
               !line.includes('SECRET') && 
               !line.includes('password') &&
               !line.includes('token') &&
               !line.includes('api_key')
      })
      .join('\n')
    
    safeError.details = {
      stack: filteredStack,
      timestamp: new Date().toISOString()
    }
  }
  
  return safeError
}

/**
 * Crea una respuesta de error segura para APIs
 */
export function createSafeErrorResponse(
  error: any, 
  options: {
    production?: boolean
    customMessages?: Record<string, string>
    logError?: boolean
  } = {}
) {
  const { 
    production = process.env.NODE_ENV === 'production',
    customMessages = {},
    logError = true 
  } = options
  
  // Log interno (nunca expone al cliente)
  if (logError) {
    console.error("🔒 API Error:", {
      originalError: error?.message,
      code: error?.code,
      type: error?.constructor?.name,
      timestamp: new Date().toISOString()
    })
  }
  
  // Mapear códigos de error a mensajes amigables
  const errorMappings: Record<string, string> = {
    // Errores de autenticación
    'PGRST301': 'No autorizado. Por favor inicie sesión nuevamente',
    '401': 'No autorizado. Verifique sus credenciales',
    
    // Errores de autorización
    'PGRST401': 'Acceso denegado. No tiene permisos para esta acción',
    '403': 'Acceso denegado. No tiene permisos para esta acción',
    
    // Errores de base de datos
    '23505': 'Este registro ya existe',
    '23503': 'Referencia inválida. Verifique los datos relacionados',
    '23506': 'Operación no permitida. Existen registros dependientes',
    
    // Errores de validación
    '23502': 'Faltan campos requeridos',
    
    // Errores comunes
    'ECONNREFUSED': 'Servicio no disponible. Intente más tarde',
    'ETIMEDOUT': 'La solicitud tardó demasiado. Intente nuevamente',
    'ENOENT': 'Recurso no encontrado'
  }
  
  // Obtener código del error
  const errorCode = error?.code || error?.status?.toString() || 'UNKNOWN_ERROR'
  
  // Mensaje personalizado si existe
  if (customMessages[errorCode]) {
    return {
      error: customMessages[errorCode],
      code: errorCode,
      status: getHttpStatusFromCode(errorCode)
    }
  }
  
  // Mensaje mapeado si existe
  if (errorMappings[errorCode]) {
    return {
      error: errorMappings[errorCode],
      code: errorCode,
      status: getHttpStatusFromCode(errorCode)
    }
  }
  
  // Error por defecto
  return {
    error: production 
      ? 'Ocurrió un error interno. Por favor contacte soporte si el problema persiste' 
      : error?.message || 'Error interno del servidor',
    code: errorCode,
    status: getHttpStatusFromCode(errorCode)
  }
}

/**
 * Helper para obtener HTTP status code desde error codes
 */
function getHttpStatusFromCode(code: string): number {
  const httpStatusMap: Record<string, number> = {
    'PGRST301': 401,
    '401': 401,
    'PGRST401': 403,
    '403': 403,
    '23505': 409,
    '23503': 400,
    '23506': 400,
    '23502': 400,
    'ECONNREFUSED': 503,
    'ETIMEDOUT': 408,
    'ENOENT': 404,
    'UNKNOWN_ERROR': 500
  }
  
  return httpStatusMap[code] || 500
}

/**
 * Wrapper seguro para operaciones que pueden fallar
 */
export async function safeExecute<T>(
  operation: () => Promise<T>,
  context: string = 'Operation'
): Promise<{ success: boolean; data?: T; error?: SafeError }> {
  try {
    const data = await operation()
    return { success: true, data }
  } catch (error: any) {
    console.error(`🔒 ${context} failed:`, {
      message: error?.message,
      code: error?.code,
      timestamp: new Date().toISOString()
    })
    
    return {
      success: false,
      error: sanitizeError(error, process.env.NODE_ENV === 'production')
    }
  }
}

/**
 * Tipos de errores comunes para manejo específico
 */
export const ErrorTypes = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  CONFLICT: 'CONFLICT_ERROR',
  DATABASE: 'DATABASE_ERROR',
  NETWORK: 'NETWORK_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
} as const
