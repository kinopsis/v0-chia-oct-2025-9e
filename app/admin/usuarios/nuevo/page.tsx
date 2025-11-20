import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { CreateUserForm } from "@/components/admin/create-user-form"

export default async function NuevoUsuarioPage() {
    await requireAdmin()
    const supabase = await createClient()

    const { data: dependencias } = await supabase
        .from("dependencias")
        .select("id, nombre")
        .order("nombre")

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Nuevo Usuario</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Crea un nuevo usuario y asigna sus permisos
                </p>
            </div>

            <CreateUserForm dependencias={dependencias || []} />
        </div>
    )
}
