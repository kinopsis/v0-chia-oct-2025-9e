-- =============================================================================
-- FUNCTIONS AND TRIGGERS CONSOLIDADO
-- =============================================================================

-- 1. Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Handle New User (Auth -> Public Profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'funcionario')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Audit Logging Function
CREATE OR REPLACE FUNCTION log_action()
RETURNS TRIGGER AS $$
DECLARE
  v_user_email TEXT;
BEGIN
  -- We assume auth.uid() is available in a Supabase context
  SELECT email INTO v_user_email FROM profiles WHERE id = auth.uid();
  
  INSERT INTO audit_logs (user_id, user_email, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    v_user_email,
    TG_OP,
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id::TEXT
      ELSE NEW.id::TEXT
    END,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  
  IF (TG_OP = 'DELETE') THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Hierarchy Validation for Dependencias
CREATE OR REPLACE FUNCTION validate_dependencia_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dependencia_padre_id = NEW.id THEN
    RAISE EXCEPTION 'Una dependencia no puede ser su propia padre';
  END IF;
  
  IF NEW.tipo = 'subdependencia' AND NEW.dependencia_padre_id IS NULL THEN
    RAISE EXCEPTION 'Las subdependencias deben tener una dependencia padre';
  END IF;
  
  IF NEW.tipo = 'dependencia' AND NEW.dependencia_padre_id IS NOT NULL THEN
    RAISE EXCEPTION 'Las dependencias principales no pueden tener padre';
  END IF;
  
  IF NEW.dependencia_padre_id IS NOT NULL THEN
    SELECT nivel + 1 INTO NEW.nivel FROM dependencias WHERE id = NEW.dependencia_padre_id;
  ELSE
    NEW.nivel := 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Dependency Tree Helper
CREATE OR REPLACE FUNCTION get_dependencias_arbol()
RETURNS TABLE(id BIGINT, codigo VARCHAR(10), sigla VARCHAR(10), nombre VARCHAR(255), tipo VARCHAR(50), nivel INTEGER, orden INTEGER, is_active BOOLEAN, dependencia_padre_id BIGINT, path TEXT) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE dependencias_tree AS (
        SELECT d.id, d.codigo, d.sigla, d.nombre, d.tipo, d.nivel, d.orden, d.is_active, d.dependencia_padre_id, CAST(d.codigo AS TEXT) as path
        FROM dependencias d
        WHERE d.nivel = 0 AND d.is_active = true
        UNION ALL
        SELECT d.id, d.codigo, d.sigla, d.nombre, d.tipo, d.nivel, d.orden, d.is_active, d.dependencia_padre_id, CAST(dt.path || ' > ' || d.codigo AS TEXT) as path
        FROM dependencias d
        INNER JOIN dependencias_tree dt ON d.dependencia_padre_id = dt.id
        WHERE d.is_active = true
    )
    SELECT * FROM dependencias_tree ORDER BY path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- APPLY TRIGGERS
-- =============================================================================

-- Updated At Triggers
DO $$ 
DECLARE 
  t text;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles', 'dependencias', 'tramites', 'n8n_config')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS tr_updated_at ON %I', t);
    EXECUTE format('CREATE TRIGGER tr_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t);
  END LOOP;
END $$;

-- Auth User Created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Audit Triggers (Log changes for key tables)
DROP TRIGGER IF EXISTS tr_audit_tramites ON tramites;
CREATE TRIGGER tr_audit_tramites AFTER INSERT OR UPDATE OR DELETE ON tramites FOR EACH ROW EXECUTE FUNCTION log_action();

DROP TRIGGER IF EXISTS tr_audit_dependencias ON dependencias;
CREATE TRIGGER tr_audit_dependencias AFTER INSERT OR UPDATE OR DELETE ON dependencias FOR EACH ROW EXECUTE FUNCTION log_action();

-- Hierarchy Validation
DROP TRIGGER IF EXISTS tr_validate_dep_hierarchy ON dependencias;
CREATE TRIGGER tr_validate_dep_hierarchy BEFORE INSERT OR UPDATE ON dependencias FOR EACH ROW EXECUTE FUNCTION validate_dependencia_hierarchy();
