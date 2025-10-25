-- Modify tramites table to use dependencias references instead of text fields
-- This script should be run AFTER creating the dependencias table and loading initial data

-- Add new foreign key columns for dependencias
ALTER TABLE tramites 
ADD COLUMN IF NOT EXISTS dependencia_id INTEGER,
ADD COLUMN IF NOT EXISTS subdependencia_id INTEGER;

-- Add foreign key constraints
ALTER TABLE tramites 
ADD CONSTRAINT fk_tramites_dependencia_id 
FOREIGN KEY (dependencia_id) REFERENCES dependencias(id);

ALTER TABLE tramites 
ADD CONSTRAINT fk_tramites_subdependencia_id 
FOREIGN KEY (subdependencia_id) REFERENCES dependencias(id);

-- Create indexes for the new foreign key columns
CREATE INDEX IF NOT EXISTS idx_tramites_dependencia_id ON tramites(dependencia_id);
CREATE INDEX IF NOT EXISTS idx_tramites_subdependencia_id ON tramites(subdependencia_id);

-- Function to migrate existing tramites data to use dependencias references
CREATE OR REPLACE FUNCTION migrate_tramites_to_dependencias()
RETURNS INTEGER AS $$
DECLARE
  tramite_record RECORD;
  dependencia_id_found INTEGER;
  subdependencia_id_found INTEGER;
  migrated_count INTEGER := 0;
BEGIN
  -- Process each tramite with dependencia/subdependencia names
  FOR tramite_record IN 
    SELECT id, dependencia_nombre, subdependencia_nombre
    FROM tramites 
    WHERE dependencia_nombre IS NOT NULL AND dependencia_nombre != ''
  LOOP
    -- Find matching dependencia by name
    SELECT id INTO dependencia_id_found
    FROM dependencias 
    WHERE nombre = tramite_record.dependencia_nombre 
    AND tipo = 'dependencia'
    AND is_active = true
    LIMIT 1;
    
    -- Find matching subdependencia by name (if provided)
    IF tramite_record.subdependencia_nombre IS NOT NULL AND tramite_record.subdependencia_nombre != '' THEN
      SELECT id INTO subdependencia_id_found
      FROM dependencias 
      WHERE nombre = tramite_record.subdependencia_nombre 
      AND tipo = 'subdependencia'
      AND is_active = true
      LIMIT 1;
    END IF;
    
    -- Update tramite with found dependencias
    UPDATE tramites 
    SET 
      dependencia_id = dependencia_id_found,
      subdependencia_id = subdependencia_id_found
    WHERE id = tramite_record.id;
    
    migrated_count := migrated_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Migrados % trámites a sistema de dependencias', migrated_count;
  RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to validate dependencia relationships in tramites
CREATE OR REPLACE FUNCTION validate_tramite_dependencias()
RETURNS TRIGGER AS $$
BEGIN
  -- If dependencia_id is provided, ensure it's a valid dependencia
  IF NEW.dependencia_id IS NOT NULL THEN
    PERFORM 1 FROM dependencias 
    WHERE id = NEW.dependencia_id AND tipo = 'dependencia';
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'dependencia_id debe referenciar una dependencia válida';
    END IF;
  END IF;
  
  -- If subdependencia_id is provided, ensure it's a valid subdependencia
  IF NEW.subdependencia_id IS NOT NULL THEN
    PERFORM 1 FROM dependencias 
    WHERE id = NEW.subdependencia_id AND tipo = 'subdependencia';
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'subdependencia_id debe referenciar una subdependencia válida';
    END IF;
    
    -- Ensure subdependencia belongs to the selected dependencia
    IF NEW.dependencia_id IS NOT NULL THEN
      PERFORM 1 FROM dependencias subdep
      JOIN dependencias dep ON subdep.dependencia_padre_id = dep.id
      WHERE subdep.id = NEW.subdependencia_id 
      AND dep.id = NEW.dependencia_id;
      
      IF NOT FOUND THEN
        RAISE EXCEPTION 'La subdependencia no pertenece a la dependencia seleccionada';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate dependencia relationships
CREATE TRIGGER validate_tramite_dependencias_trigger
  BEFORE INSERT OR UPDATE ON tramites
  FOR EACH ROW
  EXECUTE FUNCTION validate_tramite_dependencias();

-- Comment explaining the migration process
COMMENT ON COLUMN tramites.dependencia_id IS 'Referencia a la tabla dependencias (reemplaza dependencia_nombre)';
COMMENT ON COLUMN tramites.subdependencia_id IS 'Referencia a la tabla dependencias para subdependencias (reemplaza subdependencia_nombre)';

-- Instructions for manual migration:
/*
To migrate existing data, run this after loading dependencias:

SELECT migrate_tramites_to_dependencias();

Then verify the migration:
SELECT 
  t.id,
  t.nombre_tramite,
  d.nombre as dependencia,
  sd.nombre as subdependencia,
  t.dependencia_nombre as old_dependencia,
  t.subdependencia_nombre as old_subdependencia
FROM tramites t
LEFT JOIN dependencias d ON t.dependencia_id = d.id
LEFT JOIN dependencias sd ON t.subdependencia_id = sd.id
WHERE t.dependencia_nombre IS NOT NULL
LIMIT 10;
*/