"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const CATEGORIAS = [
  "Vivienda",
  "Educación",
  "Impuestos",
  "Salud",
  "Tránsito",
  "SISBEN",
  "Medio Ambiente",
  "Emprendimiento",
]

export default function NuevoTramitePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)

    try {
      const response = await fetch("/api/admin/tramites/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push("/admin/tramites")
      } else {
        const result = await response.json()
        setError(result.error || "Error al crear trámite")
      }
    } catch (err) {
      setError("Error al crear trámite")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/admin/tramites" className="text-sm text-blue-600 hover:underline">
          ← Volver a trámites
        </Link>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">Nuevo Trámite</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Crea un nuevo procedimiento municipal</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Trámite</CardTitle>
          <CardDescription>Completa todos los campos requeridos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre_tramite">Nombre del Trámite *</Label>
                <Input id="nombre_tramite" name="nombre_tramite" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea id="descripcion" name="descripcion" rows={4} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Select name="categoria" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modalidad">Modalidad *</Label>
                  <Select name="modalidad" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona modalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="mixta">Mixta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dependencia_nombre">Dependencia *</Label>
                  <Input id="dependencia_nombre" name="dependencia_nombre" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subdependencia_nombre">Subdependencia</Label>
                  <Input id="subdependencia_nombre" name="subdependencia_nombre" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requiere_pago">Requiere Pago *</Label>
                  <Select name="requiere_pago" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sí">Sí</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiempo_respuesta">Tiempo de Respuesta *</Label>
                  <Input id="tiempo_respuesta" name="tiempo_respuesta" placeholder="Ej: 15 días hábiles" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requisitos">Requisitos *</Label>
                <Textarea id="requisitos" name="requisitos" rows={3} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instrucciones">Instrucciones *</Label>
                <Textarea id="instrucciones" name="instrucciones" rows={3} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="url_suit">URL SUIT</Label>
                  <Input id="url_suit" name="url_suit" type="url" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url_gov">URL Gov.co</Label>
                  <Input id="url_gov" name="url_gov" type="url" />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Trámite"
                )}
              </Button>
              <Link href="/admin/tramites">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
