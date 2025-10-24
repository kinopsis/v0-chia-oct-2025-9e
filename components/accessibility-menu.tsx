"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accessibility, X, Type, Contrast } from "lucide-react"
import { Label } from "@/components/ui/label"

type TextSize = "normal" | "large" | "xlarge"
type ContrastMode = "normal" | "high"

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false)
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

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          size="icon"
          className="fixed bottom-24 right-6 h-16 w-16 rounded-full shadow-xl hover:scale-110 transition-all duration-200 z-40 text-primary-foreground border-4 border-primary-foreground/20 hover:border-primary-foreground/40 bg-[rgba(222,22,19,1)]"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir menú de accesibilidad"
          title="Opciones de accesibilidad"
        >
          <Accessibility className="h-7 w-7" aria-hidden="true" />
          <span className="sr-only">Abrir opciones de accesibilidad</span>
          <span className="absolute inset-0 rounded-full bg-primary animate-pulse opacity-30" aria-hidden="true" />
        </Button>
      )}

      {/* Accessibility Panel */}
      {isOpen && (
        <Card
          ref={panelRef}
          className="fixed bottom-24 right-6 w-[90vw] sm:w-80 shadow-2xl z-40 border-2"
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
                onClick={() => setIsOpen(false)}
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
      )}
    </>
  )
}
