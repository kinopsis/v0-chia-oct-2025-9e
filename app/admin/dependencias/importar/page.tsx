import { requireAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, Download, Info } from "lucide-react";
import Link from "next/link";

export default async function ImportarDependenciasPage() {
  const user = await requireAuth();

  const canEdit = user?.profile?.role === "admin" || user?.profile?.role === "supervisor";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Importar Dependencias</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Importe dependencias y subdependencias desde un archivo CSV
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importar CSV
            </CardTitle>
            <CardDescription>
              Suba un archivo CSV con la estructura de dependencias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/admin/dependencias/importar" method="post" encType="multipart/form-data" className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Arrastre y suelte su archivo CSV aquí
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  o haga clic para seleccionar un archivo
                </p>
                <input
                  type="file"
                  name="csvFile"
                  accept=".csv"
                  required
                  className="hidden"
                  id="csvFile"
                />
                <label
                  htmlFor="csvFile"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Seleccionar Archivo
                </label>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Formato del CSV:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li><strong>codigo:</strong> Código único de la dependencia (ej: 001, DA, SP)</li>
                  <li><strong>sigla:</strong> Sigla de la dependencia (opcional)</li>
                  <li><strong>nombre:</strong> Nombre completo de la dependencia</li>
                  <li><strong>tipo:</strong> "dependencia" o "subdependencia"</li>
                  <li><strong>dependencia_padre_id:</strong> ID de la dependencia padre (solo para subdependencias)</li>
                  <li><strong>telefono:</strong> Número de contacto (opcional)</li>
                  <li><strong>email:</strong> Correo electrónico (opcional)</li>
                  <li><strong>direccion:</strong> Dirección física (opcional)</li>
                  <li><strong>horario_atencion:</strong> Horario de atención (opcional)</li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full gap-2"
                disabled={!canEdit}
              >
                <Upload className="h-4 w-4" />
                Importar Dependencias
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Instrucciones
            </CardTitle>
            <CardDescription>
              Guía para la importación de dependencias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                Asegúrese de que el archivo CSV tenga la estructura correcta y que las dependencias padres existan antes de importar subdependencias.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Pasos para importar:</h4>
              <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-decimal list-inside">
                <li>Prepare su archivo CSV con el formato especificado</li>
                <li>Importe primero las dependencias principales (nivel 0)</li>
                <li>Luego importe las subdependencias (nivel 1) con sus dependencias padre</li>
                <li>Verifique que no haya duplicados</li>
                <li>Revise los resultados de la importación</li>
              </ol>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Validaciones:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc list-inside">
                <li>Códigos únicos por dependencia</li>
                <li>Dependencias padre deben existir</li>
                <li>Formato de correo electrónico válido</li>
                <li>Campos requeridos completos</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/admin/dependencias">
            ← Volver a Dependencias
          </Link>
        </Button>
        
        <Button asChild>
          <Link href="/admin/dependencias/exportar">
            Exportar Plantilla CSV
            <Download className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}