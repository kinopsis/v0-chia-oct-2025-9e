-- Seed default n8n configuration
-- This script can be run independently after tables are created

INSERT INTO n8n_config (
  webhook_url, 
  is_active, 
  timeout_seconds,
  max_retries,
  custom_prompts,
  metadata
)
VALUES (
  'https://your-n8n-instance.com/webhook/chat',
  false,
  30,
  3,
  jsonb_build_object(
    'system_prompt', 'Eres un asistente virtual del Municipio de Chía, Colombia. Ayuda a los ciudadanos con información sobre trámites y servicios municipales. Sé amable, claro y conciso en tus respuestas.',
    'greeting', '¡Hola! Soy el asistente virtual de la Alcaldía de Chía. ¿En qué puedo ayudarte hoy?',
    'fallback_message', 'Lo siento, no pude procesar tu solicitud. Por favor contacta a nuestros puntos PACO para asistencia directa.'
  ),
  jsonb_build_object(
    'version', '1.0',
    'last_updated', NOW()
  )
)
ON CONFLICT DO NOTHING;

-- Verify the insert
SELECT 
  id, 
  webhook_url, 
  is_active, 
  timeout_seconds,
  max_retries,
  custom_prompts->>'greeting' as greeting_message,
  created_at
FROM n8n_config
LIMIT 1;
