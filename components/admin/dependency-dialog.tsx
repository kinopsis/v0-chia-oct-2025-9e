"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Folder } from "lucide-react";

interface Dependencia {
  id?: number;
  codigo: string;
  sigla: string | null;
  nombre: string;
  tipo: 'dependencia' | 'subdependencia';
  dependencia_padre_id: number | null;
  nivel: number;
  orden: number;
  is_active: boolean;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  horario_atencion?: string | null;
}

interface DependencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  dependency?: Dependencia | null;
  onSave: (dependency: Dependencia) => void;
  canEdit: boolean;
}

export function DependencyDialog({
  open,
  onOpenChange,
  mode,
  dependency,
  onSave,
  canEdit
}: DependencyDialogProps) {
  const [formData, setFormData] = useState<Dependencia>({
    codigo: "",
    sigla: "",
    nombre: "",
    tipo: "subdependencia",
    dependencia_padre_id: null,
    nivel: 0,
    orden: 0,
    is_active: true,
    telefono: "",
    email: "",
    direccion: "",
    horario_atencion: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Efecto para cargar los datos de la dependencia cuando cambia
  useEffect(() => {
    if (open && dependency && mode === "edit") {
      setFormData({
        codigo: dependency.codigo || "",
        sigla: dependency.sigla || "",
        nombre: dependency.nombre || "",
        tipo: dependency.tipo || "subdependencia",
        dependencia_padre_id: dependency.dependencia_padre_id || null,
        nivel: dependency.nivel || 0,
        orden: dependency.orden || 0,
        is_active: dependency.is_active !== false,
        telefono: dependency.telefono || "",
        email: dependency.email || "",
        direccion: dependency.direccion || "",
        horario_atencion: dependency.horario_atencion || "",
      });
    } else if (open && mode === "create") {
      // Resetear formulario para creación
      setFormData({
        codigo: "",
        sigla: "",
        nombre: "",
        tipo: "subdependencia",
        dependencia_padre_id: null,
        nivel: 0,
        orden: 0,
        is_active: true,
        telefono: "",
        email: "",
        direccion: "",
        horario_atencion: "",
      });
    }
  }, [open, dependency, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validación básica
    const newErrors: Record<string, string> = {};
    if (!formData.codigo.trim()) newErrors.codigo = "El código es requerido";
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!formData.tipo) newErrors.tipo = "El tipo es requerido";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/admin/dependencias${mode === "edit" && dependency?.id ? `/${dependency.id}` : ""}`, {
        method: mode === "edit" ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        onSave(result.data);
        onOpenChange(false);
        setFormData({
          codigo: "",
          sigla: "",
          nombre: "",
          tipo: "subdependencia",
          dependencia_padre_id: null,
          nivel: 0,
          orden: 0,
          is_active: true,
          telefono: "",
          email: "",
          direccion: "",
          horario_atencion: "",
        });
      } else {
        setErrors({ general: result.error || "Error al guardar la dependencia" });
      }
    } catch (error) {
      setErrors({ general: "Error de conexión" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Dependencia, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nueva Dependencia" : "Editar Dependencia"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Cree una nueva dependencia o subdependencia para el municipio de Chía"
              : "Actualice la información de la dependencia seleccionada"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <Alert variant="destructive">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => handleInputChange("codigo", e.target.value)}
                disabled={!canEdit}
                placeholder="Ej: 001, DA, SP"
              />
              {errors.codigo && <p className="text-sm text-red-600">{errors.codigo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sigla">Sigla</Label>
              <Input
                id="sigla"
                value={formData.sigla || ""}
                onChange={(e) => handleInputChange("sigla", e.target.value)}
                disabled={!canEdit}
                placeholder="Ej: OAJ, OC, DSP"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange("nombre", e.target.value)}
              disabled={!canEdit}
              placeholder="Nombre completo de la dependencia"
            />
            {errors.nombre && <p className="text-sm text-red-600">{errors.nombre}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => handleInputChange("tipo", value as 'dependencia' | 'subdependencia')}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dependencia">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      Dependencia Principal
                    </div>
                  </SelectItem>
                  <SelectItem value="subdependencia">
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-green-600" />
                      Subdependencia
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo && <p className="text-sm text-red-600">{errors.tipo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_active">Estado</Label>
              <Select
                value={formData.is_active ? "true" : "false"}
                onValueChange={(value) => handleInputChange("is_active", value === "true")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activa</SelectItem>
                  <SelectItem value="false">Inactiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Información de Contacto</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono || ""}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                  disabled={!canEdit}
                  placeholder="Ej: 311 123 4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!canEdit}
                  placeholder="Ej: contacto@dependencia.gov.co"
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="direccion">Dirección</Label>
              <Textarea
                id="direccion"
                value={formData.direccion || ""}
                onChange={(e) => handleInputChange("direccion", e.target.value)}
                disabled={!canEdit}
                placeholder="Dirección física de la dependencia"
                rows={2}
              />
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="horario_atencion">Horario de Atención</Label>
              <Textarea
                id="horario_atencion"
                value={formData.horario_atencion || ""}
                onChange={(e) => handleInputChange("horario_atencion", e.target.value)}
                disabled={!canEdit}
                placeholder="Ej: Lunes a Viernes 8:00 - 17:00"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!canEdit || isSubmitting}>
              {isSubmitting ? "Guardando..." : mode === "create" ? "Crear Dependencia" : "Actualizar Dependencia"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}