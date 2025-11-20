"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Moon, Sun, Menu, X, Building2 } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { navigation } from "./admin-sidebar"
import { cn } from "@/lib/utils"

interface AdminHeaderProps {
  user: any
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isAdmin = user?.profile?.role === "admin"

  const filteredNavigation = navigation.filter((item) => !item.adminOnly || isAdmin)

  const handleLogout = async () => {
    await fetch("/auth/logout", { method: "POST" })
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <Link href="/admin">
            <Image
              src={theme === 'dark' ? '/dark-logo-chia.png' : '/ligth-logo.png'}
              alt="Logo Chía"
              height={40}
              width={120}
              className="h-8 w-auto sm:h-10"
            />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-xl p-4 flex flex-col animate-slide-right">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-lg">Backoffice</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.profile?.full_name || "Usuario"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                    {user?.profile?.role || "funcionario"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
