-- ====================================
-- AUDIT LOGS TABLE - OWASP Compliance
-- ====================================
-- Crea tabla de auditoría para tracking de eventos de seguridad
-- Cumple con: A09:2021 - Security Logging and Monitoring Failures

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Comentarios descriptivos
COMMENT ON TABLE audit_logs IS 'Registro de auditoría de eventos de seguridad y operaciones críticas';
COMMENT ON COLUMN audit_logs.user_id IS 'ID del usuario que realizó la acción (NULL si es sistema)';
COMMENT ON COLUMN audit_logs.action IS 'Tipo de acción realizada (CREATE, UPDATE, DELETE, LOGIN, etc.)';
COMMENT ON COLUMN audit_logs.resource IS 'Recurso afectado (users, tramites, dependencias, etc.)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID del recurso específico';
COMMENT ON COLUMN audit_logs.details IS 'Detalles adicionales en formato JSON (datos sensibles son REDACTED)';
COMMENT ON COLUMN audit_logs.ip_address IS 'Dirección IP desde donde se realizó la acción';
COMMENT ON COLUMN audit_logs.user_agent IS 'User agent del cliente';
COMMENT ON COLUMN audit_logs.timestamp IS 'Fecha y hora de la acción en UTC';

-- Índices para performance de consultas
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);

-- Índice compuesto para consultas comunes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_timestamp ON audit_logs(action, timestamp DESC);

-- Habilitar Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ====================================
-- RLS POLICIES
-- ====================================

-- Política 1: Admins pueden ver TODOS los logs
DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Política 2: Usuarios normales solo ven sus propios logs
DROP POLICY IF EXISTS "Users can view their own audit logs" ON audit_logs;
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

-- Política 3: Usuarios autenticados pueden insertar logs (para cuando hacen acciones)
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON audit_logs;
CREATE POLICY "Authenticated users can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supervisor')
    )
  );

-- Política 4: NADIE puede actualizar logs (inmutabilidad)
DROP POLICY IF EXISTS "No updates allowed" ON audit_logs;
CREATE POLICY "No updates allowed"
  ON audit_logs FOR UPDATE
  USING (false);

-- Política 5: NADIE puede eliminar logs (preservación forense)
DROP POLICY IF EXISTS "No deletes allowed" ON audit_logs;
CREATE POLICY "No deletes allowed"
  ON audit_logs FOR DELETE
  USING (false);

-- ====================================
-- GRANTS ADICIONALES
-- ====================================

-- Conceder permisos de lectura a roles autenticados (limitado por RLS)
GRANT SELECT ON audit_logs TO authenticated;
GRANT INSERT ON audit_logs TO authenticated;

-- Denegar explícitamente UPDATE y DELETE
REVOKE UPDATE ON audit_logs FROM authenticated;
REVOKE DELETE ON audit_logs FROM authenticated;

-- Service role tiene acceso completo (para mantenimiento)
GRANT ALL ON audit_logs TO service_role;

-- ====================================
-- VISTA PARA ADMINISTRADORES
-- ====================================

-- Vista simplificada para dashboard de auditoría
CREATE OR REPLACE VIEW admin_audit_view AS
SELECT 
  al.id,
  al.timestamp,
  al.action,
  al.resource,
  al.resource_id,
  al.ip_address,
  COALESCE(
    p.full_name,
    u.email,
    'System'
  ) as user_name,
  p.role as user_role,
  CASE 
    WHEN al.details->>'success' = 'false' THEN '❌ Fallido'
    WHEN al.details->>'success' = 'true' THEN '✅ Exitoso'
    ELSE 'ℹ️ Informativo'
  END as status
FROM audit_logs al
LEFT JOIN profiles p ON p.id = al.user_id
LEFT JOIN auth.users u ON u.id = al.user_id
ORDER BY al.timestamp DESC;

-- Grants para la vista
GRANT SELECT ON admin_audit_view TO authenticated;

-- ====================================
-- FUNCIÓN PARA LIMPIEZA AUTOMÁTICA (OPCIONAL)
-- ====================================

-- Función para archivar logs antiguos (más de 90 días)
-- Se puede llamar desde un cron job o schedule
CREATE OR REPLACE FUNCTION archive_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- En una implementación real, aquí se moverían a una tabla de archivo
  -- Por ahora, solo retornamos el conteo de logs antiguos
  SELECT COUNT(*) INTO archived_count
  FROM audit_logs
  WHERE timestamp < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- TRIGGER PARA LOGS AUTOMÁTICOS (OPCIONAL)
-- ====================================

-- Ejemplo: Log automático de cambios en tablas críticas
-- Se puede extender a otras tablas según necesidad

-- ====================================
-- INSERCIÓN DE PRUEBA (VERIFICACIÓN)
-- ====================================

-- Insertar un log de prueba para verificar que funciona
INSERT INTO audit_logs (action, resource, details, ip_address, user_agent)
VALUES (
  'SYSTEM_INIT',
  'audit_system',
  '{"message": "Sistema de auditoría inicializado correctamente", "version": "1.0.0"}',
  '127.0.0.1'::INET,
  'PostgreSQL'
);

-- Verificar inserción
SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 1;

-- ====================================
-- ESTADÍSTICAS RÁPIDAS
-- ====================================

-- Vista de estadísticas de auditoría
CREATE OR REPLACE VIEW audit_stats_view AS
SELECT 
  DATE(timestamp) as log_date,
  action,
  resource,
  COUNT(*) as total_events,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT ip_address) as unique_ips
FROM audit_logs
GROUP BY DATE(timestamp), action, resource
ORDER BY log_date DESC, total_events DESC;

GRANT SELECT ON audit_stats_view TO authenticated;

-- ====================================
-- COMENTARIOS FINALES
-- ====================================

/*
NOTAS DE IMPLEMENTACIÓN:

1. Esta tabla cumple con requisitos de:
   - OWASP A09:2021 (Security Logging and Monitoring)
   - Trazabilidad de operaciones críticas
   - Prevención de repudio (non-repudiation)

2. Los logs son INMUTABLES:
   - No se pueden actualizar
   - No se pueden eliminar (excepto por service_role)
   - Timestamp en UTC para consistencia

3. Datos sensibles:
   - La aplicación debe REDACTAR passwords, tokens, etc.
   - Ver lib/audit-logger.ts para sanitización

4. Retención recomendada:
   - Logs en línea: 90 días
   - Archivo histórico: 1-7 años (según normativa)

5. Monitoreo proactivo:
   - Revisar logs fallidos diariamente
   - Alertas por múltiples intentos fallidos
   - Análisis de patrones sospechosos

6. Performance:
   - Índices optimizados para consultas por fecha
   - Particionar por mes si crece mucho
   - Archive jobs mensuales recomendados
*/
