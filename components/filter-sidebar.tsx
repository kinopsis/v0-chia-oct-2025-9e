"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import type { Procedure } from "@/lib/types"
import { X } from "lucide-react"

interface FilterSidebarProps {
  procedures: Procedure[]
  filters: {
    modalidad: string | null
    requierePago: string | null
    dependencia: string | null
  }
  onFiltersChange: (filters: FilterSidebarProps["filters"]) => void
  onClose?: () => void
}

export function FilterSidebar({ procedures, filters, onFiltersChange, onClose }: FilterSidebarProps) {
  // Get unique values
  const modalidades = Array.from(new Set(procedures.map((p) => p.modalidad).filter(Boolean)))
  const dependencias = Array.from(new Set(procedures.map((p) => p.dependencia_nombre).filter(Boolean))).sort()

  return (
    <Card className="w-full lg:w-64 flex-shrink-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Modalidad Filter */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Modalidad</Label>
          <RadioGroup
            value={filters.modalidad || "all"}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                modalidad: value === "all" ? null : value,
              })
            }
          >
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="all" id="modalidad-all" />
              <Label htmlFor="modalidad-all" className="font-normal cursor-pointer">
                Todas
              </Label>
            </div>
            {modalidades.map((modalidad) => (
              <div key={modalidad} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={modalidad} id={`modalidad-${modalidad}`} />
                <Label htmlFor={`modalidad-${modalidad}`} className="font-normal cursor-pointer">
                  {modalidad}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Requiere Pago Filter */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Requiere Pago</Label>
          <RadioGroup
            value={filters.requierePago || "all"}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                requierePago: value === "all" ? null : value,
              })
            }
          >
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="all" id="pago-all" />
              <Label htmlFor="pago-all" className="font-normal cursor-pointer">
                Todos
              </Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="con_pago" id="pago-si" />
              <Label htmlFor="pago-si" className="font-normal cursor-pointer">
                Con pago
              </Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="sin_pago" id="pago-no" />
              <Label htmlFor="pago-no" className="font-normal cursor-pointer">
                Sin pago
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Dependencia Filter */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Dependencia</Label>
          <RadioGroup
            value={filters.dependencia || "all"}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                dependencia: value === "all" ? null : value,
              })
            }
          >
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="all" id="dep-all" />
              <Label htmlFor="dep-all" className="font-normal cursor-pointer">
                Todas
              </Label>
            </div>
            {dependencias.slice(0, 8).map((dep) => (
              <div key={dep} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={dep} id={`dep-${dep}`} />
                <Label htmlFor={`dep-${dep}`} className="font-normal cursor-pointer text-sm">
                  {dep}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Clear Filters Button */}
        <Button
          variant="outline"
          className="w-full bg-transparent"
          onClick={() =>
            onFiltersChange({
              modalidad: null,
              requierePago: null,
              dependencia: null,
            })
          }
        >
          Limpiar Filtros
        </Button>
      </CardContent>
    </Card>
  )
}
