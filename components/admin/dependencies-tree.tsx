"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Building2, 
  Folder, 
  File, 
  MoreHorizontal, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { DependencyDialog } from "./dependency-dialog";
import { DependencyActions } from "./dependency-actions";

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
  created_at: string;
  updated_at: string;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  horario_atencion?: string | null;
}

interface DependenciesTreeProps {
  dependencies: Dependencia[];
  canEdit: boolean;
  error?: string | null;
}

export function DependenciesTree({ dependencies, canEdit, error }: DependenciesTreeProps) {
  const [treeData, setTreeData] = useState<Dependencia[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [selectedDependency, setSelectedDependency] = useState<Dependencia | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");

  useEffect(() => {
    setTreeData(dependencies);
  }, [dependencies]);

  const toggleNode = (id: number) => {
    const newExpandedNodes = new Set(expandedNodes);
    if (newExpandedNodes.has(id)) {
      newExpandedNodes.delete(id);
    } else {
      newExpandedNodes.add(id);
    }
    setExpandedNodes(newExpandedNodes);
  };

  const handleCreate = (parentDependency?: Dependencia) => {
    setDialogMode("create");
    setSelectedDependency(parentDependency || null);
    setShowDialog(true);
  };

  const handleEdit = (dependency: Dependencia) => {
    setDialogMode("edit");
    setSelectedDependency(dependency);
    setShowDialog(true);
  };

  const handleDelete = async (dependency: Dependencia) => {
    if (!confirm(`¿Está seguro de eliminar la dependencia "${dependency.nombre}"?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/dependencias/${dependency.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setTreeData(prev => prev.filter(d => d.id !== dependency.id));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      alert('Error al eliminar la dependencia');
    }
  };

  const handleDialogSave = (newDependency: Dependencia) => {
    if (dialogMode === "create") {
      setTreeData(prev => [...prev, newDependency]);
    } else {
      setTreeData(prev => 
        prev.map(d => d.id === newDependency.id ? newDependency : d)
      );
    }
    setShowDialog(false);
  };

  const renderTree = (dependencies: Dependencia[], level = 0) => {
    return dependencies
      .filter(dep => dep.nivel === level)
      .map((dependency) => {
        const hasChildren = dependencies.some(child => child.dependencia_padre_id === dependency.id);
        const isExpanded = expandedNodes.has(dependency.id);
        
        return (
          <div key={dependency.id} className="mb-2">
            <div 
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                dependency.is_active 
                  ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                  : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-75'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleNode(dependency.id)}
                    className="h-8 w-8 p-0"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
                
                <div className="flex items-center gap-3">
                  {dependency.tipo === 'dependencia' ? (
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Folder className="h-4 w-4 text-green-600 dark:text-green-400" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white truncate">
                        {dependency.nombre}
                      </span>
                      <Badge 
                        variant={dependency.is_active ? "default" : "secondary"}
                        className={dependency.is_active ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"}
                      >
                        {dependency.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Código: {dependency.codigo}</span>
                      {dependency.sigla && <span>Sigla: {dependency.sigla}</span>}
                      <span className="capitalize">Tipo: {dependency.tipo}</span>
                    </div>
                    
                    {/* Información de contacto */}
                    {(dependency.telefono || dependency.email || dependency.direccion || dependency.horario_atencion) && (
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mt-1 pt-1 border-t border-gray-100 dark:border-gray-700">
                        {dependency.telefono && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Tel:</span>
                            <span>{dependency.telefono}</span>
                          </div>
                        )}
                        {dependency.email && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Email:</span>
                            <span className="text-blue-600 dark:text-blue-400">{dependency.email}</span>
                          </div>
                        )}
                        {dependency.direccion && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Dir:</span>
                            <span className="text-gray-500 dark:text-gray-400">{dependency.direccion}</span>
                          </div>
                        )}
                        {dependency.horario_atencion && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Horario:</span>
                            <span className="text-gray-500 dark:text-gray-400">{dependency.horario_atencion}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {canEdit && (
                <DependencyActions
                  dependency={dependency}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onCreateChild={handleCreate}
                />
              )}
            </div>

            {hasChildren && isExpanded && (
              <div className="ml-8 mt-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                {renderTree(dependencies, level + 1)}
              </div>
            )}
          </div>
        );
      });
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Árbol de Dependencias</CardTitle>
          <CardDescription>Visualización jerárquica de dependencias y subdependencias</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              No se pudieron cargar las dependencias: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={viewMode === "tree" ? "block" : "hidden"}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Árbol de Dependencias</CardTitle>
            <CardDescription>Visualización jerárquica de dependencias y subdependencias</CardDescription>
          </div>
          {canEdit && (
            <Button 
              onClick={() => handleCreate()} 
              className="gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Nueva Dependencia
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {treeData.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay dependencias</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {canEdit 
                ? "Comience creando su primera dependencia" 
                : "No se han encontrado dependencias para mostrar"
              }
            </p>
            {canEdit && (
              <Button onClick={() => handleCreate()} className="gap-2">
                <Plus className="h-4 w-4" />
                Crear Primera Dependencia
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {renderTree(treeData)}
          </div>
        )}
      </CardContent>

      <DependencyDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        mode={dialogMode}
        dependency={selectedDependency}
        onSave={handleDialogSave}
        canEdit={canEdit}
      />
    </Card>
  );
}