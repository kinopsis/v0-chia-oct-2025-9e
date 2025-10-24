import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { UsersTable } from "@/components/admin/users-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function UsuariosPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: users, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Administra los usuarios del sistema</p>
        </div>

        <Link href="/admin/usuarios/nuevo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        </Link>
      </div>

      <UsersTable users={users || []} />
    </div>
  )
}
