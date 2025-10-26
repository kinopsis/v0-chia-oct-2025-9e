-- Script SQL para verificar el estado de las claves foráneas entre tramites y dependencias
-- Este script ayuda a diagnosticar el error de PostgREST: "Could not find a relationship between 'tramites' and 'dependencias' in the schema cache"

-- Paso 1: Verificar columnas en tabla tramites
SELECT 
    'VERIFICACIÓN DE COLUMNAS EN TRAMITES' as seccion,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tramites' 
AND column_name IN ('dependencia_id', 'subdependencia_id', 'dependencia_nombre', 'subdependencia_nombre')
ORDER BY column_name;

-- Paso 2: Verificar restricciones de clave foránea
SELECT 
    'VERIFICACIÓN DE RESTRICCIONES DE CLAVE FORÁNEA' as seccion,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
    AND tc.table_schema = ccu.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'tramites'
  AND ccu.table_name = 'dependencias'
ORDER BY tc.constraint_name;

-- Paso 3: Verificar todas las referencias a dependencias en la base de datos
SELECT 
    'TODAS LAS REFERENCIAS A DEPENDENCIAS' as seccion,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
    AND tc.table_schema = ccu.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'dependencias'
ORDER BY tc.table_name, tc.constraint_name;

-- Paso 4: Verificar nombres esperados por PostgREST
SELECT 
    'NOMBRES DE RESTRICCIONES ESPERADOS POR POSTGREST' as seccion,
    constraint_name,
    CASE 
        WHEN constraint_name IN ('tramites_dependencia_id_fkey', 'tramites_subdependencia_id_fkey') 
        THEN '✅ Nombre correcto para PostgREST'
        ELSE '⚠️ Nombre no estándar - puede causar problemas con PostgREST'
    END as estado,
    table_name,
    column_name
FROM information_schema.key_column_usage 
WHERE constraint_name LIKE '%tramites%dependencia%'
   OR constraint_name LIKE '%dependencia%tramites%'
ORDER BY constraint_name;

-- Paso 5: Verificar datos y migración
SELECT 
    'ESTADO DE DATOS Y MIGRACIÓN' as seccion,
    COUNT(*) as total_tramites,
    COUNT(dependencia_id) as tramites_con_dependencia_id,
    COUNT(subdependencia_id) as tramites_con_subdependencia_id,
    COUNT(dependencia_nombre) as tramites_con_dependencia_nombre_legacy,
    COUNT(subdependencia_nombre) as tramites_con_subdependencia_nombre_legacy,
    COUNT(*) FILTER (WHERE dependencia_id IS NOT NULL AND dependencia_id NOT IN (SELECT id FROM dependencias)) as dependencia_id_invalida,
    COUNT(*) FILTER (WHERE subdependencia_id IS NOT NULL AND subdependencia_id NOT IN (SELECT id FROM dependencias)) as subdependencia_id_invalida
FROM tramites;

-- Paso 6: Verificar integridad referencial (muestra de problemas)
SELECT 
    'INTEGRIDAD REFERENCIAL - EJEMPLOS DE PROBLEMAS' as seccion,
    t.id as tramite_id,
    t.nombre_tramite,
    t.dependencia_id,
    t.subdependencia_id,
    CASE 
        WHEN t.dependencia_id IS NOT NULL AND d.id IS NULL 
        THEN '❌ dependencia_id inválida'
        WHEN t.subdependencia_id IS NOT NULL AND sd.id IS NULL 
        THEN '❌ subdependencia_id inválida'
        ELSE '✅ OK'
    END as estado
FROM tramites t
LEFT JOIN dependencias d ON t.dependencia_id = d.id
LEFT JOIN dependencias sd ON t.subdependencia_id = sd.id
WHERE (t.dependencia_id IS NOT NULL AND d.id IS NULL)
   OR (t.subdependencia_id IS NOT NULL AND sd.id IS NULL)
LIMIT 10;

-- Paso 7: Verificar si las relaciones funcionan (prueba de JOIN)
SELECT 
    'PRUEBA DE RELACIONES FUNCIONALES' as seccion,
    'Intentando obtener trámites con información de dependencias...' as prueba,
    COUNT(*) as total_registros,
    COUNT(d.id) as dependencias_encontradas,
    COUNT(sd.id) as subdependencias_encontradas
FROM tramites t
LEFT JOIN dependencias d ON t.dependencia_id = d.id
LEFT JOIN dependencias sd ON t.subdependencia_id = sd.id
WHERE t.dependencia_id IS NOT NULL OR t.subdependencia_id IS NOT NULL;