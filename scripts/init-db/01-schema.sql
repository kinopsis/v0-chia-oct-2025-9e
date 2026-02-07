-- =============================================================================
-- DATABASE SCHEMA CONSOLIDADO - MUNICIPIO DE CHÍA
-- =============================================================================

-- 1. PROFILES (User Management)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'funcionario' CHECK (role IN ('admin', 'funcionario', 'supervisor')),
  dependencia TEXT,
  subdependencia TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DEPENDENCIAS (Hierarchical Management)
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

-- 3. TRAMITES (Procedure Management)
CREATE TABLE IF NOT EXISTS tramites (
  id SERIAL PRIMARY KEY,
  nombre_tramite TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT NOT NULL,
  modalidad TEXT,
  formulario TEXT,
  dependencia_id INTEGER REFERENCES dependencias(id),
  subdependencia_id INTEGER REFERENCES dependencias(id),
  dependencia_nombre TEXT, -- Legacy field
  subdependencia_nombre TEXT, -- Legacy field
  requiere_pago TEXT,
  monto_pago DECIMAL DEFAULT 0,
  informacion_pago JSONB,
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

-- 4. AUDIT_LOGS (Tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  user_email TEXT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. N8N_CONFIG (AI integration)
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

-- RLS ENABLING
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE tramites ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_config ENABLE ROW LEVEL SECURITY;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_tramites_categoria ON tramites(categoria);
CREATE INDEX IF NOT EXISTS idx_tramites_dependencia_id ON tramites(dependencia_id);
CREATE INDEX IF NOT EXISTS idx_tramites_is_active ON tramites(is_active);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dependencias_hierarchical ON dependencias(nivel, dependencia_padre_id, orden);
