import { requireAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Building2, Folder, Info } from "lucide-react";
import Link from "next/link";

export default async function NuevaDependenciaPage() {
  const user = await requireAuth();

  const canEdit = user?.profile?.role === "admin" || user?.profile?.role === "supervisor";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Nueva Dependencia</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Cree una nueva dependencia o subdependencia para el municipio de Chía
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dependencia Principal
            </CardTitle>
            <CardDescription>
              Cree una nueva dependencia de nivel superior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">¿Qué es una dependencia principal?</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Las dependencias principales son unidades organizativas de nivel superior que pueden contener subdependencias. 
                Ejemplos: Secretarías, Despacho del Alcalde, Dependencias Descentralizadas.
              </p>
            </div>

            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <h3 className="text-lg font-medium mb-2">Formulario de Dependencias</h3>
              <p className="text-sm">Esta funcionalidad está en desarrollo. Por ahora, use la página principal de dependencias para crear nuevas dependencias.</p>
              <Link href="/admin/dependencias">
                <Button variant="outline" className="mt-4">
                  ← Volver a Dependencias
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Subdependencia
            </CardTitle>
            <CardDescription>
              Cree una nueva subdependencia bajo una dependencia existente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">¿Qué es una subdependencia?</h4>
              <p className="text-sm text-green-800 dark:text-green-200">
                Las subdependencias son unidades organizativas que dependen de una dependencia principal. 
                Ejemplos: Direcciones, Oficinas, Departamentos.
              </p>
            </div>

            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <Folder className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <h3 className="text-lg font-medium mb-2">Formulario de Subdependencias</h3>
              <p className="text-sm">Esta funcionalidad está en desarrollo. Por ahora, use la página principal de dependencias para crear nuevas subdependencias.</p>
              <Link href="/admin/dependencias">
                <Button variant="outline" className="mt-4">
                  ← Volver a Dependencias
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Guía para Crear Dependencias
          </CardTitle>
          <CardDescription>
            Recomendaciones y mejores prácticas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Consideraciones importantes:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc list-inside">
                <li>Use códigos únicos y significativos</li>
                <li>Asigne siglas reconocibles</li>
                <li>Complete la información de contacto</li>
                <li>Defina horarios de atención claros</li>
                <li>Verifique la estructura jerárquica</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Ejemplos de códigos:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li><span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">001</span> - Oficina Asesora Jurídica</li>
                <li><span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">DA</span> - Despacho Alcalde</li>
                <li><span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">SP</span> - Secretaría de Planeación</li>
                <li><span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">DSP</span> - Dirección de Salud Pública</li>
              </ul>
            </div>
          </div>

          <Alert>
            <AlertTitle>Nota</AlertTitle>
            <AlertDescription>
              Las dependencias principales (nivel 0) no pueden tener una dependencia padre. 
              Las subdependencias (nivel 1) deben seleccionar una dependencia principal como padre.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/admin/dependencias">
            ← Volver a Dependencias
          </Link>
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/dependencias/importar">
              Importar en Lote
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/dependencias/exportar">
              Exportar Estructura
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}