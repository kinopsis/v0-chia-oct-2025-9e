"use client"

import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import LightLogo from "@/public/ligth-logo.png"
import DarkLogo from "@/public/dark-logo-chia.png"
import { Moon, Sun, Menu, LogIn, Accessibility } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { AccessibilityMenu } from "@/components/accessibility-menu"

export function Header() {
  const { theme, systemTheme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [accessibilityMenuOpen, setAccessibilityMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)

    const handleToggleAccessibility = () => {
      setAccessibilityMenuOpen((prev) => !prev)
    }

    document.addEventListener("toggle-accessibility-menu", handleToggleAccessibility)
    return () => {
      document.removeEventListener("toggle-accessibility-menu", handleToggleAccessibility)
    }
  }, [])

  const resolvedTheme = !mounted
    ? "light"
    : (theme === "system" ? systemTheme : theme) || "light"

  const isDark = resolvedTheme === "dark"

  const logoSrc = isDark ? DarkLogo : LightLogo
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
            <Image
              src={logoSrc}
              alt={logoAlt}
              width={600}
              height={140}
              priority
              className="h-16 w-auto object-contain md:h-20 lg:h-24 max-w-full"
            />
          </Link>
        </div>
      </div>

      {/* Franja divisoria amarilla entre logo y navegación */}
      <div className="w-full h-2 bg-[#ffdc00]" aria-hidden="true" />

      {/* Barra de navegación principal */}
      <div
        className={[
          "border-b border-border/60",
          isDark
            ? "bg-background/95"
            : "bg-[#009540] text-white",
        ].join(" ")}
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
              className={
                isDark
                  ? "text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
                  : "text-sm font-medium text-white hover:text-yellow-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white rounded px-2 py-1"
              }
            >
              Inicio
            </Link>
            <Link
              href="/tramites"
              className={
                isDark
                  ? "text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
                  : "text-sm font-medium text-white hover:text-yellow-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white rounded px-2 py-1"
              }
            >
              Trámites y Servicios
            </Link>
            <Link
              href="/pqrsdf"
              className={
                isDark
                  ? "text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
                  : "text-sm font-medium text-white hover:text-yellow-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white rounded px-2 py-1"
              }
            >
              Radicar PQRSDF
            </Link>
            <Link
              href="/#paco"
              className={
                isDark
                  ? "text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
                  : "text-sm font-medium text-white hover:text-yellow-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white rounded px-2 py-1"
              }
            >
              Puntos PACO
            </Link>
          </nav>

          {/* Acciones derecha desktop: login + accesibilidad + tema */}
          <div className="hidden md:flex items-center gap-2 ml-4">
            <Link href="/auth/login">
              <Button
                variant={isDark ? "outline" : "secondary"}
                size="sm"
                className={
                  isDark
                    ? "bg-transparent"
                    : "bg-white text-[#009540] hover:bg-yellow-300 hover:text-[#004b25] font-semibold"
                }
              >
                <LogIn className="h-4 w-4 mr-2" aria-hidden="true" />
                <span>Ingresar</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className={
                isDark
                  ? "ml-1 text-foreground hover:text-primary"
                  : "ml-1 text-white hover:text-yellow-300"
              }
              onClick={() => {
                document.dispatchEvent(
                  new CustomEvent("toggle-accessibility-menu")
                )
              }}
              aria-label="Abrir menú de accesibilidad"
              title="Opciones de accesibilidad"
            >
              <Accessibility className="h-5 w-5" aria-hidden="true" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleTheme}
              className={
                isDark
                  ? "ml-1 text-foreground hover:text-primary"
                  : "ml-1 text-white hover:text-yellow-300"
              }
              aria-label={
                isDark
                  ? "Cambiar a modo claro"
                  : "Cambiar a modo oscuro"
              }
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Cambiar tema</span>
            </Button>
          </div>

          {/* Acciones mobile: accesibilidad + tema + menú */}
          <div className="flex md:hidden items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className={
                isDark
                  ? "text-foreground hover:text-primary"
                  : "text-white hover:text-yellow-300"
              }
              onClick={() => {
                document.dispatchEvent(
                  new CustomEvent("toggle-accessibility-menu")
                )
              }}
              aria-label="Abrir menú de accesibilidad"
              title="Opciones de accesibilidad"
            >
              <Accessibility className="h-5 w-5" aria-hidden="true" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={
                isDark
                  ? "text-foreground hover:text-primary"
                  : "text-white hover:text-yellow-300"
              }
              onClick={handleToggleTheme}
              aria-label={
                isDark
                  ? "Cambiar a modo claro"
                  : "Cambiar a modo oscuro"
              }
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Cambiar tema</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={
                isDark
                  ? "text-foreground hover:text-primary"
                  : "text-white hover:text-yellow-300"
              }
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Menú</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className={
            isDark
              ? "md:hidden border-t border-border bg-background"
              : "md:hidden border-t border-border bg-[#009540] text-white"
          }
          role="navigation"
          aria-label="Navegación móvil"
        >
          <nav className="container mx-auto flex flex-col gap-2 p-4">
            <Link
              href="/"
              className={
                isDark
                  ? "text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
                  : "text-sm font-medium text-white hover:text-yellow-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 rounded px-2 py-1"
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/tramites"
              className={
                isDark
                  ? "text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
                  : "text-sm font-medium text-white hover:text-yellow-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 rounded px-2 py-1"
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              Trámites y Servicios
            </Link>
            <Link
              href="/pqrsdf"
              className={
                isDark
                  ? "text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
                  : "text-sm font-medium text-white hover:text-yellow-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 rounded px-2 py-1"
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              Radicar PQRSDF
            </Link>
            <Link
              href="/#paco"
              className={
                isDark
                  ? "text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
                  : "text-sm font-medium text-white hover:text-yellow-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 rounded px-2 py-1"
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              Puntos PACO
            </Link>
            <Link
              href="/auth/login"
              className={
                isDark
                  ? "flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
                  : "flex items-center gap-2 text-sm font-medium text-white hover:text-yellow-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 rounded px-2 py-1"
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              <span>Ingresar</span>
            </Link>
          </nav>
        </div>
      )}

      {/* Contenedor fijo para el menú de accesibilidad:
          - Siempre sobre el contenido.
          - Anclado debajo del header sticky.
          - No desplaza el layout principal. */}
      <div
        className="fixed left-1/2 -translate-x-1/2 mt-0 top-[72px] md:top-[84px] z-[60] max-w-full"
        aria-live="polite"
        aria-atomic="true"
      >
        {accessibilityMenuOpen && (
          <AccessibilityMenu />
        )}
      </div>
    </header>
  )
}
