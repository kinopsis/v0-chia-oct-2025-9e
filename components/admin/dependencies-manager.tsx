"use client";

import { useState } from "react";
import { DependenciesList } from "./dependencies-list";
import { DependencyDialog } from "./dependency-dialog";
import { Button } from "@/components/ui/button";

import { Dependencia } from '@/lib/types-dependencias';

interface DependenciesManagerProps {
  dependencies: Dependencia[];
  canEdit: boolean;
  error?: string | null;
}

export function DependenciesManager({
  dependencies,
  canEdit,
  error
}: DependenciesManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDependency, setSelectedDependency] = useState<Dependencia | null>(null);
  const [dialogMode, setDialogMode] = useState<"edit" | "create">("edit");

  const handleEdit = (dependency: Dependencia) => {
    setSelectedDependency(dependency);
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  const handleCreateChild = (parentDependency?: Dependencia) => {
    setSelectedDependency(parentDependency || null);
    setDialogMode("create");
    setIsDialogOpen(true);
  };

  const handleDelete = (dependency: Dependencia) => {
    if (!canEdit) return;
    
    if (dependency.nivel >= 1) {
      alert("Acción no permitida: No se pueden eliminar subdependencias desde esta interfaz");
      return;
    }

    if (window.confirm(`¿Está seguro de que desea eliminar la dependencia "${dependency.nombre}"?`)) {
      alert("Eliminación no implementada: Esta funcionalidad está en desarrollo");
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedDependency(null);
  };

  const handleDialogSubmit = (dependencyData: any) => {
    alert("Acción no implementada: Las funciones de edición y creación están en desarrollo");
    handleDialogClose();
  };

  return (
    <>
      <DependenciesList
        dependencies={dependencies}
        canEdit={canEdit}
        error={error}
        onEdit={canEdit ? handleEdit : undefined}
        onDelete={canEdit ? handleDelete : undefined}
        onCreateChild={canEdit ? handleCreateChild : undefined}
      />

      {isDialogOpen && (
        <DependencyDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          mode={dialogMode}
          dependency={selectedDependency}
          onSave={handleDialogSubmit}
          canEdit={canEdit}
        />
      )}
    </>
  );
}