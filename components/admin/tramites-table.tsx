"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Edit, Trash2, Eye, EyeOff, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { searchProcedures } from "@/lib/data"
import { CategoryChipsAdmin } from "@/components/admin/category-chips-admin"
import { AdvancedFiltersAdmin } from "@/components/admin/advanced-filters-admin"
import { AdminSearchBar } from "@/components/admin/admin-search-bar"

interface Tramite {
  id: number
  nombre_tramite: string
  descripcion: string
  categoria: string
  dependencia_nombre?: string
  subdependencia_nombre?: string
  dependencia_id?: number
  subdependencia_id?: number
  modalidad: string
  requiere_pago: string
  requisitos: string
  is_active: boolean
  // Campos adicionales para compatibilidad con searchProcedures
  formulario?: string
  tiempo_respuesta?: string
  instrucciones?: string
  url_suit?: string
  url_gov?: string
}

// Convertir Tramite a Procedure para compatibilidad con searchProcedures
function convertToProcedure(tramite: Tramite): import("@/lib/types").Procedure {
  return {
    id: tramite.id,
    nombre_tramite: tramite.nombre_tramite,
    descripcion: tramite.descripcion,
    categoria: tramite.categoria,
    dependencia_nombre: tramite.dependencia_nombre || "",
    modalidad: tramite.modalidad,
    requiere_pago: tramite.requiere_pago,
    requisitos: tramite.requisitos,
    formulario: tramite.formulario || "",
    subdependencia_nombre: tramite.subdependencia_nombre || "",
    tiempo_respuesta: tramite.tiempo_respuesta || "",
    instrucciones: tramite.instrucciones || "",
    url_suit: tramite.url_suit || "",
    url_gov: tramite.url_gov || "",
  }
}

// Convertir Procedure de vuelta a Tramite manteniendo is_active
function convertToTramite(procedure: import("@/lib/types").Procedure, is_active: boolean): Tramite {
  return {
    id: procedure.id,
    nombre_tramite: procedure.nombre_tramite,
    descripcion: procedure.descripcion,
    categoria: procedure.categoria,
    dependencia_nombre: procedure.dependencia_nombre,
    modalidad: procedure.modalidad,
    requiere_pago: procedure.requiere_pago,
    requisitos: procedure.requisitos,
    is_active: is_active,
    formulario: procedure.formulario,
    subdependencia_nombre: procedure.subdependencia_nombre,
    tiempo_respuesta: procedure.tiempo_respuesta,
    instrucciones: procedure.instrucciones,
    url_suit: procedure.url_suit,
    url_gov: procedure.url_gov,
  }
}

function formatPaymentBadge(requierePago: string) {
  const normalized = requierePago.trim().toLowerCase()
  if (normalized === "no") {
    return { text: "Gratis", variant: "outline" as const }
  }
  return { text: "Requiere Pago", variant: "default" as const }
}

interface TramitesTableProps {
  tramites: Tramite[]
  canEdit: boolean
}

