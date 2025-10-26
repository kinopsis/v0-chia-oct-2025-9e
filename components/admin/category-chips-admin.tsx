"use client"

import { Button } from "@/components/ui/button"
import { Building2, GraduationCap, DollarSign, Heart, Car, Users, Leaf, Lightbulb, FolderOpen } from "lucide-react"
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

interface CategoryChipsAdminProps {
  selected: string | null
  onSelect: (category: string | null) => void
  tramites: Tramite[]
}

const categoryIconMap: Record<string, typeof Building2> = {
  Vivienda: Building2,
  Educación: GraduationCap,
  Impuestos: DollarSign,
  Salud: Heart,
  Tránsito: Car,
  SISBEN: Users,
  "Medio Ambiente": Leaf,
  Emprendimiento: Lightbulb,
}

function getCategories(tramites: Tramite[]) {
  const categories = [...new Set(tramites.map((t) => t.categoria))]
  return categories.sort()
}

export function CategoryChipsAdmin({ selected, onSelect, tramites }: CategoryChipsAdminProps) {
  const categories = useMemo(() => {
    return getCategories(tramites).map((name) => ({
      name,
      icon: categoryIconMap[name] || FolderOpen, // Use default icon if not mapped
    }))
  }, [tramites])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    categories.forEach((cat) => {
      counts[cat.name] = tramites.filter((tramite) => tramite.categoria === cat.name).length
    })
    return counts
  }, [tramites, categories])

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
      <Button
        variant={selected === null ? "default" : "outline"}
        size="sm"
        onClick={() => onSelect(null)}
        className="h-9"
        aria-pressed={selected === null}
        aria-label="Mostrar todas las categorías"
      >
        Todas
        <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-xs font-semibold">{tramites.length}</span>
      </Button>
      {categories.map((category) => {
        const Icon = category.icon
        const isSelected = selected === category.name
        const count = categoryCounts[category.name] || 0
        return (
          <Button
            key={category.name}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(category.name)}
            className="h-9"
            aria-pressed={isSelected}
            aria-label={`Filtrar por ${category.name}, ${count} trámites`}
          >
            <Icon className="h-4 w-4 mr-2" aria-hidden="true" />
            {category.name}
            <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-xs font-semibold">{count}</span>
          </Button>
        )
      })}
    </div>
  )
}