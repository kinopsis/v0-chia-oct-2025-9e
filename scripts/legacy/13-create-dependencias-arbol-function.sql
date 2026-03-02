-- Función para obtener el árbol de dependencias
CREATE OR REPLACE FUNCTION get_dependencias_arbol()
RETURNS TABLE(
    id BIGINT,
    codigo VARCHAR(10),
    sigla VARCHAR(10),
    nombre VARCHAR(255),
    tipo VARCHAR(50),
    nivel INTEGER,
    orden INTEGER,
    is_active BOOLEAN,
    dependencia_padre_id BIGINT,
    dependencia_padre_codigo VARCHAR(10),
    dependencia_padre_nombre VARCHAR(255),
    path TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE dependencias_tree AS (
        -- Dependencias raíz (nivel 0)
        SELECT 
            d.id,
            d.codigo,
            d.sigla,
            d.nombre,
            d.tipo,
            d.nivel,
            d.orden,
            d.is_active,
            d.dependencia_padre_id,
            CAST(d.codigo AS TEXT) as path
        FROM dependencias d
        WHERE d.nivel = 0 AND d.is_active = true
        
        UNION ALL
        
        -- Subdependencias (recursivo)
        SELECT 
            d.id,
            d.codigo,
            d.sigla,
            d.nombre,
            d.tipo,
            d.nivel,
            d.orden,
            d.is_active,
            d.dependencia_padre_id,
            CAST(dt.path || ' > ' || d.codigo AS TEXT) as path
        FROM dependencias d
        INNER JOIN dependencias_tree dt ON d.dependencia_padre_id = dt.id
        WHERE d.is_active = true
    )
    SELECT 
        dt.id,
        dt.codigo,
        dt.sigla,
        dt.nombre,
        dt.tipo,
        dt.nivel,
        dt.orden,
        dt.is_active,
        dt.dependencia_padre_id,
        dp.codigo as dependencia_padre_codigo,
        dp.nombre as dependencia_padre_nombre,
        dt.path
    FROM dependencias_tree dt
    LEFT JOIN dependencias dp ON dt.dependencia_padre_id = dp.id
    ORDER BY dt.path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permisos para que la función sea accesible
GRANT EXECUTE ON FUNCTION get_dependencias_arbol() TO authenticated, anon, service_role;