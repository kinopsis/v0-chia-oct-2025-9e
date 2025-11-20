"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Redirect to admin dashboard
      router.push("/admin")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5faf7] via-[#f0f9ff] to-[#e3f6eb] dark:from-[#020817] dark:via-[#020817] dark:to-[#020817] px-4 py-8">
      <Card className="w-full max-w-md shadow-xl border border-[var(--sidebar-border)] bg-white/95 dark:bg-[#020817]/95 backdrop-blur-sm">
        <CardHeader className="space-y-4">
          {/* Alcaldía de Chía brand: login header with official logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-40 sm:w-48 flex justify-center">
              {/* Logo for light background (default / light theme) */}
              <Image
                src="/light-logo.png"
                alt="Alcaldía de Chía - Logo oficial"
                width={192}
                height={72}
                priority
                className="block dark:hidden h-auto w-auto object-contain"
              />
              {/* Logo for dark background (dark theme) */}
              <Image
                src="/dark-logo-chia.png"
                alt="Alcaldía de Chía - Logo oficial versión oscuro"
                width={192}
                height={72}
                priority
                className="hidden dark:block h-auto w-auto object-contain"
              />
            </div>
            <div className="text-center">
              <CardTitle className="heading-md sm:heading-lg text-[var(--color-primary)]">
                Backoffice Alcaldía de Chía
              </CardTitle>
              <CardDescription className="text-body text-muted-foreground mt-1">
                Acceso exclusivo para funcionarios municipales autorizados.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-label text-[var(--foreground)]">
                Correo electrónico institucional
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu.nombre@chia.gov.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-label text-[var(--foreground)]">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Alcaldía de Chía brand: primary action button uses brand tokens */}
            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>

            <div className="text-center text-caption text-muted-foreground">
              <Link
                href="/"
                className="hover:text-[var(--color-primary)]"
              >
                Volver al portal ciudadano
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
