import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { AuditLogsTable } from "@/components/admin/audit-logs-table"

export default async function AuditoriaPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: logs, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Auditoría del Sistema</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Registro de todas las acciones administrativas</p>
      </div>

      <AuditLogsTable logs={logs || []} />
    </div>
  )
}
