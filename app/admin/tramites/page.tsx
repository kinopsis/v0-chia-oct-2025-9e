import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { TramitesTable } from "@/components/admin/tramites-table"
import { Button } from "@/components/ui/button"
import { Plus, Upload, Download } from "lucide-react"
import Link from "next/link"

export default async function TramitesPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: tramites, error } = await supabase
    .from("tramites")
    .select("*")
    .order("created_at", { ascending: false })

  const canEdit = user?.profile?.role === "admin" || user?.profile?.role === "supervisor"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Trámites</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Administra los procedimientos municipales</p>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <Link href="/admin/tramites/importar">
              <Button variant="outline" className="gap-2 bg-transparent">
                <Upload className="h-4 w-4" />
                Importar CSV
              </Button>
            </Link>
            <Link href="/admin/tramites/exportar">
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            </Link>
            <Link href="/admin/tramites/nuevo">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Trámite
              </Button>
            </Link>
          </div>
        )}
      </div>

      <TramitesTable tramites={tramites || []} canEdit={canEdit} />
    </div>
  )
}
