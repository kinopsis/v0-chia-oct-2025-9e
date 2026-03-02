-- Create tramites table for procedure management
CREATE TABLE IF NOT EXISTS tramites (
  id SERIAL PRIMARY KEY,
  nombre_tramite TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT NOT NULL,
  modalidad TEXT,
  formulario TEXT,
  dependencia_nombre TEXT,
  subdependencia_nombre TEXT,
  requiere_pago TEXT,
  tiempo_respuesta TEXT,
  requisitos TEXT,
  instrucciones TEXT,
  url_suit TEXT,
  url_gov TEXT,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tramites ENABLE ROW LEVEL SECURITY;

-- Policies for tramites table
-- Everyone can view active tramites (public access)
CREATE POLICY "Anyone can view active tramites"
  ON tramites FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Authenticated users can view all tramites (including inactive)
CREATE POLICY "Authenticated users can view all tramites"
  ON tramites FOR SELECT
  TO authenticated
  USING (true);

-- Admins and supervisors can insert tramites
CREATE POLICY "Admins and supervisors can insert tramites"
  ON tramites FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'supervisor')
    )
  );

-- Admins and supervisors can update tramites
CREATE POLICY "Admins and supervisors can update tramites"
  ON tramites FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'supervisor')
    )
  );

-- Only admins can delete tramites
CREATE POLICY "Only admins can delete tramites"
  ON tramites FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Trigger to update updated_at on tramites changes
CREATE TRIGGER update_tramites_updated_at
  BEFORE UPDATE ON tramites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_tramites_categoria ON tramites(categoria);
CREATE INDEX idx_tramites_dependencia ON tramites(dependencia_nombre);
CREATE INDEX idx_tramites_is_active ON tramites(is_active);
CREATE INDEX idx_tramites_created_at ON tramites(created_at DESC);
