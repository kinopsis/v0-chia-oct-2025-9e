"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Building2, Folder, Users, Info } from "lucide-react";
import Link from "next/link";

interface DependenciesHeaderProps {
  canEdit: boolean;
}

export function DependenciesHeader({ canEdit }: DependenciesHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <CardTitle>Panel de Control de Dependencias</CardTitle>
              <CardDescription>
                Gestión completa de la estructura organizativa del municipio
              </CardDescription>
            </div>
          </div>
          
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-md">
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Dependencias Principales</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Nivel 0 - Estructura superior</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-md">
              <Folder className="h-4 w-4 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Subdependencias</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Nivel 1 - Dependencias derivadas</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-md">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Trámites Asociados</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Conexión con servicios</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-md">
              <Info className="h-4 w-4 text-orange-600 dark:text-orange-300" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Información de Contacto</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Teléfonos, emails, horarios</div>
            </div>
          </div>
        </div>

        <Alert className="mt-4">
          <AlertTitle className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Información Importante
          </AlertTitle>
          <AlertDescription>
            Esta herramienta le permite gestionar la estructura organizativa completa del municipio de Chía. 
            Puede crear, editar y organizar dependencias y subdependencias, así como gestionar su información de contacto 
            y asociarlas con los trámites correspondientes. Mantenga la estructura actualizada para una mejor 
            atención al ciudadano.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}