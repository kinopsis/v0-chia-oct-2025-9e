import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DependenciaArbol } from "@/lib/types-dependencias";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download, RefreshCw, LayoutList } from "lucide-react";
import Link from "next/link";
import { DependenciesTree } from "@/components/admin/dependencies-tree";
import { DependenciesManager } from "@/components/admin/dependencies-manager";
import { DependenciesHeader } from "@/components/admin/dependencies-header";

export default async function DependenciasPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const canEdit = user?.profile?.role === "admin" || user?.profile?.role === "supervisor";

  // Get dependencies tree for the tree view
  const { data: dependenciesTree, error: treeError } = await supabase
    .from("dependencias")
    .select("*")
    .order("nivel", { ascending: true })
    .order("orden", { ascending: true })
    .order("nombre", { ascending: true });

  // Get flat list for the list view
  const { data: dependenciesList, error: listError } = await supabase
    .from("dependencias")
    .select(`
      *,
      parent:dependencia_padre_id (
        nombre,
        codigo
      )
    `)
    .order("nivel", { ascending: true })
    .order("orden", { ascending: true })
    .order("nombre", { ascending: true });

  return (
    <div className="space-y-6">
      <DependenciesHeader canEdit={canEdit} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Dependencias</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra la estructura jerárquica de dependencias y subdependencias
          </p>
        </div>

        {canEdit && (
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/dependencias/importar">
              <Button variant="outline" className="gap-2 bg-transparent">
                <Upload className="h-4 w-4" />
                Importar CSV
              </Button>
            </Link>
            <Link href="/admin/dependencias/exportar">
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            </Link>
            <Link href="/admin/dependencias/nuevo">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Dependencia
              </Button>
            </Link>
          </div>
        )}
      </div>

      <DependenciesTree
        dependencies={dependenciesTree || []}
        canEdit={canEdit}
        error={treeError?.message}
      />

      <DependenciesManager
        dependencies={dependenciesList || []}
        canEdit={canEdit}
        error={listError?.message}
      />
    </div>
  );
}