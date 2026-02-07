-- Carga inicial de información de contacto desde el CSV directorios-funcionarios-dependenciasv2.csv
-- Este script actualiza las dependencias existentes con información de contacto

-- Función para cargar datos de contacto desde CSV
CREATE OR REPLACE FUNCTION load_contactos_from_csv()
RETURNS TABLE(
    codigo VARCHAR(10),
    nombre_dependencia VARCHAR(255),
    responsable VARCHAR(255),
    correo VARCHAR(255),
    extension VARCHAR(50),
    direccion TEXT,
    registros_actualizados INTEGER,
    registros_no_encontrados INTEGER
) AS $$
DECLARE
    v_codigo VARCHAR(10);
    v_nombre VARCHAR(255);
    v_responsable VARCHAR(255);
    v_correo VARCHAR(255);
    v_extension VARCHAR(50);
    v_direccion TEXT;
    v_registros_actualizados INTEGER := 0;
    v_registros_no_encontrados INTEGER := 0;
    v_dependencia_id UUID;
    csv_row RECORD;
BEGIN
    -- Crear tabla temporal para cargar el CSV
    CREATE TEMP TABLE temp_contactos (
        codigo VARCHAR(10),
        sigla VARCHAR(10),
        dependencia VARCHAR(255),
        responsable VARCHAR(255),
        correo_electronico VARCHAR(255),
        extension VARCHAR(50),
        direccion TEXT
    );

    -- Aquí se insertarían los datos del CSV (esto se haría desde la aplicación)
    -- INSERT INTO temp_contactos VALUES 
    -- ('000', 'DA', 'DESPACHO DEL ALCALDE', 'LEONARDO DONOSO RUIZ', 'alcalde@chia.gov.co', '1603', 'Carrera 11 Número 11-29'),
    -- ... más registros ...

    -- Procesar cada registro
    FOR csv_row IN SELECT * FROM temp_contactos LOOP
        v_codigo := csv_row.codigo;
        v_nombre := csv_row.dependencia;
        v_responsable := csv_row.responsable;
        v_correo := csv_row.correo_electronico;
        v_extension := csv_row.extension;
        v_direccion := csv_row.direccion;

        -- Buscar dependencia por código
        SELECT id INTO v_dependencia_id 
        FROM dependencias 
        WHERE codigo = v_codigo;

        IF v_dependencia_id IS NOT NULL THEN
            -- Actualizar dependencia con información de contacto
            UPDATE dependencias 
            SET 
                responsable = v_responsable,
                correo_electronico = v_correo,
                extension_telefonica = v_extension,
                direccion = v_direccion,
                updated_at = NOW()
            WHERE id = v_dependencia_id;
            
            v_registros_actualizados := v_registros_actualizados + 1;
        ELSE
            v_registros_no_encontrados := v_registros_no_encontrados + 1;
        END IF;
    END LOOP;

    -- Retornar resumen
    RETURN QUERY SELECT
        v_codigo,
        v_nombre,
        v_responsable,
        v_correo,
        v_extension,
        v_direccion,
        v_registros_actualizados,
        v_registros_no_encontrados;

    -- Limpiar tabla temporal
    DROP TABLE temp_contactos;
END;
$$ LANGUAGE plpgsql;

