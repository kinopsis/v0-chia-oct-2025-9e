import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { EditUserForm } from "@/components/admin/edit-user-form"
import { notFound } from "next/navigation"

export default async function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
    await requireAdmin()
    const supabase = await createClient()
    const userId = (await params).id

    const { data: user } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

    if (!user) {
        notFound()
    }

    const { data: dependencias } = await supabase
        .from("dependencias")
        .select("id, nombre")
        .order("nombre")

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Editar Usuario</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Modifica la información y permisos del usuario
                </p>
            </div>

            <EditUserForm user={user} dependencias={dependencias || []} />
        </div>
    )
}
