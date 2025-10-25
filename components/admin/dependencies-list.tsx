"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search, Building2, Folder, MoreHorizontal, Eye, EyeOff } from "lucide-react";
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
  telefono_directo?: string | null;
  correo_electronico?: string | null;
  direccion?: string | null;
  horario_atencion?: string | null;
  parent?: {
    nombre: string;
    codigo: string;
  };
}

interface DependenciesListProps {
  dependencies: Dependencia[];
  canEdit: boolean;
  error?: string | null;
  onEdit?: (dependency: Dependencia) => void;
  onDelete?: (dependency: Dependencia) => void;
  onCreateChild?: (parentDependency?: Dependencia) => void;
}

export function DependenciesList({ dependencies, canEdit, error, onEdit, onDelete, onCreateChild }: DependenciesListProps) {
  const [filteredDependencies, setFilteredDependencies] = useState<Dependencia[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [viewMode, setViewMode] = useState<"tree" | "list">("list");

  useEffect(() => {
    let filtered = [...dependencies];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(dep =>
        dep.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dep.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dep.sigla && dep.sigla.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dep.telefono_directo && dep.telefono_directo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (dep.direccion && dep.direccion.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply type filter
    if (filterType) {
      filtered = filtered.filter(dep => dep.tipo === filterType);
    }

    // Apply status filter
    if (filterStatus !== "") {
      filtered = filtered.filter(dep => dep.is_active === (filterStatus === "true"));
    }

    setFilteredDependencies(filtered);
  }, [dependencies, searchTerm, filterType, filterStatus]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Dependencias</CardTitle>
          <CardDescription>Vista detallada de todas las dependencias</CardDescription>
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
    <Card className={viewMode === "list" ? "block" : "hidden"}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lista de Dependencias</CardTitle>
            <CardDescription>Vista detallada de todas las dependencias</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Buscar dependencias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-sm"
                aria-label="Filtrar por tipo de dependencia"
              >
                <option value="">Todos los tipos</option>
                <option value="dependencia">Dependencias</option>
                <option value="subdependencia">Subdependencias</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-sm"
                aria-label="Filtrar por estado de dependencia"
              >
                <option value="">Todos los estados</option>
                <option value="true">Activas</option>
                <option value="false">Inactivas</option>
              </select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredDependencies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No se encontraron dependencias</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filterType || filterStatus !== ""
                ? "No hay dependencias que coincidan con los filtros aplicados"
                : "No hay dependencias para mostrar"
              }
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Código</TableHead>
                  <TableHead className="w-20">Sigla</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="w-32">Teléfono</TableHead>
                  <TableHead className="w-40">Dirección</TableHead>
                  <TableHead className="w-32">Contacto</TableHead>
                  <TableHead className="w-24">Estado</TableHead>
                  <TableHead className="w-20 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDependencies.map((dependency) => (
                  <TableRow key={dependency.id} className="group">
                    <TableCell className="font-medium">
                      {dependency.codigo}
                    </TableCell>
                    <TableCell>
                      {dependency.sigla || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {dependency.tipo === 'dependencia' ? (
                          <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Folder className="h-4 w-4 text-green-600 dark:text-green-400" />
                        )}
                        <span className="font-medium">{dependency.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {dependency.telefono_directo && (
                          <div className="text-sm">
                            <span className="text-gray-900 dark:text-white">{dependency.telefono_directo}</span>
                          </div>
                        )}
                        {dependency.correo_electronico && (
                          <div className="text-sm">
                            <span className="text-blue-600 dark:text-blue-400">{dependency.correo_electronico}</span>
                          </div>
                        )}
                        {!dependency.telefono_directo && !dependency.correo_electronico && (
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Sin teléfono</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {dependency.direccion ? (
                        <span className="text-sm text-gray-900 dark:text-gray-400">{dependency.direccion}</span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Sin dirección</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {dependency.horario_atencion && (
                          <div className="text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Horario:</span>
                            <span className="text-gray-900 dark:text-white ml-1">{dependency.horario_atencion}</span>
                          </div>
                        )}
                        {!dependency.horario_atencion && (
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Sin horario</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={dependency.is_active ? "default" : "secondary"}
                        className={dependency.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                        }
                      >
                        {dependency.is_active ? (
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 bg-green-500 rounded-full" />
                            Activa
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 bg-gray-500 rounded-full" />
                            Inactiva
                          </div>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {canEdit && (onEdit || onDelete || onCreateChild) ? (
                        <DependencyActions
                          dependency={dependency}
                          onEdit={onEdit || (() => {})}
                          onDelete={onDelete || (() => {})}
                          onCreateChild={onCreateChild || (() => {})}
                        />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
          <span>
            Mostrando {filteredDependencies.length} de {dependencies.length} dependencias
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Dependencias: {dependencies.filter(d => d.tipo === 'dependencia').length}</span>
            </div>
            <div className="flex items-center gap-1">
              <Folder className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span>Subdependencias: {dependencies.filter(d => d.tipo === 'subdependencia').length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}