"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Moon, Sun, Menu, LogIn, Accessibility } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { AccessibilityMenu } from "@/components/accessibility-menu" // Importación del menú de accesibilidad integrado en el header

export function Header() {
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            C
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base leading-tight">Municipio de Chía</span>
            <span className="text-xs text-muted-foreground">Portal Ciudadano</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" role="navigation" aria-label="Navegación principal">
          <Link
            href="/"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
          >
            Inicio
          </Link>
          <Link
            href="/tramites"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
          >
            Trámites y Servicios
          </Link>
          <Link
            href="/pqrsdf"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
          >
            Radicar PQRSDF
          </Link>
          <Link
            href="/#paco"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
          >
            Puntos PACO
          </Link>

          <Link href="/auth/login">
            <Button variant="outline" size="sm" className="ml-2 bg-transparent">
              <LogIn className="h-4 w-4 mr-2" />
              Ingresar
            </Button>
          </Link>

          {/* Ícono de accesibilidad fijo en el header, a la izquierda del toggle de dark mode (visible en desktop y mobile) */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
              onClick={() => {
                document.dispatchEvent(new CustomEvent("toggle-accessibility-menu"))
              }}
              aria-label="Abrir menú de accesibilidad"
              title="Opciones de accesibilidad"
            >
              <Accessibility className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Abrir opciones de accesibilidad</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="ml-1"
              aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Cambiar tema</span>
            </Button>
          </div>
        </nav>

        {/* Mobile actions: accesibilidad + dark mode + menú */}
        <div className="flex md:hidden items-center gap-2">
          {/* Ícono de accesibilidad también visible en mobile, antes del toggle y del menú */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              document.dispatchEvent(new CustomEvent("toggle-accessibility-menu"))
            }}
            aria-label="Abrir menú de accesibilidad"
            title="Opciones de accesibilidad"
          >
            <Accessibility className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Abrir opciones de accesibilidad</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Cambiar tema</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menú</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-border bg-background"
          role="navigation"
          aria-label="Navegación móvil"
        >
          <nav className="container mx-auto flex flex-col gap-4 p-4">
            <Link
              href="/"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/tramites"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              Trámites y Servicios
            </Link>
            <Link
              href="/pqrsdf"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              Radicar PQRSDF
            </Link>
            <Link
              href="/#paco"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              Puntos PACO
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              <LogIn className="h-4 w-4" />
              Ingresar
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
