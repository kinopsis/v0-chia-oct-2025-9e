-- Seed initial dependencias data from CSV file
-- This script loads the hierarchical structure from the dependencias.csv file

-- Function to load dependencias from CSV data
CREATE OR REPLACE FUNCTION load_initial_dependencias()
RETURNS INTEGER AS $$
DECLARE
  dependencia_count INTEGER := 0;
  row_data RECORD;
BEGIN
  -- Insert main dependencies (those with "Directo" type or where CODIGO DEPENDENCIA is empty/null)
  INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, orden, created_by)
  VALUES 
    ('000', 'DA', 'Despacho Alcalde', 'dependencia', NULL, 1, 
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('010', 'SP', 'Secretaría de Planeación', 'dependencia', NULL, 2,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('030', 'SG', 'Secretaría de Gobierno', 'dependencia', NULL, 3,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('040', 'SH', 'Secretaría de Hacienda', 'dependencia', NULL, 4,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('050', 'SOP', 'Secretaría de Obras Públicas', 'dependencia', NULL, 5,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('060', 'SDS', 'Secretaría de Desarrollo Social', 'dependencia', NULL, 6,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('080', 'SS', 'Secretaría de Salud', 'dependencia', NULL, 7,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('090', 'SDE', 'Secretaría para el Desarrollo Económico', 'dependencia', NULL, 8,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('100', 'SMA', 'Secretaría de Medio Ambiente', 'dependencia', NULL, 9,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('110', 'SM', 'Secretaría de Movilidad', 'dependencia', NULL, 10,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('120', 'SPCAC', 'Secretaría de Participación Ciudadana y Acción Comunitaria', 'dependencia', NULL, 11,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('020', 'SG', 'Secretaría General', 'dependencia', NULL, 12,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('070', 'SE', 'Secretaría de Educación', 'dependencia', NULL, 13,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1))
  ON CONFLICT (codigo) DO NOTHING;
  
  GET DIAGNOSTICS dependencia_count = ROW_COUNT;
  
  -- Insert subdependencies for Despacho Alcalde (codigo 000)
  INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, orden, created_by)
  VALUES 
    ('001', 'OAJ', 'Oficina Asesora Jurídica', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '000'), 1,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('002', 'OC', 'Oficina de Contratación', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '000'), 2,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('003', 'ODJ', 'Oficina Defensa Judicial', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '000'), 3,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('004', 'OCI', 'Oficina de Control Interno', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '000'), 4,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('005', 'OTIC', 'Oficina de tecnologías de la información y las comunicaciones TICS', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '000'), 5,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('006', 'OACPP', 'Oficina Asesora de comunicación Prensa y Protocolo', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '000'), 6,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1))
  ON CONFLICT (codigo) DO NOTHING;
  
  -- Insert subdependencies for Secretaría de Planeación (codigo 010)
  INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, orden, created_by)
  VALUES 
    ('011', 'OSIE', 'Dirección Sistemas de la Información y Estadísticas', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '010'), 1,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('012', 'DPD', 'Dirección de Planificación del Desarrollo', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '010'), 2,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('013', 'DOTP', 'Dirección de Ordenamiento Territorial y Plusvalía', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '010'), 3,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('014', 'DU', 'Dirección de Urbanismo', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '010'), 4,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('015', 'DSP', 'Dirección de Servicios Públicos', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '010'), 5,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1))
  ON CONFLICT (codigo) DO NOTHING;
  
  -- Insert subdependencies for Secretaría de Gobierno (codigo 030)
  INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, orden, created_by)
  VALUES 
    ('031', 'DSCC', 'Dirección de Seguridad y Convivencia Ciudadana', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '030'), 1,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('032', 'DAERRP', 'Dirección de Asuntos Étnicos Raciales Religiosos y Posconflicto', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '030'), 2,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('033', 'DDRC', 'Dirección de Derechos y Resolución de Conflictos', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '030'), 3,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1))
  ON CONFLICT (codigo) DO NOTHING;
  
  -- Insert subdependencies for Secretaría de Hacienda (codigo 040)
  INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, orden, created_by)
  VALUES 
    ('041', 'DR', 'Dirección de Rentas', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '040'), 1,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('042', 'DF', 'Dirección Financiera', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '040'), 2,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('043', 'DT', 'Dirección de Tesorería', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '040'), 3,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1))
  ON CONFLICT (codigo) DO NOTHING;
  
  -- Insert subdependencies for Secretaría de Obras Públicas (codigo 050)
  INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, orden, created_by)
  VALUES 
    ('051', 'DI', 'Dirección de Infraestructura', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '050'), 1,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('052', 'DPED', 'Dirección de Programación, Estudios y Diseños', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '050'), 2,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('053', 'DV', 'Dirección de Valorización', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '050'), 3,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1))
  ON CONFLICT (codigo) DO NOTHING;
  
  -- Insert subdependencies for Secretaría de Desarrollo Social (codigo 060)
  INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, orden, created_by)
  VALUES 
    ('061', 'DCJ', 'Dirección de Ciudadanía Juvenil', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '060'), 1,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('062', 'DAS', 'Dirección de Acción Social', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '060'), 2,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('063', 'DC', 'Dirección de Cultura', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '060'), 3,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1))
  ON CONFLICT (codigo) DO NOTHING;
  
  -- Insert subdependencies for Secretaría de Salud (codigo 080)
  INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, orden, created_by)
  VALUES 
    ('081', 'DSP', 'Dirección de Salud Pública', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '080'), 1,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('082', 'DVC', 'Dirección de Vigilancia y Control', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '080'), 2,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1))
  ON CONFLICT (codigo) DO NOTHING;
  
  -- Insert subdependencies for Secretaría para el Desarrollo Económico (codigo 090)
  INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, orden, created_by)
  VALUES 
    ('091', 'DDAE', 'Dirección de Desarrollo Agropecuario y Empresarial', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '090'), 1,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('092', 'DT', 'Dirección de Turismo', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '090'), 2,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1))
  ON CONFLICT (codigo) DO NOTHING;
  
  -- Insert subdependencies for Secretaría de Movilidad (codigo 110)
  INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, orden, created_by)
  VALUES 
    ('111', 'DSMGT', 'Dirección de Servicios de Movilidad y Gestión del Transporte', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '110'), 1,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('112', 'DESVCT', 'Dirección de Educación, Seguridad Vial y Control de Tránsito', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '110'), 2,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('113', 'UTCCH', 'Unión Temporal Circulemos Chía', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '110'), 3,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1))
  ON CONFLICT (codigo) DO NOTHING;
  
  -- Insert subdependencies for Secretaría General (codigo 020)
  INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, orden, created_by)
  VALUES 
    ('021', 'DFP', 'Dirección de Función Pública', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '020'), 1,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('022', 'DSA', 'Dirección de Servicios Administrativos', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '020'), 2,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('024', 'DCID', 'Dirección de Control Interno Disciplinario', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '020'), 3,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1))
  ON CONFLICT (codigo) DO NOTHING;
  
  -- Insert subdependencies for Secretaría de Educación (codigo 070)
  INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, orden, created_by)
  VALUES 
    ('071', 'DIV', 'Dirección de Inspección y Vigilancia', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '070'), 1,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('072', 'DGFE', 'Dirección de Gestión y Fomento a la Educación', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '070'), 2,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('073', 'DAF', 'Dirección Administrativa y Financiera', 'subdependencia', 
     (SELECT id FROM dependencias WHERE codigo = '070'), 3,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1))
  ON CONFLICT (codigo) DO NOTHING;
  
  -- Insert decentralized dependencies (special case - they act as main dependencies)
  INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, orden, created_by)
  VALUES 
    ('201', NULL, 'IDUVI', 'dependencia', NULL, 14,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('202', NULL, 'IMRD', 'dependencia', NULL, 15,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('203', NULL, 'EMSERCHIA', 'dependencia', NULL, 16,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('204', NULL, 'PERSONERÍA', 'dependencia', NULL, 17,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('212', NULL, 'AGUSTÍN CODAZZI', 'dependencia', NULL, 18,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('214', NULL, 'CUERPO DE BOMBEROS CHÍA', 'dependencia', NULL, 19,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
    ('215', NULL, 'DEFENSA CIVIL COLOMBIANA', 'dependencia', NULL, 20,
     (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1))
  ON CONFLICT (codigo) DO NOTHING;
  
  RAISE NOTICE 'Dependencias iniciales cargadas exitosamente';
  RETURN dependencia_count;
END;
$$ LANGUAGE plpgsql;

-- Instructions for running the seed:
/*
To load the initial dependencias data, run:

SELECT load_initial_dependencias();

Then verify the data:
SELECT 
  id,
  codigo,
  sigla,
  nombre,
  tipo,
  dependencia_padre_id,
  nivel
FROM dependencias 
ORDER BY nivel, orden, nombre;
*/