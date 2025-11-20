"use client"

import { Button } from "@/components/ui/button"
import { Building2, GraduationCap, DollarSign, Heart, Car, Users, Leaf, Lightbulb, FolderOpen } from "lucide-react"
import type { Procedure } from "@/lib/types"
import { useMemo } from "react"
import { getCategories } from "@/lib/data"

interface CategoryChipsProps {
  selected: string | null
  onSelect: (category: string | null) => void
  procedures: Procedure[]
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

export function CategoryChips({ selected, onSelect, procedures }: CategoryChipsProps) {
  const categories = useMemo(() => {
    return getCategories(procedures).map((name) => ({
      name,
      icon: categoryIconMap[name] || FolderOpen, // Use default icon if not mapped
    }))
  }, [procedures])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    categories.forEach((cat) => {
      counts[cat.name] = procedures.filter((proc) => proc.categoria === cat.name).length
    })
    return counts
  }, [procedures, categories])

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
        <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${selected === null ? 'bg-white text-primary' : 'bg-background text-foreground'}`}>{procedures.length}</span>
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
            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${isSelected ? 'bg-white text-primary' : 'bg-background text-foreground'}`}>{count}</span>
          </Button>
        )
      })}
    </div>
  )
}