export function TramitesTable({ tramites, canEdit }: TramitesTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    modalidad: null as string | null,
    requierePago: null as string | null,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Aplicar búsqueda con sinónimos primero
  const searchedTramites = search.trim()
    ? searchProcedures(
        tramites.map(tramite => convertToProcedure(tramite)),
        search
      ).map(procedure => {
        // Encontrar el tramite original para mantener is_active
        const originalTramite = tramites.find(t => t.id === procedure.id)
        return convertToTramite(procedure, originalTramite?.is_active || false)
      })
    : tramites

  const filteredTramites = searchedTramites.filter((t) => {
    // Filtro por categoría
    if (selectedCategory && t.categoria !== selectedCategory) {
      return false
    }

    // Filtro por modalidad
    if (filters.modalidad && t.modalidad !== filters.modalidad) {
      return false
    }

    // Filtro por requiere_pago
    if (filters.requierePago) {
      const normalizedPago = t.requiere_pago?.toLowerCase() || ""
      
      if (filters.requierePago === "con_pago") {
        // Any value that is NOT "no" means it requires payment
        if (normalizedPago !== "no" && normalizedPago !== "") {
          return true
        } else {
          return false
        }
      } else if (filters.requierePago === "sin_pago") {
        // Only "no" or empty means no payment
        if (normalizedPago === "no" || normalizedPago === "") {
          return true
        } else {
          return false
        }
      }
    }

    return true
  })

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

  const [deleteTramiteId, setDeleteTramiteId] = useState<number | null>(null)

  const deleteTramite = async () => {
    if (!deleteTramiteId) return

    try {
      const response = await fetch(`/api/admin/tramites/${deleteTramiteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting tramite:", error)
    } finally {
      setDeleteTramiteId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Categorías */}
      <div className="flex flex-col gap-4">
        <CategoryChipsAdmin
          selected={selectedCategory}
          onSelect={(category) => {
            setSelectedCategory(category)
            setSearch("") // Limpiar búsqueda al cambiar de categoría
            setFilters({ modalidad: null, requierePago: null }) // Limpiar filtros avanzados
            setCurrentPage(1)
          }}
          tramites={tramites}
        />
        
        {/* Filtros Avanzados */}
        <AdvancedFiltersAdmin
          filters={filters}
          onFiltersChange={(newFilters) => {
            setFilters(newFilters)
            setCurrentPage(1)
          }}
          tramites={tramites}
        />
        
        {/* Búsqueda y contador */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <AdminSearchBar
              value={search}
              onChange={(value) => {
                setSearch(value)
                setCurrentPage(1)
              }}
              procedures={tramites.map(tramite => convertToProcedure(tramite))}
              placeholder="Buscar trámites, categorías o dependencias..."
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredTramites.length} trámite{filteredTramites.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-32 sm:min-w-48">Nombre</TableHead>
                <TableHead className="min-w-20 sm:min-w-24 hidden xs:table-cell">Categoría</TableHead>
                <TableHead className="min-w-24 sm:min-w-32">Dependencia</TableHead>
                <TableHead className="min-w-16 sm:min-w-20 hidden xs:table-cell">Modalidad</TableHead>
                <TableHead className="min-w-16">Pago</TableHead>
                <TableHead className="min-w-16 sm:min-w-20">Estado</TableHead>
                {canEdit && <TableHead className="text-right min-w-20 sm:min-w-24">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTramites.map((tramite) => (
                <TableRow key={tramite.id}>
                  <TableCell className="font-medium py-3 text-sm sm:text-base">{tramite.nombre_tramite}</TableCell>
                  <TableCell className="py-3 hidden xs:table-cell">
                    <Badge variant="outline" className="text-xs sm:text-sm">{tramite.categoria}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400 py-3">{tramite.dependencia_nombre}</TableCell>
                  <TableCell className="text-sm py-3 hidden xs:table-cell">{tramite.modalidad}</TableCell>
                  <TableCell className="py-3">
                    <Badge variant={formatPaymentBadge(tramite.requiere_pago).variant} className="text-xs sm:text-sm">
                      {formatPaymentBadge(tramite.requiere_pago).text}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge variant={tramite.is_active ? "default" : "secondary"} className="text-xs sm:text-sm">
                      {tramite.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right py-3">
                      <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-9 sm:w-9"
                        onClick={() => toggleActive(tramite.id, tramite.is_active)}
                        title={tramite.is_active ? "Desactivar" : "Activar"}
                      >
                        {tramite.is_active ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                      </Button>
                      <Link href={`/admin/tramites/${tramite.id}/editar`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" title="Editar">
                          <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </Link>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => setDeleteTramiteId(tramite.id)}
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>¿Eliminar trámite?</DialogTitle>
                            <DialogDescription>
                              Estás a punto de eliminar el trámite "<strong>{tramite.nombre_tramite}</strong>".
                              Esta acción no se puede deshacer y eliminará permanentemente el trámite del sistema.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteTramiteId(null)}>
                              Cancelar
                            </Button>
                            <Button variant="destructive" onClick={deleteTramite}>
                              Eliminar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="h-8 sm:h-9 px-3 sm:px-4"
            >
              <span className="text-sm">Anterior</span>
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="h-8 sm:h-9 px-3 sm:px-4"
            >
              <span className="text-sm">Siguiente</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
