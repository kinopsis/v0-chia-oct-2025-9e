-- Add informacion_pago field to tramites table
-- This field stores the detailed payment information for procedures that require payment

-- Add informacion_pago column to tramites table
ALTER TABLE tramites
ADD COLUMN IF NOT EXISTS informacion_pago TEXT;

-- Add comment explaining the purpose of the informacion_pago field
COMMENT ON COLUMN tramites.informacion_pago IS 'Información detallada del pago asociado al trámite cuando requiere_pago = ''Sí''';

-- Create index for better performance when filtering by informacion_pago
CREATE INDEX IF NOT EXISTS idx_tramites_informacion_pago ON tramites(informacion_pago);

-- Function to validate informacion_pago values based on requiere_pago
CREATE OR REPLACE FUNCTION validate_tramite_informacion_pago()
RETURNS TRIGGER AS $$
BEGIN
  -- If requiere_pago is 'Sí', informacion_pago should be provided (non-empty string)
  IF NEW.requiere_pago = 'Sí' THEN
    IF NEW.informacion_pago IS NULL OR NEW.informacion_pago = '' THEN
      RAISE EXCEPTION 'El campo informacion_pago es obligatorio cuando requiere_pago = ''Sí''';
    END IF;
  END IF;
  
  -- If requiere_pago is not 'Sí', informacion_pago should be NULL
  IF NEW.requiere_pago != 'Sí' THEN
    NEW.informacion_pago := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate informacion_pago values
CREATE TRIGGER validate_tramite_informacion_pago_trigger
  BEFORE INSERT OR UPDATE ON tramites
  FOR EACH ROW
  EXECUTE FUNCTION validate_tramite_informacion_pago();

-- Instructions for updating existing tramites with payment requirements:
/*
To update existing tramites that require payment, run queries like:

UPDATE tramites
SET informacion_pago = 'Variable según caso'
WHERE requiere_pago = 'Sí'
  AND nombre_tramite LIKE '%licencia%';

UPDATE tramites
SET informacion_pago = 'Consultar valor'
WHERE requiere_pago = 'Sí'
  AND nombre_tramite LIKE '%permiso%';

-- Verify the changes
SELECT
  id,
  nombre_tramite,
  requiere_pago,
  informacion_pago
FROM tramites
WHERE requiere_pago = 'Sí'
ORDER BY informacion_pago NULLS LAST;
*/