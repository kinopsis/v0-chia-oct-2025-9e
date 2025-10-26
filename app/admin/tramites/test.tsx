import { createClient } from "@/lib/supabase/server"
import { TramitesTable } from "@/components/admin/tramites-table"

// Temporarily bypass authentication for testing
// import { requireAuth } from "@/lib/auth"

export default async function TramitesTestPage() {
  const supabase = await createClient()

  const { data: tramites, error } = await supabase
    .from("tramites")
    .select(`
      id,
      nombre_tramite,
      descripcion,
      categoria,
      dependencia_nombre,
      modalidad,
      requiere_pago,
      requisitos,
      is_active,
      created_at
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Prueba de Filtros Avanzados</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Esta página permite probar la funcionalidad de filtros avanzados sin necesidad de autenticación
          </p>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Esta es una página de prueba para demostrar la funcionalidad de filtros avanzados (categoría, modalidad, pago).
            En producción, esta funcionalidad estará disponible en la página principal de administración de trámites.
          </p>
        </div>
      </div>

      <TramitesTable tramites={tramites || []} canEdit={false} />
    </div>
  )
}