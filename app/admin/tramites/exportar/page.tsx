"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Download, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ExportarTramitesPage() {
  const [loading, setLoading] = useState(false)
  const [includeInactive, setIncludeInactive] = useState(false)

  const handleExport = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/tramites/export?includeInactive=${includeInactive}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `tramites-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting tramites:", error)
      alert("Error al exportar trámites")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/admin/tramites" className="text-sm text-blue-600 hover:underline">
          ← Volver a trámites
        </Link>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">Exportar Trámites</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Descarga todos los trámites en formato CSV</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opciones de Exportación</CardTitle>
          <CardDescription>Configura qué datos deseas incluir en el archivo CSV</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-inactive"
              checked={includeInactive}
              onCheckedChange={(checked) => setIncludeInactive(checked as boolean)}
            />
            <Label
              htmlFor="include-inactive"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Incluir trámites inactivos
            </Label>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">El archivo CSV incluirá:</p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
              <li>ID del trámite</li>
              <li>Nombre y descripción</li>
              <li>Categoría y modalidad</li>
              <li>Dependencia y subdependencia</li>
              <li>Requisitos e instrucciones</li>
              <li>Información de pago y tiempo de respuesta</li>
              <li>URLs de referencia</li>
              <li>Estado (activo/inactivo)</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleExport} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar CSV
                </>
              )}
            </Button>
            <Link href="/admin/tramites">
              <Button variant="outline">Cancelar</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
