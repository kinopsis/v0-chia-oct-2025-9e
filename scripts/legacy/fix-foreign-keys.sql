-- Script SQL para corregir problemas comunes de claves foráneas entre tramites y dependencias
-- Este script aborda el error de PostgREST: "Could not find a relationship between 'tramites' and 'dependencias' in the schema cache"

-- Paso 1: Verificar y crear columnas de clave foránea si no existen
-- (Esto ya debería estar hecho por la migración 09-modify-tramites-table.sql)
ALTER TABLE tramites 
ADD COLUMN IF NOT EXISTS dependencia_id INTEGER,
ADD COLUMN IF NOT EXISTS subdependencia_id INTEGER;

-- Paso 2: Eliminar restricciones antiguas con nombres incorrectos (si existen)
-- Primero verificamos qué restricciones existen
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'tramites' 
AND constraint_type = 'FOREIGN KEY'
AND constraint_name LIKE '%dependencia%';

-- Si existen restricciones con nombres incorrectos, descomente y ejecute:
-- ALTER TABLE tramites DROP CONSTRAINT IF EXISTS fk_tramites_dependencia_id;
-- ALTER TABLE tramites DROP CONSTRAINT IF EXISTS fk_tramites_subdependencia_id;

-- Paso 3: Crear restricciones con nombres estándar para PostgREST
-- Eliminar primero cualquier restricción existente con nombres incorrectos
DO $$
BEGIN
    -- Eliminar restricciones antiguas si existen
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_tramites_dependencia_id'
    ) THEN
        ALTER TABLE tramites DROP CONSTRAINT fk_tramites_dependencia_id;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_tramites_subdependencia_id'
    ) THEN
        ALTER TABLE tramites DROP CONSTRAINT fk_tramites_subdependencia_id;
    END IF;
END $$;

-- Crear nuevas restricciones con nombres estándar
ALTER TABLE tramites 
ADD CONSTRAINT tramites_dependencia_id_fkey 
FOREIGN KEY (dependencia_id) REFERENCES dependencias(id);

ALTER TABLE tramites 
ADD CONSTRAINT tramites_subdependencia_id_fkey 
FOREIGN KEY (subdependencia_id) REFERENCES dependencias(id);

-- Paso 4: Crear índices para mejor performance (si no existen)
CREATE INDEX IF NOT EXISTS idx_tramites_dependencia_id ON tramites(dependencia_id);
CREATE INDEX IF NOT EXISTS idx_tramites_subdependencia_id ON tramites(subdependencia_id);

-- Paso 5: Verificar y corregir datos inválidos
-- Identificar trámites con dependencias inválidas
SELECT 
    t.id,
    t.nombre_tramite,
    t.dependencia_id,
    t.subdependencia_id
FROM tramites t
LEFT JOIN dependencias d ON t.dependencia_id = d.id
LEFT JOIN dependencias sd ON t.subdependencia_id = sd.id
WHERE (t.dependencia_id IS NOT NULL AND d.id IS NULL)
   OR (t.subdependencia_id IS NOT NULL AND sd.id IS NULL);

-- Para corregir datos inválidos, actualice manualmente o establezca a NULL:
-- UPDATE tramites SET dependencia_id = NULL WHERE dependencia_id IN (valores_inválidos);
-- UPDATE tramites SET subdependencia_id = NULL WHERE subdependencia_id IN (valores_inválidos);

-- Paso 6: Verificar que las restricciones funcionen
-- Prueba de inserción válida
INSERT INTO tramites (nombre_tramite, descripcion, categoria, dependencia_id, subdependencia_id)
SELECT 'Prueba', 'Descripción de prueba', 'categoria_prueba', d.id, sd.id
FROM dependencias d 
JOIN dependencias sd ON d.id = sd.dependencia_padre_id
WHERE d.tipo = 'dependencia' AND sd.tipo = 'subdependencia'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Verificar la inserción
SELECT * FROM tramites 
WHERE nombre_tramite = 'Prueba' 
AND dependencia_id IS NOT NULL 
AND subdependencia_id IS NOT NULL;

-- Paso 7: Limpiar datos de prueba
DELETE FROM tramites WHERE nombre_tramite = 'Prueba';

-- Paso 8: Verificar que las relaciones funcionen con PostgREST
-- Esta consulta debería funcionar si todo está configurado correctamente
SELECT 
    t.id,
    t.nombre_tramite,
    d.nombre as dependencia_nombre,
    sd.nombre as subdependencia_nombre
FROM tramites t
LEFT JOIN dependencias d ON t.dependencia_id = d.id
LEFT JOIN dependencias sd ON t.subdependencia_id = sd.id
WHERE t.dependencia_id IS NOT NULL
LIMIT 5;

-- Mensajes finales
SELECT '✅ Restricciones de clave foránea configuradas correctamente' as resultado;
SELECT '✅ Nombres de restricciones compatibles con PostgREST' as compatibilidad;
SELECT '✅ Integridad referencial verificada' as integridad;

-- Instrucciones finales:
/*
Después de ejecutar este script:

1. Reinicie el servicio de PostgREST para actualizar el caché de esquema
   - En Docker: docker restart [nombre_contenedor_postgrest]
   - En servicios: sudo systemctl restart postgrest

2. O bien, notifique a PostgREST para que recargue el esquema:
   SELECT pg_notify('pgrst', 'reload schema');

3. Pruebe la API nuevamente:
   - GET /rest/tramites?select=*,dependencias(*),subdependencias(*)
   - PUT /rest/tramites/[id] con datos que incluyan dependencia_id/subdependencia_id

4. Si el problema persiste, verifique:
   - Que las dependencias referenciadas existan y estén activas
   - Que los IDs de dependencia sean válidos
   - Que no haya caché de navegador o cliente
*/