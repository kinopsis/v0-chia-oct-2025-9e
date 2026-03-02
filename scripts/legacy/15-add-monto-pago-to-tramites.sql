-- Add monto_pago field to tramites table
-- This field stores the payment amount for procedures that require payment

-- Add monto_pago column to tramites table
ALTER TABLE tramites
ADD COLUMN IF NOT EXISTS monto_pago TEXT;

-- Add comment explaining the purpose of the monto_pago field
COMMENT ON COLUMN tramites.monto_pago IS 'Monto del pago asociado al trámite cuando requiere_pago = ''Sí''';

-- Create index for better performance when filtering by monto_pago
CREATE INDEX IF NOT EXISTS idx_tramites_monto_pago ON tramites(monto_pago);

-- Function to validate monto_pago values based on requiere_pago
CREATE OR REPLACE FUNCTION validate_tramite_monto_pago()
RETURNS TRIGGER AS $$
BEGIN
  -- If requiere_pago is 'Sí', monto_pago should be provided (non-empty string)
  IF NEW.requiere_pago = 'Sí' THEN
    IF NEW.monto_pago IS NULL OR NEW.monto_pago = '' THEN
      RAISE EXCEPTION 'El campo monto_pago es obligatorio cuando requiere_pago = ''Sí''';
    END IF;
  END IF;
  
  -- If requiere_pago is not 'Sí', monto_pago should be NULL
  IF NEW.requiere_pago != 'Sí' THEN
    NEW.monto_pago := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate monto_pago values
CREATE TRIGGER validate_tramite_monto_pago_trigger
  BEFORE INSERT OR UPDATE ON tramites
  FOR EACH ROW
  EXECUTE FUNCTION validate_tramite_monto_pago();

-- Instructions for updating existing tramites with payment requirements:
/*
To update existing tramites that require payment, run queries like:

UPDATE tramites
SET monto_pago = 'Variable según caso'
WHERE requiere_pago = 'Sí'
  AND nombre_tramite LIKE '%licencia%';

UPDATE tramites
SET monto_pago = 'Consultar valor'
WHERE requiere_pago = 'Sí'
  AND nombre_tramite LIKE '%permiso%';

-- Verify the changes
SELECT
  id,
  nombre_tramite,
  requiere_pago,
  monto_pago
FROM tramites
WHERE requiere_pago = 'Sí'
ORDER BY monto_pago NULLS LAST;
*/