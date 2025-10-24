-- Create n8n_config table for AI integration settings
CREATE TABLE IF NOT EXISTS n8n_config (
  id SERIAL PRIMARY KEY,
  webhook_url TEXT NOT NULL,
  api_key TEXT,
  is_active BOOLEAN DEFAULT true,
  timeout_seconds INTEGER DEFAULT 30,
  max_retries INTEGER DEFAULT 3,
  custom_prompts JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE n8n_config ENABLE ROW LEVEL SECURITY;

-- Policies for n8n_config table
-- Only admins can view n8n config
CREATE POLICY "Only admins can view n8n config"
  ON n8n_config FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Only admins can modify n8n config
CREATE POLICY "Only admins can insert n8n config"
  ON n8n_config FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update n8n config"
  ON n8n_config FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Trigger to update updated_at on n8n_config changes
CREATE TRIGGER update_n8n_config_updated_at
  BEFORE UPDATE ON n8n_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default n8n configuration
INSERT INTO n8n_config (webhook_url, is_active, custom_prompts)
VALUES (
  'https://your-n8n-instance.com/webhook/chat',
  false,
  '{"system_prompt": "Eres un asistente virtual del Municipio de Chía. Ayuda a los ciudadanos con información sobre trámites y servicios municipales.", "greeting": "Hola, soy el asistente virtual de la Alcaldía de Chía. ¿En qué puedo ayudarte hoy?"}'
)
ON CONFLICT DO NOTHING;
