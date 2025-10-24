"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, EyeOff, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Tramite {
  id: number
  nombre_tramite: string
  categoria: string
  dependencia_nombre: string
  modalidad: string
  requiere_pago: string
  is_active: boolean
}

interface TramitesTableProps {
  tramites: Tramite[]
  canEdit: boolean
}

export function TramitesTable({ tramites, canEdit }: TramitesTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredTramites = tramites.filter(
    (t) =>
      t.nombre_tramite.toLowerCase().includes(search.toLowerCase()) ||
      t.categoria.toLowerCase().includes(search.toLowerCase()) ||
      t.dependencia_nombre.toLowerCase().includes(search.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredTramites.length / itemsPerPage)
  const paginatedTramites = filteredTramites.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/tramites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error toggling tramite:", error)
    }
  }

  const deleteTramite = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este trámite? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/tramites/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting tramite:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar trámites..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredTramites.length} trámite{filteredTramites.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Dependencia</TableHead>
              <TableHead>Modalidad</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead>Estado</TableHead>
              {canEdit && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTramites.map((tramite) => (
              <TableRow key={tramite.id}>
                <TableCell className="font-medium">{tramite.nombre_tramite}</TableCell>
                <TableCell>
                  <Badge variant="outline">{tramite.categoria}</Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">{tramite.dependencia_nombre}</TableCell>
                <TableCell className="text-sm">{tramite.modalidad}</TableCell>
                <TableCell>
                  <Badge variant={tramite.requiere_pago === "Sí" ? "default" : "secondary"}>
                    {tramite.requiere_pago}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={tramite.is_active ? "default" : "secondary"}>
                    {tramite.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                {canEdit && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(tramite.id, tramite.is_active)}
                        title={tramite.is_active ? "Desactivar" : "Activar"}
                      >
                        {tramite.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Link href={`/admin/tramites/${tramite.id}/editar`}>
                        <Button variant="ghost" size="icon" title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTramite(tramite.id)}
                        title="Eliminar"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  )
}
