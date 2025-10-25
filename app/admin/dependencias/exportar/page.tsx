import { requireAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, FileText, Database, RefreshCw } from "lucide-react";
import Link from "next/link";

export default async function ExportarDependenciasPage() {
  const user = await requireAuth();

  const canEdit = user?.profile?.role === "admin" || user?.profile?.role === "supervisor";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Exportar Dependencias</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Exporte la estructura de dependencias a diferentes formatos
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Exportar CSV
            </CardTitle>
            <CardDescription>
              Descargue todas las dependencias en formato CSV
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Exporte la estructura completa de dependencias y subdependencias en formato CSV para su uso en hojas de cálculo o sistemas externos.
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Campos incluidos:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Código, Sigla, Nombre</li>
                <li>• Tipo (dependencia/subdependencia)</li>
                <li>• Dependencia padre</li>
                <li>• Información de contacto</li>
                <li>• Estado y fechas</li>
              </ul>
            </div>

            <Button
              asChild
              className="w-full gap-2"
              disabled={!canEdit}
            >
              <Link href="/api/admin/dependencias/exportar/csv">
                <Download className="h-4 w-4" />
                Descargar CSV
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Exportar Excel
            </CardTitle>
            <CardDescription>
              Estructura jerárquica en formato Excel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Exporte la estructura de dependencias en formato Excel con la jerarquía completa para análisis y reportes.
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Estructura Excel:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Árbol jerárquico completo</li>
                <li>• Todos los campos de dependencias</li>
                <li>• Relaciones padre-hijo</li>
                <li>• Listo para análisis en Excel</li>
              </ul>
            </div>

            <Button
              asChild
              className="w-full gap-2"
              disabled={!canEdit}
            >
              <Link href="/api/admin/dependencias/exportar/excel">
                <Download className="h-4 w-4" />
                Descargar Excel
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Exportaciones</CardTitle>
          <CardDescription>
            Registros de las últimas exportaciones realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay historial disponible</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Las exportaciones se generan en tiempo real. Los archivos estarán disponibles para descarga inmediata.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/admin/dependencias">
            ← Volver a Dependencias
          </Link>
        </Button>
        
        <Button asChild>
          <Link href="/admin/dependencias/importar">
            Importar Dependencias
            <FileText className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}