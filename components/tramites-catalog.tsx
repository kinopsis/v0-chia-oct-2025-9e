"use client"

import { useState, useMemo, useEffect } from "react"
import type { Procedure } from "@/lib/types"
import { searchProcedures, filterByCategory, normalizarTexto } from "@/lib/data"
import { SearchBar } from "@/components/search-bar"
import { CategoryChips } from "@/components/category-chips"
import { ProcedureCard } from "@/components/procedure-card"
import { ProcedureModal } from "@/components/procedure-modal"
import { FilterSidebar } from "@/components/filter-sidebar"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"

interface TramitesCatalogProps {
  initialProcedures: Procedure[]
  initialCategory?: string | null
}

export function TramitesCatalog({ initialProcedures, initialCategory = null }: TramitesCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    modalidad: null as string | null,
    requierePago: null as string | null,
    dependencia: null as string | null,
  })

  const ITEMS_PER_PAGE = 12

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory)
    }
  }, [initialCategory])

  const matchesPaymentFilter = (procedure: Procedure, filterValue: string): boolean => {
    const normalizedPago = normalizarTexto(procedure.requiere_pago)

    if (filterValue === "con_pago") {
      // Any value that is NOT "no" means it requires payment
      return normalizedPago !== "no" && normalizedPago !== ""
    } else if (filterValue === "sin_pago") {
      // Only "no" or empty means no payment
      return normalizedPago === "no" || normalizedPago === ""
    }

    return true
  }

  // Apply all filters
  const filteredProcedures = useMemo(() => {
    let results = initialProcedures

    // Search filter
    if (searchQuery.trim()) {
      results = searchProcedures(results, searchQuery)
    }

    // Category filter
    if (selectedCategory) {
      results = filterByCategory(results, selectedCategory)
    }

    // Advanced filters
    if (filters.modalidad) {
      results = results.filter((proc) => normalizarTexto(proc.modalidad).includes(normalizarTexto(filters.modalidad!)))
    }

    if (filters.requierePago) {
      results = results.filter((proc) => matchesPaymentFilter(proc, filters.requierePago!))
    }

    if (filters.dependencia) {
      results = results.filter((proc) =>
        normalizarTexto(proc.dependencia_nombre).includes(normalizarTexto(filters.dependencia!)),
      )
    }

    return results
  }, [initialProcedures, searchQuery, selectedCategory, filters])

  // Pagination
  const totalPages = Math.ceil(filteredProcedures.length / ITEMS_PER_PAGE)
  const paginatedProcedures = filteredProcedures.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // Reset to page 1 when filters change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedCategory(null)
    setFilters({
      modalidad: null,
      requierePago: null,
      dependencia: null,
    })
    setCurrentPage(1)
  }

  const hasActiveFilters =
    searchQuery.trim() !== "" || selectedCategory !== null || Object.values(filters).some((f) => f !== null)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar value={searchQuery} onChange={handleSearchChange} procedures={initialProcedures} />
      </div>

      {/* Category Chips */}
      <div className="mb-6">
        <CategoryChips selected={selectedCategory} onSelect={handleCategoryChange} procedures={initialProcedures} />
      </div>

      {/* Filter Toggle Button (Mobile) */}
      <div className="mb-6 lg:hidden">
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="w-full">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtros Avanzados
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Filter Sidebar */}
        <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
          <FilterSidebar
            procedures={initialProcedures}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClose={() => setShowFilters(false)}
          />
        </div>

        {/* Results */}
        <div className="flex-1">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              Mostrando {paginatedProcedures.length} de {filteredProcedures.length} trámites
            </p>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Procedure Grid */}
          {paginatedProcedures.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedProcedures.map((procedure) => (
                  <ProcedureCard
                    key={procedure.id}
                    procedure={procedure}
                    onClick={() => setSelectedProcedure(procedure)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground px-4">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No se encontraron trámites con los filtros seleccionados</p>
              <Button variant="outline" onClick={clearAllFilters}>
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Procedure Detail Modal */}
      {selectedProcedure && <ProcedureModal procedure={selectedProcedure} onClose={() => setSelectedProcedure(null)} />}
    </div>
  )
}
