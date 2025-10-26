import { createClient } from "@/lib/supabase/server"
import { TramitesTable } from "@/components/admin/tramites-table"

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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Prueba de Filtros por Categoría</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Esta página permite probar la funcionalidad de chips de categorías implementada para la administración
          </p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🎯 Funcionalidad Implementada:</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Chips de categorías con iconos y contadores</li>
            <li>• Filtro combinado: búsqueda de texto + selección de categoría</li>
            <li>• Diseño consistente con la interfaz de administración</li>
            <li>• Limpieza automática de búsqueda al cambiar de categoría</li>
          </ul>
        </div>
      </div>

      <TramitesTable tramites={tramites || []} canEdit={false} />
    </div>
  )
}