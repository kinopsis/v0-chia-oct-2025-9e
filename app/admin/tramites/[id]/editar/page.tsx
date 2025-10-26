"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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
import { isValidRequierePago } from "@/lib/utils/validation"

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

export default function EditarTramitePage() {
  const router = useRouter()
  const params = useParams()
  const tramiteId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tramiteData, setTramiteData] = useState<any>(null)
  const [dependenciaId, setDependenciaId] = useState<number | null>(null)
  const [subdependenciaId, setSubdependenciaId] = useState<number | null>(null)
  const [esPago, setEsPago] = useState<boolean>(false)
  const [informacionPago, setInformacionPago] = useState<string>("")

  // Cargar datos del trámite al montarse
  useEffect(() => {
    const fetchTramite = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/admin/tramites/${tramiteId}`)
        
        if (!response.ok) {
          throw new Error("Error al cargar trámite")
        }
        
        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.error || "Error al cargar trámite")
        }
        
        const tramite = result.data
        
        // Setear datos del trámite
        setTramiteData(tramite)
        
        // Setear dependencias si existen (usando los IDs directamente de la respuesta)
        if (tramite.dependencia_id) {
          setDependenciaId(tramite.dependencia_id)
        }
        if (tramite.subdependencia_id) {
          setSubdependenciaId(tramite.subdependencia_id)
        }
        
        // Determinar si el trámite requiere pago y configurar estados
        const valorActual = tramite.requiere_pago || ""
        const tieneInformacionPago = valorActual !== "No" && valorActual !== "" && valorActual !== null && valorActual !== "no"
        
        setEsPago(tieneInformacionPago)
        setInformacionPago(tieneInformacionPago ? valorActual : "")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar trámite")
      } finally {
        setLoading(false)
      }
    }
    
    if (tramiteId) {
      fetchTramite()
    }
  }, [tramiteId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    // Validar selección de radio buttons
    if (esPago !== true && esPago !== false) {
      setError("Debe seleccionar 'Sí' o 'No' para el campo 'requiere_pago'")
      setSaving(false)
      return
    }

    // Validar información de pago si requiere pago
    if (esPago && (!informacionPago || !informacionPago.trim())) {
      setError("La información del pago es requerida cuando el trámite requiere pago")
      setSaving(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)

    // Add dependency IDs to the form data
    if (dependenciaId) {
      (data as any).dependencia_id = dependenciaId
    }
    if (subdependenciaId) {
      (data as any).subdependencia_id = subdependenciaId
    }

    // Asegurar que el valor de requiere_pago sea el correcto
    (data as any).requiere_pago = esPago ? "Sí" : "No"
    
    // Si requiere pago, también enviar la información detallada en su campo correspondiente
    if (esPago && informacionPago.trim()) {
      (data as any).informacion_pago = informacionPago.trim()
    }

    try {
      const response = await fetch(`/api/admin/tramites/${tramiteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push("/admin/tramites")
      } else {
        const result = await response.json()
        setError(result.error || "Error al actualizar trámite")
      }
    } catch (err) {
      setError("Error al actualizar trámite")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!tramiteData) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Link href="/admin/tramites" className="text-sm text-blue-600 hover:underline">
            ← Volver a trámites
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">Trámite no encontrado</h2>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No se encontró el trámite con ID {tramiteId}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/admin/tramites" className="text-sm text-blue-600 hover:underline">
          ← Volver a trámites
        </Link>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">Editar Trámite</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Actualiza la información del procedimiento municipal</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Trámite</CardTitle>
          <CardDescription>Edita los campos requeridos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Información Básica */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nombre_tramite">Nombre del Trámite *</Label>
                <Input
                  id="nombre_tramite"
                  name="nombre_tramite"
                  defaultValue={tramiteData.nombre_tramite}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  rows={4}
                  defaultValue={tramiteData.descripcion}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Select name="categoria" defaultValue={tramiteData.categoria} required>
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
                  <Select name="modalidad" defaultValue={tramiteData.modalidad} required>
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
            </div>

            {/* Dependencias y Formulario */}
            <div className="space-y-6">
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

              <div className="space-y-2">
                <Label htmlFor="formulario">Formulario</Label>
                <Input
                  id="formulario"
                  name="formulario"
                  defaultValue={tramiteData.formulario || ""}
                  placeholder="URL del formulario o nombre del formulario"
                />
              </div>
            </div>

            {/* Requisitos y Proceso */}
            <div className="space-y-6">
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
                        setEsPago(true)
                        // Mantener la información de pago existente si hay
                        if (!informacionPago && tramiteData?.requiere_pago) {
                          setInformacionPago(tramiteData.requiere_pago)
                        }
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
                        setEsPago(false)
                        setInformacionPago("") // Limpiar información de pago
                      }}
                      className="mr-2"
                    />
                    <span>No</span>
                  </label>
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

              <div className="grid grid-cols-2 gap-6">

                <div className="space-y-2">
                  <Label htmlFor="tiempo_respuesta">Tiempo de Respuesta *</Label>
                  <Input
                    id="tiempo_respuesta"
                    name="tiempo_respuesta"
                    defaultValue={tramiteData.tiempo_respuesta}
                    placeholder="Ej: 15 días hábiles"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requisitos">Requisitos *</Label>
                <Textarea
                  id="requisitos"
                  name="requisitos"
                  rows={3}
                  defaultValue={tramiteData.requisitos}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instrucciones">Instrucciones *</Label>
                <Textarea
                  id="instrucciones"
                  name="instrucciones"
                  rows={3}
                  defaultValue={tramiteData.instrucciones}
                  required
                />
              </div>
            </div>

            {/* Información Adicional */}
            <div className="space-y-2">
              <Label htmlFor="url_suit">URL SUIT</Label>
              <Input
                id="url_suit"
                name="url_suit"
                type="url"
                defaultValue={tramiteData.url_suit || ""}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url_gov">URL Gov.co</Label>
              <Input
                id="url_gov"
                name="url_gov"
                type="url"
                defaultValue={tramiteData.url_gov || ""}
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Trámite"
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