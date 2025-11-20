"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accessibility, X, Type, Contrast } from "lucide-react"
import { Label } from "@/components/ui/label"

type TextSize = "normal" | "large" | "xlarge"
type ContrastMode = "normal" | "high"

export function AccessibilityMenu({
  isOpen,
  onClose,
  triggerRef,
}: {
  isOpen: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}) {
  const [textSize, setTextSize] = useState<TextSize>("normal")
  const [contrastMode, setContrastMode] = useState<ContrastMode>("normal")
  const panelRef = useRef<HTMLDivElement>(null)

  // Load preferences from localStorage
  useEffect(() => {
    const savedTextSize = localStorage.getItem("accessibility-text-size") as TextSize
    const savedContrast = localStorage.getItem("accessibility-contrast") as ContrastMode

    if (savedTextSize) {
      setTextSize(savedTextSize)
      applyTextSize(savedTextSize)
    }

    if (savedContrast) {
      setContrastMode(savedContrast)
      applyContrast(savedContrast)
    }
  }, [])

  const applyTextSize = (size: TextSize) => {
    const root = document.documentElement
    root.classList.remove("text-normal", "text-large", "text-xlarge")
    root.classList.add(`text-${size}`)
  }

  const applyContrast = (mode: ContrastMode) => {
    const root = document.documentElement
    if (mode === "high") {
      root.classList.add("high-contrast")
    } else {
      root.classList.remove("high-contrast")
    }
  }

  const handleTextSizeChange = (size: TextSize) => {
    setTextSize(size)
    applyTextSize(size)
    localStorage.setItem("accessibility-text-size", size)
  }

  const handleContrastChange = (mode: ContrastMode) => {
    setContrastMode(mode)
    applyContrast(mode)
    localStorage.setItem("accessibility-contrast", mode)
  }

  const resetSettings = () => {
    setTextSize("normal")
    setContrastMode("normal")
    applyTextSize("normal")
    applyContrast("normal")
    localStorage.removeItem("accessibility-text-size")
    localStorage.removeItem("accessibility-contrast")
  }

  // Close on escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Focus trap and management
  useEffect(() => {
    if (!isOpen) return

    const focusableElements = panelRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (!focusableElements || focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Set initial focus
    firstElement.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus()
          event.preventDefault()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus()
          event.preventDefault()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      // Restore focus to the trigger button
      triggerRef.current?.focus()
    }
  }, [isOpen, triggerRef])

  if (!isOpen) {
    return null
  }

  return (
    <Card
      ref={panelRef}
      id="accessibility-menu"
      className="absolute top-full right-0 mt-2 w-[90vw] sm:w-80 shadow-2xl z-50 border-2 bg-background"
      role="dialog"
      aria-label="Menú de accesibilidad"
      aria-modal="true"
    >
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Accessibility className="h-5 w-5" aria-hidden="true" />
              Accesibilidad
            </CardTitle>
            <CardDescription className="text-xs">Ajusta la visualización del sitio</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Cerrar menú de accesibilidad"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

          <CardContent className="p-4 space-y-6">
            {/* Text Size Control */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Type className="h-4 w-4" aria-hidden="true" />
                Tamaño de texto
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={textSize === "normal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTextSizeChange("normal")}
                  className="text-sm"
                  aria-pressed={textSize === "normal"}
                >
                  Normal
                </Button>
                <Button
                  variant={textSize === "large" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTextSizeChange("large")}
                  className="text-base"
                  aria-pressed={textSize === "large"}
                >
                  Grande
                </Button>
                <Button
                  variant={textSize === "xlarge" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTextSizeChange("xlarge")}
                  className="text-lg"
                  aria-pressed={textSize === "xlarge"}
                >
                  Muy grande
                </Button>
              </div>
            </div>

            {/* Contrast Control */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Contrast className="h-4 w-4" aria-hidden="true" />
                Contraste
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={contrastMode === "normal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleContrastChange("normal")}
                  aria-pressed={contrastMode === "normal"}
                >
                  Normal
                </Button>
                <Button
                  variant={contrastMode === "high" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleContrastChange("high")}
                  aria-pressed={contrastMode === "high"}
                >
                  Alto contraste
                </Button>
              </div>
            </div>

            {/* Reset Button */}
            <Button variant="secondary" size="sm" onClick={resetSettings} className="w-full">
              Restablecer ajustes
            </Button>

            {/* Info */}
            <p className="text-xs text-muted-foreground text-center" role="status">
              Cumple con WCAG AA 2.1
            </p>
          </CardContent>
        </Card>
  )
}
