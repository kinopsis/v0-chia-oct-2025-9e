-- Create dependencias table for hierarchical dependency management
CREATE TABLE IF NOT EXISTS dependencias (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(10) NOT NULL UNIQUE,
  sigla VARCHAR(10) UNIQUE,
  nombre TEXT NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('dependencia', 'subdependencia')),
  dependencia_padre_id INTEGER REFERENCES dependencias(id),
  nivel INTEGER NOT NULL DEFAULT 0 CHECK (nivel >= 0),
  orden INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE dependencias ENABLE ROW LEVEL SECURITY;

-- Policies for dependencias table
-- Everyone can view active dependencias (public access for trámite forms)
CREATE POLICY "Anyone can view active dependencias"
  ON dependencias FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Authenticated users can view all dependencias (including inactive)
CREATE POLICY "Authenticated users can view all dependencias"
  ON dependencias FOR SELECT
  TO authenticated
  USING (true);

-- Admins and supervisors can insert dependencias
CREATE POLICY "Admins and supervisors can insert dependencias"
  ON dependencias FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'supervisor')
    )
  );

-- Admins and supervisors can update dependencias
CREATE POLICY "Admins and supervisors can update dependencias"
  ON dependencias FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'supervisor')
    )
  );

-- Only admins can delete dependencias
CREATE POLICY "Only admins can delete dependencias"
  ON dependencias FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Trigger to update updated_at on dependencias changes
CREATE TRIGGER update_dependencias_updated_at
  BEFORE UPDATE ON dependencias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_dependencias_codigo ON dependencias(codigo);
CREATE INDEX idx_dependencias_sigla ON dependencias(sigla);
CREATE INDEX idx_dependencias_tipo ON dependencias(tipo);
CREATE INDEX idx_dependencias_nivel ON dependencias(nivel);
CREATE INDEX idx_dependencias_padre ON dependencias(dependencia_padre_id);
CREATE INDEX idx_dependencias_is_active ON dependencias(is_active);
CREATE INDEX idx_dependencias_created_at ON dependencias(created_at DESC);
CREATE INDEX idx_dependencias_hierarchical ON dependencias(nivel, dependencia_padre_id, orden);

-- Function to validate hierarchical relationships
CREATE OR REPLACE FUNCTION validate_dependencia_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
  -- Check that a dependencia cannot be its own parent
  IF NEW.dependencia_padre_id = NEW.id THEN
    RAISE EXCEPTION 'Una dependencia no puede ser su propia padre';
  END IF;
  
  -- Check that subdependencias have a parent and dependencias don't
  IF NEW.tipo = 'subdependencia' AND NEW.dependencia_padre_id IS NULL THEN
    RAISE EXCEPTION 'Las subdependencias deben tener una dependencia padre';
  END IF;
  
  IF NEW.tipo = 'dependencia' AND NEW.dependencia_padre_id IS NOT NULL THEN
    RAISE EXCEPTION 'Las dependencias principales no pueden tener padre';
  END IF;
  
  -- Set nivel based on parent
  IF NEW.dependencia_padre_id IS NOT NULL THEN
    SELECT nivel + 1 INTO NEW.nivel
    FROM dependencias
    WHERE id = NEW.dependencia_padre_id;
  ELSE
    NEW.nivel := 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate hierarchy
CREATE TRIGGER validate_dependencia_hierarchy_trigger
  BEFORE INSERT OR UPDATE ON dependencias
  FOR EACH ROW
  EXECUTE FUNCTION validate_dependencia_hierarchy();

-- Function to check if dependencia can be deleted (no tramites associated)
CREATE OR REPLACE FUNCTION can_delete_dependencia(p_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  tramite_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO tramite_count
  FROM tramites
  WHERE dependencia_id = p_id OR subdependencia_id = p_id;
  
  RETURN tramite_count = 0;
END;
$$ LANGUAGE plpgsql;