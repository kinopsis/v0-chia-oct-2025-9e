-- Script para limpiar valores inconsistentes en el campo requiere_pago
-- Este script debe ejecutarse con precaución en producción

-- Paso 1: Verificar valores actuales antes de la limpieza
SELECT 'VALORES ACTUALES EN REQUIERE_PAGO' as info;
SELECT DISTINCT requiere_pago, COUNT(*) as count
FROM tramites
WHERE is_active = true
GROUP BY requiere_pago
ORDER BY count DESC;

-- Paso 2: Verificar qué registros tendrán cambios
SELECT 'REGISTROS QUE SERÁN MODIFICADOS' as info;
SELECT id, nombre_tramite, requiere_pago
FROM tramites 
WHERE is_active = true 
  AND requiere_pago NOT IN ('Sí', 'No', '', NULL)
ORDER BY requiere_pago;

-- Paso 3: Actualizar valores inconsistentes a NULL (recomendado)
-- Comenta esta sección si prefieres un enfoque más conservador
UPDATE tramites 
SET requiere_pago = NULL
WHERE is_active = true 
  AND requiere_pago NOT IN ('Sí', 'No', '', NULL);

-- Paso 4: Verificar resultados después de la limpieza
SELECT 'VALORES DESPUÉS DE LA LIMPIEZA' as info;
SELECT DISTINCT requiere_pago, COUNT(*) as count
FROM tramites
WHERE is_active = true
GROUP BY requiere_pago
ORDER BY count DESC;

-- Paso 5: Mostrar resumen de cambios
SELECT 'RESUMEN DE CAMBIOS' as info;
SELECT 
  'Total registros' as metrica,
  COUNT(*) as total
FROM tramites 
WHERE is_active = true
UNION ALL
SELECT 
  'Registros con valores válidos (Sí/No/NULL)' as metrica,
  COUNT(*) as total
FROM tramites 
WHERE is_active = true 
  AND (requiere_pago IN ('Sí', 'No') OR requiere_pago IS NULL OR requiere_pago = '')
UNION ALL
SELECT 
  'Porcentaje de datos limpios' as metrica,
  ROUND(
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM tramites WHERE is_active = true), 
    2
  ) || '%' as total
FROM tramites 
WHERE is_active = true 
  AND (requiere_pago IN ('Sí', 'No') OR requiere_pago IS NULL OR requiere_pago = '');