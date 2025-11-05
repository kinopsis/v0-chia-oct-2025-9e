"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Plus, Download } from "lucide-react";

import { Dependencia } from '@/lib/types-dependencias';

interface DependencyActionsProps {
  dependency: Dependencia;
  onEdit: (dependency: Dependencia) => void;
  onDelete: (dependency: Dependencia) => void;
  onCreateChild: (parentDependency?: Dependencia) => void;
}

export function DependencyActions({
  dependency,
  onEdit,
  onDelete,
  onCreateChild
}: DependencyActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dependency-actions-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleExport = () => {
    const data = {
      id: dependency.id,
      codigo: dependency.codigo,
      sigla: dependency.sigla,
      nombre: dependency.nombre,
      tipo: dependency.tipo,
      nivel: dependency.nivel,
      is_active: dependency.is_active,
      created_at: dependency.created_at,
      updated_at: dependency.updated_at
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dependencia-${dependency.codigo}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dependency-actions-container relative">
      <Button
        variant="ghost"
        size="sm"
        className="opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 w-48 min-w-max">
          <button
            onClick={() => {
              onEdit(dependency);
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700"
          >
            <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Editar
          </button>

          <button
            onClick={() => {
              onCreateChild(dependency);
              setIsOpen(false);
            }}
            disabled={dependency.nivel >= 1}
            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-b border-gray-100 dark:border-gray-700"
          >
            <Plus className="h-4 w-4" />
            Nueva Subdependencia
          </button>

          <button
            onClick={() => {
              onDelete(dependency);
              setIsOpen(false);
            }}
            disabled={dependency.nivel >= 1}
            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed border-b border-gray-100 dark:border-gray-700"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>

          <button
            onClick={() => {
              handleExport();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4 text-green-600 dark:text-green-400" />
            Exportar
          </button>
        </div>
      )}
    </div>
  );
}