-- Extensión de la tabla dependencias con campos de contacto y ubicación
-- Este script añade campos opcionales para enriquecer la información de las dependencias

ALTER TABLE dependencias 
ADD COLUMN IF NOT EXISTS responsable VARCHAR(255),
ADD COLUMN IF NOT EXISTS correo_electronico VARCHAR(255),
ADD COLUMN IF NOT EXISTS extension_telefonica VARCHAR(50),
ADD COLUMN IF NOT EXISTS direccion TEXT,
ADD COLUMN IF NOT EXISTS horario_atencion TEXT,
ADD COLUMN IF NOT EXISTS telefono_directo VARCHAR(50),
ADD COLUMN IF NOT EXISTS enlace_web VARCHAR(255);

-- Índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_dependencias_correo ON dependencias(correo_electronico);
CREATE INDEX IF NOT EXISTS idx_dependencias_responsable ON dependencias(responsable);
CREATE INDEX IF NOT EXISTS idx_dependencias_direccion ON dependencias USING gin(to_tsvector('spanish', direccion));

-- Actualización de la política de seguridad para incluir los nuevos campos
-- (manteniendo las políticas existentes para select, insert, update)

COMMENT ON COLUMN dependencias.responsable IS 'Nombre del funcionario responsable de la dependencia';
COMMENT ON COLUMN dependencias.correo_electronico IS 'Correo electrónico institucional de la dependencia';
COMMENT ON COLUMN dependencias.extension_telefonica IS 'Extensión telefónica interna';
COMMENT ON COLUMN dependencias.direccion IS 'Dirección física completa de la dependencia';
COMMENT ON COLUMN dependencias.horario_atencion IS 'Horario de atención al público';
COMMENT ON COLUMN dependencias.telefono_directo IS 'Teléfono directo de la dependencia';
COMMENT ON COLUMN dependencias.enlace_web IS 'Enlace web o página de la dependencia';

-- Función para validar formato de correo electrónico
CREATE OR REPLACE FUNCTION validate_email_format(email VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger para validar correo electrónico
CREATE OR REPLACE FUNCTION validate_dependencia_contact_info()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.correo_electronico IS NOT NULL AND NOT validate_email_format(NEW.correo_electronico) THEN
        RAISE EXCEPTION 'Formato de correo electrónico inválido: %', NEW.correo_electronico;
    END IF;
    
    -- Validar que no haya duplicados de correo electrónico (excepto nulls)
    IF NEW.correo_electronico IS NOT NULL AND EXISTS (
        SELECT 1 FROM dependencias 
        WHERE correo_electronico = NEW.correo_electronico 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    ) THEN
        RAISE EXCEPTION 'El correo electrónico % ya está registrado en otra dependencia', NEW.correo_electronico;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_contact_info ON dependencias;
CREATE TRIGGER trigger_validate_contact_info
    BEFORE INSERT OR UPDATE ON dependencias
    FOR EACH ROW EXECUTE FUNCTION validate_dependencia_contact_info();

-- Actualización de la función de búsqueda de dependencias para incluir campos de contacto
CREATE OR REPLACE FUNCTION search_dependencias(query_text VARCHAR DEFAULT NULL, include_contacts BOOLEAN DEFAULT false)
RETURNS TABLE(
    id UUID,
    codigo_dependencia VARCHAR,
    sigla VARCHAR,
    nombre VARCHAR,
    tipo_dependencia VARCHAR,
    dependencia_padre_id UUID,
    nivel INTEGER,
    estado BOOLEAN,
    responsable VARCHAR,
    correo_electronico VARCHAR,
    extension_telefonica VARCHAR,
    direccion TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.codigo_dependencia,
        d.sigla,
        d.nombre,
        d.tipo_dependencia,
        d.dependencia_padre_id,
        d.nivel,
        d.estado,
        CASE WHEN include_contacts THEN d.responsable ELSE NULL END,
        CASE WHEN include_contacts THEN d.correo_electronico ELSE NULL END,
        CASE WHEN include_contacts THEN d.extension_telefonica ELSE NULL END,
        CASE WHEN include_contacts THEN d.direccion ELSE NULL END,
        d.created_at,
        d.updated_at
    FROM dependencias d
    WHERE d.estado = true
    AND (
        query_text IS NULL 
        OR to_tsvector('spanish', d.nombre || ' ' || COALESCE(d.sigla, '') || ' ' || COALESCE(d.responsable, '') || ' ' || COALESCE(d.correo_electronico, '')) 
           @@ to_tsquery('spanish', query_text)
    )
    ORDER BY d.nivel, d.nombre;
END;
$$ LANGUAGE plpgsql STABLE;