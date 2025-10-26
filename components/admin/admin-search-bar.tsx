"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import type { Procedure } from "@/lib/types"
import { normalizarTexto } from "@/lib/data"

interface AdminSearchBarProps {
  value: string
  onChange: (value: string) => void
  procedures: Procedure[]
  placeholder?: string
}

interface Suggestion {
  id: number
  name: string
  category: string
  type: "tramite" | "categoria" | "dependencia"
  originalText: string
}

export function AdminSearchBar({ value, onChange, procedures, placeholder = "Buscar trámites..." }: AdminSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const suggestions = useMemo(() => {
    if (!inputValue.trim() || inputValue.length < 2) return []

    const normalizedInput = normalizarTexto(inputValue)
    
    // Collect all unique suggestions with their types
    const suggestionMap = new Map<string, Suggestion>()
    
    // Add procedure name suggestions
    procedures
      .filter((proc) => {
        const normalizedName = normalizarTexto(proc.nombre_tramite)
        return normalizedName.includes(normalizedInput)
      })
      .forEach((proc) => {
        suggestionMap.set(`${proc.id}-tramite`, {
          id: proc.id,
          name: proc.nombre_tramite,
          category: proc.categoria,
          type: "tramite",
          originalText: proc.nombre_tramite
        })
      })

    // Add category suggestions (limit to avoid duplicates)
    const categories = new Set<string>()
    procedures
      .filter((proc) => {
        const normalizedCategory = normalizarTexto(proc.categoria)
        const match = normalizedCategory.includes(normalizedInput)
        if (match && !categories.has(normalizedCategory)) {
          categories.add(normalizedCategory)
          return true
        }
        return false
      })
      .slice(0, 3) // Limit to 3 category suggestions
      .forEach((proc) => {
        suggestionMap.set(`${proc.categoria}-categoria`, {
          id: Math.random(), // Use random ID for categories since they don't have a unique ID
          name: proc.categoria,
          category: "Categoría",
          type: "categoria",
          originalText: proc.categoria
        })
      })

    // Add dependency suggestions (limit to avoid duplicates)
    const dependencies = new Set<string>()
    procedures
      .filter((proc) => {
        const normalizedDep = normalizarTexto(proc.dependencia_nombre)
        const match = normalizedDep.includes(normalizedInput)
        if (match && !dependencies.has(normalizedDep)) {
          dependencies.add(normalizedDep)
          return true
        }
        return false
      })
      .slice(0, 3) // Limit to 3 dependency suggestions
      .forEach((proc) => {
        suggestionMap.set(`${proc.dependencia_nombre}-dependencia`, {
          id: Math.random(), // Use random ID for dependencies since they don't have a unique ID
          name: proc.dependencia_nombre,
          category: "Dependencia",
          type: "dependencia",
          originalText: proc.dependencia_nombre
        })
      })

    const suggestionsArray = Array.from(suggestionMap.values())
    
    // Sort suggestions: trámites first, then categorías, then dependencias
    return suggestionsArray
      .sort((a, b) => {
        if (a.type === b.type) return 0
        if (a.type === "tramite") return -1
        if (b.type === "tramite") return 1
        if (a.type === "categoria") return -1
        return 1
      })
      .slice(0, 10) // Limit to 10 total suggestions
  }, [inputValue, procedures])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    onChange(newValue)
    setIsOpen(newValue.length >= 2 && suggestions.length > 0)
  }

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setInputValue(suggestion.originalText)
    onChange(suggestion.originalText)
    setIsOpen(false)
  }

  const clearSearch = () => {
    setInputValue("")
    onChange("")
    setIsOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (inputValue.length >= 2 && suggestions.length > 0) {
              setIsOpen(true)
            }
          }}
          className="pl-10 pr-10 h-10 text-sm"
          aria-label="Buscar trámites"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="admin-search-suggestions"
          aria-autocomplete="list"
        />
        {inputValue && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1">
          <Command className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
            <CommandList id="admin-search-suggestions">
              <CommandEmpty>No se encontraron resultados</CommandEmpty>
              <CommandGroup heading="Sugerencias">
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={`${suggestion.id}-${suggestion.type}`}
                    value={`${suggestion.name}-${suggestion.type}`}
                    onSelect={() => handleSelectSuggestion(suggestion)}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex flex-col w-full">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium text-gray-900 dark:text-white">{suggestion.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                          {suggestion.type === "tramite" ? "Trámite" : 
                           suggestion.type === "categoria" ? "Categoría" : "Dependencia"}
                        </span>
                      </div>
                      {suggestion.type === "tramite" && suggestion.category && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {suggestion.category}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}