-- Procedimiento para cargar datos manualmente
CREATE OR REPLACE PROCEDURE cargar_contactos_manuales()
AS $$
BEGIN
    -- Actualizaciones manuales para dependencias clave
    UPDATE dependencias SET 
        responsable = 'LEONARDO DONOSO RUIZ',
        correo_electronico = 'alcalde@chia.gov.co',
        extension_telefonica = '1603',
        direccion = 'Carrera 11 Número 11-29'
    WHERE codigo = '000';

    UPDATE dependencias SET 
        responsable = 'LUZ AURORA ESPINOZA TOBAR',
        correo_electronico = 'oficinajuridica@chia.gov.co',
        extension_telefonica = '1801',
        direccion = 'Carrera 11 Número 11-29'
    WHERE codigo = '001';

    UPDATE dependencias SET 
        responsable = 'MONICA ALEXANDRA NARANJO',
        correo_electronico = 'contratacion@chia.gov.co',
        extension_telefonica = '1700',
        direccion = 'Carrera 11 Número 11-29'
    WHERE codigo = '002';

    UPDATE dependencias SET 
        responsable = 'JORGE ENRIQUE RAMÍREZ HERNANDEZ',
        correo_electronico = 'notificacionesjudiciales@chia.gov.co',
        extension_telefonica = '1803',
        direccion = 'Carrera 7 Número 12-100'
    WHERE codigo = '003';

    UPDATE dependencias SET 
        responsable = 'CARLOS ANDRES RODRIGUEZ SANCHEZ',
        correo_electronico = 'controlinterno@chia.gov.co',
        extension_telefonica = '1200',
        direccion = 'Carrera 11 Número 11-29'
    WHERE codigo = '004';

    UPDATE dependencias SET 
        responsable = 'GUSTAVO CARVAJAL MILLÁN',
        correo_electronico = 'oficinatic@chia.gov.co',
        extension_telefonica = '2300 - 2301',
        direccion = 'Carrera 7 Número 12-100'
    WHERE codigo = '005';

    UPDATE dependencias SET 
        responsable = 'CATALINA URIBE BARRETO',
        correo_electronico = 'prensa@chia.gov.co',
        extension_telefonica = '1500',
        direccion = 'Carrera 7 Número 12-100'
    WHERE codigo = '006';

    UPDATE dependencias SET 
        responsable = 'YAKLIN DARIDZA CHAPARRO SALINAS',
        correo_electronico = 'secretaria.planeacion@chia.gov.co',
        extension_telefonica = '2100',
        direccion = 'Carrera 11 Número 11-69'
    WHERE codigo = '010';

    UPDATE dependencias SET 
        responsable = 'FAUSTO ALEJANDRO AMAYA CASTRO',
        correo_electronico = 'sec.general@chia.gov.co',
        extension_telefonica = '4000',
        direccion = 'Carrera 11 Número 11-29'
    WHERE codigo = '020';

    UPDATE dependencias SET 
        responsable = 'HANSEL ENRIQUE GAONA PEREZ',
        correo_electronico = 'sec.gobierno@chia.gov.co',
        extension_telefonica = '1101-1102',
        direccion = 'Calle 10 No 10-07'
    WHERE codigo = '030';

    UPDATE dependencias SET 
        responsable = 'OSCAR HARVEY ROJAS CARRILLO',
        correo_electronico = 'secretariadehacienda@chia.gov.co',
        extension_telefonica = '3184389652 - 2010',
        direccion = 'Carrera 11 Número 11-29'
    WHERE codigo = '040';

    UPDATE dependencias SET 
        responsable = 'NESTOR ALEJANDRO HOYOS BAZURTO',
        correo_electronico = 'sec.obraspublicas@chia.gov.co',
        extension_telefonica = '3400 - 3402',
        direccion = 'Transversal 17 Número 6-108 Piso 2'
    WHERE codigo = '050';

    UPDATE dependencias SET 
        responsable = 'CLAUDIA PATRICIA BERNAL BARRERA',
        correo_electronico = 'sec.desarrollosocial@chia.gov.co',
        extension_telefonica = '3101-3102',
        direccion = 'Carrera 7 Número 15-51'
    WHERE codigo = '060';

    UPDATE dependencias SET 
        responsable = 'NELSY YAZMIN CAJAMARCA SUAREZ',
        correo_electronico = 'sem.secretaria@chia.gov.co',
        extension_telefonica = '2900',
        direccion = 'Carrera 10 Número 8-72 - CC Curubito'
    WHERE codigo = '070';

    UPDATE dependencias SET 
        responsable = 'LUZ STELLA DIAZ JALLER',
        correo_electronico = 'sec.salud@chia.gov.co',
        extension_telefonica = '3000-3002-3006',
        direccion = 'Carrera 10 Número 8-72 - CC Curubito'
    WHERE codigo = '080';

    UPDATE dependencias SET 
        responsable = 'MARTHA YANETH SÁNCHEZ HERRERA',
        correo_electronico = 'sec.economico@chia.gov.co',
        extension_telefonica = '3172977503 - 1300',
        direccion = 'Carrera 10 Número 8-72 - CC Curubito'
    WHERE codigo = '090';

    UPDATE dependencias SET 
        responsable = 'EILEN LIZETH VARELA BELLO',
        correo_electronico = 'secretaria.ambiente@chia.gov.co',
        extension_telefonica = '3700 - 3702',
        direccion = 'Carrera 7 Número 12-100'
    WHERE codigo = '100';

    UPDATE dependencias SET 
        responsable = 'JUAN PABLO RAMIREZ OTALVARO',
        correo_electronico = 'sec.movilidad@chia.gov.co',
        extension_telefonica = '304 5444654 - 3504',
        direccion = 'Transversal 17 Número 6-108 Piso 1'
    WHERE codigo = '110';

    UPDATE dependencias SET 
        responsable = 'MARIA SOLEDAD MUÑOZ SANCHEZ',
        correo_electronico = 'participacion@chia.gov.co',
        extension_telefonica = '4300',
        direccion = 'Carrera 7 Número 12-100'
    WHERE codigo = '120';

    RAISE NOTICE 'Contactos cargados exitosamente para dependencias principales';
END;
$$ LANGUAGE plpgsql;

-- Índices para búsquedas eficientes de contactos
CREATE INDEX IF NOT EXISTS idx_dependencias_responsable ON dependencias(responsable);
CREATE INDEX IF NOT EXISTS idx_dependencias_correo ON dependencias(correo_electronico);
CREATE INDEX IF NOT EXISTS idx_dependencias_direccion ON dependencias USING gin(to_tsvector('spanish', COALESCE(direccion, '')));

-- Vistas para consultas de contacto
CREATE OR REPLACE VIEW vista_contactos_dependencias AS
SELECT 
    d.id,
    d.codigo,
    d.sigla,
    d.nombre,
    d.tipo,
    d.responsable,
    d.correo_electronico,
    d.extension_telefonica,
    d.direccion,
    d.horario_atencion,
    d.telefono_directo,
    d.enlace_web,
    dp.nombre as dependencia_padre,
    dp.codigo as codigo_padre
FROM dependencias d
LEFT JOIN dependencias dp ON d.dependencia_padre_id = dp.id
WHERE d.is_active = true
ORDER BY d.nivel, d.orden, d.nombre;

COMMENT ON VIEW vista_contactos_dependencias IS 'Vista para consultas de información de contacto de dependencias';