import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { N8nConfigForm } from "@/components/admin/n8n-config-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ConfiguracionPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: config } = await supabase
    .from("n8n_config")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración del Sistema</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Ajustes avanzados y configuración de integraciones</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integración N8n (AI Chat)</CardTitle>
          <CardDescription>
            Configura el webhook de N8n para habilitar el asistente virtual con inteligencia artificial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <N8nConfigForm initialConfig={config} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
          <CardDescription>Detalles técnicos y estado del portal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Versión</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">1.0.0</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Base de Datos</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Supabase PostgreSQL</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Autenticación</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Supabase Auth</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Framework</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Next.js 16</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
