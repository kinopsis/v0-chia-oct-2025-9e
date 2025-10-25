-- Carga completa de dependencias desde el CSV proporcionado
-- Dependencias principales (nivel 0)
INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, nivel, orden, is_active, created_by) VALUES
('000', 'DA', 'Despacho Alcalde', 'dependencia', NULL, 0, 1, true, NULL),
('010', 'SP', 'Secretaría de Planeación', 'dependencia', NULL, 0, 10, true, NULL),
('020', 'SG', 'Secretaría General', 'dependencia', NULL, 0, 20, true, NULL),
('030', 'GOB', 'Secretaría de Gobierno', 'dependencia', NULL, 0, 30, true, NULL),
('040', 'SH', 'Secretaría de Hacienda', 'dependencia', NULL, 0, 40, true, NULL),
('050', 'SOP', 'Secretaría de Obras Públicas', 'dependencia', NULL, 0, 50, true, NULL),
('060', 'SDS', 'Secretaría de Desarrollo Social', 'dependencia', NULL, 0, 60, true, NULL),
('070', 'SE', 'Secretaría de Educación', 'dependencia', NULL, 0, 70, true, NULL),
('080', 'SS', 'Secretaría de Salud', 'dependencia', NULL, 0, 80, true, NULL),
('090', 'SDE', 'Secretaría para el Desarrollo Económico', 'dependencia', NULL, 0, 90, true, NULL),
('100', 'SMA', 'Secretaría de Medio Ambiente', 'dependencia', NULL, 0, 100, true, NULL),
('110', 'SM', 'Secretaría de Movilidad', 'dependencia', NULL, 0, 110, true, NULL),
('120', 'SPCAC', 'Secretaría de Participación Ciudadana y Acción Comunitaria', 'dependencia', NULL, 0, 120, true, NULL),
('201', 'IDUVI', 'IDUVI', 'descentralizado', NULL, 0, 201, true, NULL),
('202', 'IMRD', 'IMRD', 'descentralizado', NULL, 0, 202, true, NULL),
('203', 'EMSERCHIA', 'EMSERCHIA', 'descentralizado', NULL, 0, 203, true, NULL),
('204', 'PERSONERÍA', 'PERSONERÍA', 'descentralizado', NULL, 0, 204, true, NULL),
('212', 'AGUSTÍN CODAZZI', 'AGUSTÍN CODAZZI', 'descentralizado', NULL, 0, 212, true, NULL),
('214', 'CUERPO DE BOMBEROS CHÍA', 'CUERPO DE BOMBEROS CHÍA', 'descentralizado', NULL, 0, 214, true, NULL),
('215', 'DEFENSA CIVIL COLOMBIANA', 'DEFENSA CIVIL COLOMBIANA', 'descentralizado', NULL, 0, 215, true, NULL);

-- Subdependencias del Despacho Alcalde (000)
INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, nivel, orden, is_active, created_by) VALUES
('001', 'OAJ', 'Oficina Asesora Jurídica', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '000'), 1, 1, true, NULL),
('002', 'OC', 'Oficina de Contratación', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '000'), 1, 2, true, NULL),
('003', 'ODJ', 'Oficina Defensa Judicial', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '000'), 1, 3, true, NULL),
('004', 'OCI', 'Oficina de Control Interno', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '000'), 1, 4, true, NULL),
('005', 'OTIC', 'Oficina de tecnologías de la información y las comunicaciones TICS', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '000'), 1, 5, true, NULL),
('006', 'OACPP', 'Oficina Asesora de comunicación Prensa y Protocolo', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '000'), 1, 6, true, NULL);

-- Subdependencias de la Secretaría de Planeación (010)
INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, nivel, orden, is_active, created_by) VALUES
('011', 'OSIE', 'Dirección Sistemas de la Información y Estadísticas', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '010'), 1, 1, true, NULL),
('012', 'DPD', 'Dirección de Planificación del Desarrollo', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '010'), 1, 2, true, NULL),
('013', 'DOTP', 'Dirección de Ordenamiento Territorial y Plusvalía', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '010'), 1, 3, true, NULL),
('014', 'DU', 'Dirección de Urbanismo', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '010'), 1, 4, true, NULL),
('015', 'DSP', 'Dirección de Servicios Públicos', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '010'), 1, 5, true, NULL);

-- Subdependencias de la Secretaría de Gobierno (030)
INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, nivel, orden, is_active, created_by) VALUES
('031', 'DSCC', 'Dirección de Seguridad y Convivencia Ciudadana', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '030'), 1, 1, true, NULL),
('032', 'DAERRP', 'Dirección de Asuntos Étnicos Raciales Religiosos y Posconflicto', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '030'), 1, 2, true, NULL),
('033', 'DDRC', 'Dirección de Derechos y Resolución de Conflictos', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '030'), 1, 3, true, NULL);

