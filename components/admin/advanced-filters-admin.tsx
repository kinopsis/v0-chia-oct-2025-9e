"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useMemo } from "react"

interface Tramite {
  id: number
  nombre_tramite: string
  descripcion: string
  categoria: string
  dependencia_nombre: string
  modalidad: string
  requiere_pago: string
  requisitos: string
  is_active: boolean
}

interface AdvancedFiltersAdminProps {
  filters: {
    modalidad: string | null
    requierePago: string | null
  }
  onFiltersChange: (filters: AdvancedFiltersAdminProps["filters"]) => void
  tramites: Tramite[]
}

export function AdvancedFiltersAdmin({ filters, onFiltersChange, tramites }: AdvancedFiltersAdminProps) {
  // Get unique values for modalidad
  const modalidades = useMemo(() => {
    const modalidadesSet = new Set(tramites.map((t) => t.modalidad).filter(Boolean))
    return Array.from(modalidadesSet).sort()
  }, [tramites])

  const matchesPaymentFilter = (tramite: Tramite, filterValue: string): boolean => {
    const normalizedPago = tramite.requiere_pago?.toLowerCase() || ""

    if (filterValue === "con_pago") {
      // Any value that is NOT "no" means it requires payment
      return normalizedPago !== "no" && normalizedPago !== ""
    } else if (filterValue === "sin_pago") {
      // Only "no" or empty means no payment
      return normalizedPago === "no" || normalizedPago === ""
    }

    return true
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-end">
      {/* Modalidad Filter */}
      <div className="space-y-2">
        <Label htmlFor="filter-modalidad" className="text-sm font-semibold">
          Modalidad
        </Label>
        <Select
          value={filters.modalidad || "all"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              modalidad: value === "all" ? null : value,
            })
          }
        >
          <SelectTrigger id="filter-modalidad" className="w-28 sm:w-32 h-9">
            <SelectValue placeholder="Todas las modalidades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {modalidades.map((modalidad) => (
              <SelectItem key={modalidad} value={modalidad}>
                {modalidad}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Requiere Pago Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Requiere Pago</Label>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <RadioGroup
              value={filters.requierePago || "all"}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  requierePago: value === "all" ? null : value,
                })
              }
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="pago-all" />
                <Label htmlFor="pago-all" className="font-normal cursor-pointer text-sm">
                  Todos
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="con_pago" id="pago-si" />
                <Label htmlFor="pago-si" className="font-normal cursor-pointer text-sm">
                  Con pago
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sin_pago" id="pago-no" />
                <Label htmlFor="pago-no" className="font-normal cursor-pointer text-sm">
                  Sin pago
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Clear Filters Button */}
      {(filters.modalidad || filters.requierePago) && (
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-full sm:w-auto"
          onClick={() =>
            onFiltersChange({
              modalidad: null,
              requierePago: null,
            })
          }
        >
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}