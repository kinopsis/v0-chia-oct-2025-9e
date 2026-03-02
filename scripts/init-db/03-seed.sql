-- =============================================================================
-- SEED DATA CONSOLIDADO
-- =============================================================================

-- 1. Default n8n Configuration
INSERT INTO n8n_config (webhook_url, is_active, custom_prompts)
VALUES (
  'https://your-n8n-instance.com/webhook/chat',
  false,
  '{"system_prompt": "Eres un asistente virtual del Municipio de Chía. Ayuda a los ciudadanos con información sobre trámites y servicios municipales.", "greeting": "Hola, soy el asistente virtual de la Alcaldía de Chía. ¿En qué puedo ayudarte hoy?"}'
)
ON CONFLICT DO NOTHING;

-- 2. Security: Ensure Row Level Security is NOT bypassed by default
-- (Policies should be applied in a separate migration or via UI if dynamic)

-- 3. Policy Template (Admins see everything)
CREATE POLICY "Admins bypass RLS" ON profiles FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins bypass RLS" ON tramites FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins bypass RLS" ON dependencias FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins bypass RLS" ON n8n_config FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins bypass RLS" ON audit_logs FOR SELECT TO authenticated USING (auth.jwt()->>'role' = 'admin');
