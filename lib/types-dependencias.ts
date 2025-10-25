export interface Dependencia {
  id: number;
  codigo: string;
  sigla: string | null;
  nombre: string;
  tipo: 'dependencia' | 'subdependencia';
  dependencia_padre_id: number | null;
  nivel: number;
  orden: number;
  is_active: boolean;
  responsable?: string | null;
  correo_electronico?: string | null;
  extension_telefonica?: string | null;
  direccion?: string | null;
  horario_atencion?: string | null;
  telefono_directo?: string | null;
  enlace_web?: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DependenciaArbol extends Dependencia {
  hijos: DependenciaArbol[];
}

export interface DependenciaFormData {
  codigo: string;
  sigla: string | null;
  nombre: string;
  tipo: 'dependencia' | 'subdependencia';
  dependencia_padre_id: number | null;
  orden: number;
  is_active: boolean;
  responsable?: string | null;
  correo_electronico?: string | null;
  extension_telefonica?: string | null;
  direccion?: string | null;
  horario_atencion?: string | null;
  telefono_directo?: string | null;
  enlace_web?: string | null;
}

export interface ApiResponse<T> {
  data: T;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    total: number;
    pages: number;
    limit: number;
  };
  error: string | null;
  success: boolean;
}

export interface ImportDependenciasResult {
  success: boolean;
  total_imported: number;
  total_skipped: number;
  errors: Array<{
    row: number;
    error: string;
    data: Record<string, any>;
  }>;
  message: string;
}