-- Subdependencias de la Secretaría de Hacienda (040)
INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, nivel, orden, is_active, created_by) VALUES
('041', 'DR', 'Dirección de Rentas', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '040'), 1, 1, true, NULL),
('042', 'DF', 'Dirección Financiera', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '040'), 1, 2, true, NULL),
('043', 'DT', 'Dirección de Tesorería', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '040'), 1, 3, true, NULL);

-- Subdependencias de la Secretaría de Obras Públicas (050)
INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, nivel, orden, is_active, created_by) VALUES
('051', 'DI', 'Dirección de Infraestructura', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '050'), 1, 1, true, NULL),
('052', 'DPED', 'Dirección de Programación, Estudios y Diseños', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '050'), 1, 2, true, NULL),
('053', 'DV', 'Dirección de Valorización', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '050'), 1, 3, true, NULL);

-- Subdependencias de la Secretaría de Desarrollo Social (060)
INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, nivel, orden, is_active, created_by) VALUES
('061', 'DCJ', 'Dirección de Ciudadanía Juvenil', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '060'), 1, 1, true, NULL),
('062', 'DAS', 'Dirección de Acción Social', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '060'), 1, 2, true, NULL),
('063', 'DC', 'Dirección de Cultura', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '060'), 1, 3, true, NULL);

-- Subdependencias de la Secretaría de Salud (080)
INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, nivel, orden, is_active, created_by) VALUES
('081', 'DSP', 'Dirección de Salud Pública', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '080'), 1, 1, true, NULL),
('082', 'DVC', 'Dirección de Vigilancia y Control', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '080'), 1, 2, true, NULL);

-- Subdependencias de la Secretaría para el Desarrollo Económico (090)
INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, nivel, orden, is_active, created_by) VALUES
('091', 'DDAE', 'Dirección de Desarrollo Agropecuario y Empresarial', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '090'), 1, 1, true, NULL),
('092', 'DT', 'Dirección de Turismo', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '090'), 1, 2, true, NULL);

-- Subdependencias de la Secretaría de Movilidad (110)
INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, nivel, orden, is_active, created_by) VALUES
('111', 'DSMGT', 'Dirección de Servicios de Movilidad y Gestión del Transporte', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '110'), 1, 1, true, NULL),
('112', 'DESVCT', 'Dirección de Educación, Seguridad Vial y Control de Tránsito', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '110'), 1, 2, true, NULL),
('113', 'UTCCH', 'Unión Temporal Circulemos Chía', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '110'), 1, 3, true, NULL);

-- Subdependencias de la Secretaría General (020)
INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, nivel, orden, is_active, created_by) VALUES
('021', 'DFP', 'Dirección de Función Pública', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '020'), 1, 1, true, NULL),
('022', 'DSA', 'Dirección de Servicios Administrativos', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '020'), 1, 2, true, NULL),
('024', 'DCID', 'Dirección de Control Interno Disciplinario', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '020'), 1, 3, true, NULL);

-- Subdependencias de la Secretaría de Educación (070)
INSERT INTO dependencias (codigo, sigla, nombre, tipo, dependencia_padre_id, nivel, orden, is_active, created_by) VALUES
('071', 'DIV', 'Dirección de Inspección y Vigilancia', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '070'), 1, 1, true, NULL),
('072', 'DGFE', 'Dirección de Gestión y Fomento a la Educación', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '070'), 1, 2, true, NULL),
('073', 'DAF', 'Dirección Administrativa y Financiera', 'subdependencia', (SELECT id FROM dependencias WHERE codigo = '070'), 1, 3, true, NULL);

-- Actualizar el orden para las dependencias principales que faltan
UPDATE dependencias SET orden = 130 WHERE codigo = '201'; -- IDUVI
UPDATE dependencias SET orden = 140 WHERE codigo = '202'; -- IMRD
UPDATE dependencias SET orden = 150 WHERE codigo = '203'; -- EMSERCHIA
UPDATE dependencias SET orden = 160 WHERE codigo = '204'; -- PERSONERÍA
UPDATE dependencias SET orden = 170 WHERE codigo = '212'; -- AGUSTÍN CODAZZI
UPDATE dependencias SET orden = 180 WHERE codigo = '214'; -- CUERPO DE BOMBEROS CHÍA
UPDATE dependencias SET orden = 190 WHERE codigo = '215'; -- DEFENSA CIVIL COLOMBIANA

-- Verificar que no haya duplicados y mostrar resumen
SELECT 
    tipo,
    COUNT(*) as cantidad
FROM dependencias 
WHERE is_active = true 
GROUP BY tipo 
ORDER BY tipo;