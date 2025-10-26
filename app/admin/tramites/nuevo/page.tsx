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
import { DependencyPairSelector } from "@/components/admin/dependency-selector"

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
  const [dependenciaId, setDependenciaId] = useState<number | null>(null)
  const [subdependenciaId, setSubdependenciaId] = useState<number | null>(null)
  const [esPago, setEsPago] = useState<boolean>(false)
  const [informacionPago, setInformacionPago] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)

    // Add dependency IDs to the form data
    if (dependenciaId) {
      (data as any).dependencia_id = dependenciaId
    }
    if (subdependenciaId) {
      (data as any).subdependencia_id = subdependenciaId
    }

    // Validar selección de radio buttons
    if (esPago !== true && esPago !== false) {
      setError("Debe seleccionar 'Sí' o 'No' para el campo 'requiere_pago'")
      setLoading(false)
      return
    }

    // Validar información de pago si requiere pago
    if (esPago && (!informacionPago || !informacionPago.trim())) {
      setError("La información del pago es requerida cuando el trámite requiere pago")
      setLoading(false)
      return
    }

    // Asegurar que el valor de requiere_pago sea el correcto
    (data as any).requiere_pago = esPago ? "Sí" : "No"
    
    // Si requiere pago, también enviar la información detallada en su campo correspondiente
    if (esPago && informacionPago.trim()) {
      (data as any).informacion_pago = informacionPago.trim()
    }

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dependencia *
                </label>
                <DependencyPairSelector
                  dependenciaId={dependenciaId}
                  subdependenciaId={subdependenciaId}
                  onDependenciaChange={setDependenciaId}
                  onSubdependenciaChange={setSubdependenciaId}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Requiere Pago *</Label>
                  <div className="flex gap-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="requiere_pago_opcion"
                        value="Sí"
                        checked={esPago}
                        onChange={(e) => {
                          setEsPago(true);
                        }}
                        className="mr-2"
                      />
                      <span>Sí</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="requiere_pago_opcion"
                        value="No"
                        checked={!esPago}
                        onChange={(e) => {
                          setEsPago(false);
                          setInformacionPago(""); // Limpiar información de pago
                        }}
                        className="mr-2"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiempo_respuesta">Tiempo de Respuesta *</Label>
                  <Input id="tiempo_respuesta" name="tiempo_respuesta" placeholder="Ej: 15 días hábiles" required />
                </div>
              </div>

               {esPago && (
                 <div className="space-y-2">
                   <Label htmlFor="informacion_pago">Información del Pago *</Label>
                   <Textarea
                     id="informacion_pago"
                     name="informacion_pago"
                     value={informacionPago}
                     onChange={(e) => setInformacionPago(e.target.value)}
                     placeholder="Ingrese la información del pago (ej: $50.000, 0.2 UVT, Variable según caso)"
                     rows={3}
                     className="font-mono text-sm"
                     required
                   />
                   <p className="text-sm text-gray-600">
                     Esta información detallada del pago se guardará por separado del campo "requiere_pago"
                   </p>
                 </div>
               )}

              <div className="space-y-2">
                <Label htmlFor="requisitos">Requisitos *</Label>
                <Textarea id="requisitos" name="requisitos" rows={3} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="formulario">Formulario</Label>
                <Textarea
                  id="formulario"
                  name="formulario"
                  rows={3}
                  placeholder="Describe el formulario necesario para este trámite o deja en blanco si no aplica"
                />
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
