"use client"

import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { Moon, Sun, Menu, LogIn, Accessibility } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { AccessibilityMenu } from "@/components/accessibility-menu"

export function Header() {
  const { theme, systemTheme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isAccessibilityMenuOpen, setAccessibilityMenuOpen] = useState(false)
  const accessibilityButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const resolvedTheme = !mounted
    ? "light"
    : (theme === "system" ? systemTheme : theme) || "light"

  const isDark = resolvedTheme === "dark"


  const logoAlt = "Alcaldía de Chía - Portal Ciudadano"

  const handleToggleTheme = () => {
    if (!mounted) return
    const next = isDark ? "light" : "dark"
    setTheme(next)
  }

  return (
    <header
      className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm"
      aria-label="Encabezado principal del sitio"
    >
      {/* Bloque superior con logo centrado */}
      <div className="w-full border-b border-border/40 bg-gradient-to-b from-neutral-100 to-background dark:from-zinc-900 dark:to-background">
        <div
          className="container mx-auto flex flex-col items-center justify-center px-4 pt-4 pb-4 md:pt-5 md:pb-5"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
            aria-label="Ir al inicio - Alcaldía de Chía"
          >
            <div className="relative flex items-center justify-center">
              <Image
                src="/light-logo.png"
                alt={logoAlt}
                width={600}
                height={140}
                priority
                className="h-16 w-auto object-contain md:h-20 lg:h-24 max-w-full block dark:hidden"
              />
              <Image
                src="/dark-logo-chia.png"
                alt={logoAlt}
                width={600}
                height={140}
                priority
                className="h-16 w-auto object-contain md:h-20 lg:h-24 max-w-full hidden dark:block"
              />
            </div>
          </Link>
        </div>
      </div>

      {/* Franja divisoria amarilla entre logo y navegación */}
      <div className="w-full h-2 bg-[#ffdc00]" aria-hidden="true" />

      {/* Barra de navegación principal */}
      {/* Barra de navegación principal */}
      <div
        className="border-b border-border/60 bg-[#009540] text-white dark:bg-background/95 dark:text-foreground transition-colors"
      >
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          {/* Navegación desktop centrada */}
          <nav
            className="hidden md:flex flex-1 items-center justify-center gap-6"
            role="navigation"
            aria-label="Navegación principal"
          >
            <Link
              href="/"
              className="text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded px-2 py-1 text-white hover:text-yellow-300 focus-visible:ring-white dark:text-foreground dark:hover:text-primary dark:focus-visible:ring-ring"
            >
              Inicio
            </Link>
            <Link
              href="/tramites"
              className="text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded px-2 py-1 text-white hover:text-yellow-300 focus-visible:ring-white dark:text-foreground dark:hover:text-primary dark:focus-visible:ring-ring"
            >
              Trámites y Servicios
            </Link>
            <Link
              href="/pqrsdf"
              className="text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded px-2 py-1 text-white hover:text-yellow-300 focus-visible:ring-white dark:text-foreground dark:hover:text-primary dark:focus-visible:ring-ring"
            >
              Radicar PQRSDF
            </Link>
            <Link
              href="/#paco"
              className="text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded px-2 py-1 text-white hover:text-yellow-300 focus-visible:ring-white dark:text-foreground dark:hover:text-primary dark:focus-visible:ring-ring"
            >
              Puntos PACO
            </Link>
          </nav>

          {/* Contenedor de acciones unificado para desktop y mobile */}
          <div className="flex items-center gap-1 md:gap-2 ml-auto relative">
            {/* Botón de Login (solo desktop) */}
            <Link href="/auth/login" className="hidden md:block">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-[#009540] hover:bg-yellow-300 hover:text-[#004b25] font-semibold dark:bg-transparent dark:text-foreground dark:border dark:border-input dark:hover:bg-accent dark:hover:text-accent-foreground transition-colors"
              >
                <LogIn className="h-4 w-4 mr-2" aria-hidden="true" />
                <span>Ingresar</span>
              </Button>
            </Link>

            {/* Botón de Accesibilidad (unificado) */}
            <Button
              ref={accessibilityButtonRef}
              variant="ghost"
              size="icon"
              className="text-white hover:text-yellow-300 dark:text-foreground dark:hover:text-primary transition-colors"
              onClick={() => setAccessibilityMenuOpen((prev) => !prev)}
              aria-label="Abrir menú de accesibilidad"
              aria-expanded={isAccessibilityMenuOpen}
              aria-controls="accessibility-menu"
              title="Opciones de accesibilidad"
            >
              <Accessibility className="h-5 w-5" aria-hidden="true" />
            </Button>

            {/* Botón de Tema (unificado) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleTheme}
              className="text-white hover:text-yellow-300 dark:text-foreground dark:hover:text-primary transition-colors"
              aria-label={
                isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
              }
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Cambiar tema</span>
            </Button>

            {/* Menú de hamburguesa (solo mobile) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:text-yellow-300 dark:text-foreground dark:hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Menú</span>
            </Button>

            {/* Instancia única del menú de accesibilidad */}
            <AccessibilityMenu
              isOpen={isAccessibilityMenuOpen}
              onClose={() => setAccessibilityMenuOpen(false)}
              triggerRef={accessibilityButtonRef}
            />
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-border bg-[#009540] text-white dark:bg-background dark:text-foreground transition-colors"
          role="navigation"
          aria-label="Navegación móvil"
        >
          <nav className="container mx-auto flex flex-col gap-2 p-4">
            <Link
              href="/"
              className="text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded px-2 py-1 text-white hover:text-yellow-300 focus-visible:ring-white dark:text-foreground dark:hover:text-primary dark:focus-visible:ring-ring"
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/tramites"
              className="text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded px-2 py-1 text-white hover:text-yellow-300 focus-visible:ring-white dark:text-foreground dark:hover:text-primary dark:focus-visible:ring-ring"
              onClick={() => setMobileMenuOpen(false)}
            >
              Trámites y Servicios
            </Link>
            <Link
              href="/pqrsdf"
              className="text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded px-2 py-1 text-white hover:text-yellow-300 focus-visible:ring-white dark:text-foreground dark:hover:text-primary dark:focus-visible:ring-ring"
              onClick={() => setMobileMenuOpen(false)}
            >
              Radicar PQRSDF
            </Link>
            <Link
              href="/#paco"
              className="text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded px-2 py-1 text-white hover:text-yellow-300 focus-visible:ring-white dark:text-foreground dark:hover:text-primary dark:focus-visible:ring-ring"
              onClick={() => setMobileMenuOpen(false)}
            >
              Puntos PACO
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded px-2 py-1 text-white hover:text-yellow-300 focus-visible:ring-white dark:text-foreground dark:hover:text-primary dark:focus-visible:ring-ring"
              onClick={() => setMobileMenuOpen(false)}
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              <span>Ingresar</span>
            </Link>
          </nav>
        </div>
      )}

    </header>
  )
}
