-- Script para verificar las restricciones de clave foránea en la base de datos
-- Este script ayudará a diagnosticar el error de PostgREST

-- 1. Verificar todas las restricciones de clave foránea en la tabla tramites
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
        AND tc.table_schema = ccu.table_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'tramites'
ORDER BY 
    tc.constraint_name;

-- 2. Verificar todas las restricciones de clave foránea que referencian a dependencias
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
        AND tc.table_schema = ccu.table_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'dependencias'
ORDER BY 
    tc.table_name, tc.constraint_name;

-- 3. Verificar si existen las columnas dependencia_id y subdependencia_id en tramites
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'tramites'
    AND column_name IN ('dependencia_id', 'subdependencia_id', 'dependencia_nombre')
ORDER BY 
    column_name;

-- 4. Verificar el esquema de la tabla dependencias
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'dependencias'
ORDER BY 
    ordinal_position;