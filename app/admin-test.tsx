import { createClient } from "@/lib/supabase/server"
import { TramitesTable } from "@/components/admin/tramites-table"

export default async function AdminTestPage() {
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

  if (error) {
    console.error("Error fetching tramites:", error)
    return <div>Error al cargar trámites</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Prueba de Autocompletado de Administración</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Esta página es para probar el componente de autocompletado sin necesidad de autenticación
        </p>
      </div>

      <TramitesTable tramites={tramites || []} canEdit={false} />
    </div>
  )
}