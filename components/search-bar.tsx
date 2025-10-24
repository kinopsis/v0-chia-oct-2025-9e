"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import type { Procedure } from "@/lib/types"
import { normalizarTexto } from "@/lib/data"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  procedures: Procedure[]
}

export function SearchBar({ value, onChange, procedures }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const suggestions = useMemo(() => {
    if (!inputValue.trim() || inputValue.length < 2) return []

    const normalizedInput = normalizarTexto(inputValue)
    const matches = procedures
      .filter((proc) => {
        const normalizedName = normalizarTexto(proc.nombre_tramite)
        return normalizedName.includes(normalizedInput)
      })
      .slice(0, 8) // Limit to 8 suggestions
      .map((proc) => ({
        id: proc.id,
        name: proc.nombre_tramite,
        category: proc.categoria,
      }))

    return matches
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

  const handleSelectSuggestion = (procedureName: string) => {
    setInputValue(procedureName)
    onChange(procedureName)
    setIsOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Buscar trámites por nombre, descripción o categoría..."
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (inputValue.length >= 2 && suggestions.length > 0) {
              setIsOpen(true)
            }
          }}
          className="pl-10 h-12 text-base"
          aria-label="Buscar trámites"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1">
          <Command className="rounded-lg border shadow-md bg-popover">
            <CommandList id="search-suggestions">
              <CommandEmpty>No se encontraron resultados</CommandEmpty>
              <CommandGroup heading="Sugerencias">
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion.id}
                    value={suggestion.name}
                    onSelect={() => handleSelectSuggestion(suggestion.name)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{suggestion.name}</span>
                      {suggestion.category && (
                        <span className="text-xs text-muted-foreground">{suggestion.category}</span>
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
