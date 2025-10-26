"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Building2, Folder, AlertTriangle } from "lucide-react";

interface Dependencia {
  id: number;
  codigo: string;
  sigla: string | null;
  nombre: string;
  tipo: 'dependencia' | 'subdependencia';
  dependencia_padre_id: number | null;
  nivel: number;
  orden: number;
  is_active: boolean;
}

interface DependencySelectorProps {
  value: number | null;
  onChange: (value: number | null) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  tipo?: 'dependencia' | 'subdependencia';
  parentDependencyId?: number | null;
  className?: string;
}

export function DependencySelector({
  value,
  onChange,
  label = "Dependencia",
  placeholder = "Seleccione una dependencia",
  error,
  disabled = false,
  required = false,
  tipo,
  parentDependencyId,
  className = ""
}: DependencySelectorProps) {
  const [dependencies, setDependencies] = useState<Dependencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDependencies();
  }, []);

  const fetchDependencies = async () => {
    try {
      let url = '/api/admin/dependencias?is_active=true';
      
      if (tipo) {
        url += `&tipo=${tipo}`;
      }
      
      if (parentDependencyId !== undefined) {
        url += `&dependencia_padre_id=${parentDependencyId}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setDependencies(data.data || []);
      } else {
        console.error('Error fetching dependencies:', data.error);
      }
    } catch (error) {
      console.error('Error fetching dependencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDependencies = dependencies.filter(dep => {
    const matchesSearch = !searchTerm || 
      dep.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dep.sigla && dep.sigla.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesParent = parentDependencyId === undefined || 
      dep.dependencia_padre_id === parentDependencyId;
    
    return matchesSearch && matchesParent;
  });

  const selectedDependency = dependencies.find(dep => dep.id === value);

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={`dependency-${label.toLowerCase()}`} className="mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      {loading ? (
        <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Cargando dependencias...</span>
        </div>
      ) : (
        <div className="space-y-2">
          <Select 
            value={value?.toString() || ""} 
            onValueChange={(val) => onChange(val ? parseInt(val) : null)}
            disabled={disabled || loading}
          >
            <SelectTrigger 
              id={`dependency-${label.toLowerCase()}`}
              className={error ? "border-red-500" : ""}
            >
              <SelectValue placeholder={placeholder}>
                {selectedDependency ? (
                  <div className="flex items-center gap-2">
                    {selectedDependency.tipo === 'dependencia' ? (
                      <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Folder className="h-4 w-4 text-green-600 dark:text-green-400" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {selectedDependency.nombre}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedDependency.codigo} {selectedDependency.sigla && `• ${selectedDependency.sigla}`}
                      </div>
                    </div>
                  </div>
                ) : (
                  placeholder
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {filteredDependencies.length === 0 ? (
                <div className="p-4 text-center">
                  <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No hay dependencias disponibles</p>
                </div>
              ) : (
                filteredDependencies.map((dependency) => (
                  <SelectItem 
                    key={dependency.id} 
                    value={dependency.id.toString()}
                    className="flex items-center gap-2"
                  >
                    {dependency.tipo === 'dependencia' ? (
                      <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Folder className="h-4 w-4 text-green-600 dark:text-green-400" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{dependency.nombre}</div>
                      <div className="text-sm text-gray-500">
                        {dependency.codigo} {dependency.sigla && `• ${dependency.sigla}`}
                      </div>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {searchTerm && filteredDependencies.length === 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  No se encontraron dependencias que coincidan con "{searchTerm}"
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {selectedDependency && (
        <div className="mt-2">
          <Badge 
            variant="outline" 
            className={selectedDependency.is_active 
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
            }
          >
            {selectedDependency.is_active ? "Activa" : "Inactiva"}
          </Badge>
        </div>
      )}
    </div>
  );
}

interface DependencyPairSelectorProps {
  dependenciaId: number | null;
  subdependenciaId: number | null;
  onDependenciaChange: (id: number | null) => void;
  onSubdependenciaChange: (id: number | null) => void;
  dependenciaError?: string;
  subdependenciaError?: string;
  disabled?: boolean;
  required?: boolean;
}

export function DependencyPairSelector({
  dependenciaId,
  subdependenciaId,
  onDependenciaChange,
  onSubdependenciaChange,
  dependenciaError,
  subdependenciaError,
  disabled = false,
  required = false
}: DependencyPairSelectorProps) {
  const [subdependencies, setSubdependencies] = useState<Dependencia[]>([]);

  // Efecto inicial para cargar subdependencias cuando ya hay una dependencia seleccionada
  useEffect(() => {
    if (dependenciaId) {
      fetchSubdependencies(dependenciaId);
    }
  }, []);

  useEffect(() => {
    if (dependenciaId) {
      fetchSubdependencies(dependenciaId);
    } else {
      setSubdependencies([]);
      onSubdependenciaChange(null);
    }
  }, [dependenciaId]);

  useEffect(() => {
    // Validar que la subdependencia seleccionada pertenezca a la dependencia actual
    if (dependenciaId && subdependenciaId && subdependencies.length > 0) {
      const isValidSubdependency = subdependencies.some((dep: Dependencia) => dep.id === subdependenciaId)
      if (!isValidSubdependency) {
        // La subdependencia no pertenece a esta dependencia, limpiarla
        onSubdependenciaChange(null)
      }
    } else if (dependenciaId && subdependenciaId && subdependencies.length === 0) {
      // Las subdependencias aún no se han cargado, no hacer nada
    } else if (!dependenciaId && subdependenciaId) {
      // No hay dependencia pero hay subdependencia, limpiarla
      onSubdependenciaChange(null);
    }
  }, [dependenciaId, subdependenciaId, subdependencies]);

  const fetchSubdependencies = async (parentId: number) => {
    try {
      const response = await fetch(`/api/admin/dependencias/${parentId}/hijos?is_active=true`);
      const data = await response.json();
      
      if (response.ok) {
        const subdeps = data.data || [];
        setSubdependencies(subdeps);
        
        // Si hay una subdependencia previamente seleccionada, validar que esté en la nueva lista
        if (subdependenciaId) {
          const isValidSubdependency = subdeps.some((dep: Dependencia) => dep.id === subdependenciaId);
          if (!isValidSubdependency) {
            onSubdependenciaChange(null);
          }
        }
      } else {
        console.error('Error fetching subdependencies:', data.error);
        setSubdependencies([]);
        if (subdependenciaId) {
          onSubdependenciaChange(null);
        }
      }
    } catch (error) {
      console.error('Error fetching subdependencies:', error);
      setSubdependencies([]);
      if (subdependenciaId) {
        onSubdependenciaChange(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <DependencySelector
        value={dependenciaId}
        onChange={onDependenciaChange}
        label="Dependencia"
        placeholder="Seleccione la dependencia principal"
        error={dependenciaError}
        disabled={disabled}
        required={required}
        tipo="dependencia"
      />

      <DependencySelector
        value={subdependenciaId}
        onChange={onSubdependenciaChange}
        label="Subdependencia"
        placeholder="Seleccione la subdependencia (opcional)"
        error={subdependenciaError}
        disabled={disabled || !dependenciaId}
        tipo="subdependencia"
        parentDependencyId={dependenciaId}
      />

      {dependenciaId && subdependenciaId && (
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
          <AlertTitle className="text-blue-800 dark:text-blue-200">
            Dependencia Seleccionada
          </AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>Trámite asociado a la dependencia y subdependencia seleccionadas</span>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}