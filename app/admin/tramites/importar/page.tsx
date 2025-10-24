"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ImportarTramitesPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setLoading(true)
    setResult(null)

    try {
      const text = await file.text()
      const response = await fetch("/api/admin/tramites/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvData: text }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        setTimeout(() => router.push("/admin/tramites"), 2000)
      } else {
        setResult({ success: 0, errors: [data.error || "Error al importar"] })
      }
    } catch (error) {
      setResult({ success: 0, errors: ["Error al procesar el archivo"] })
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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">Importar Trámites</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Carga masiva de trámites desde archivo CSV</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Archivo CSV</CardTitle>
          <CardDescription>
            El archivo debe tener las columnas: id, nombre_tramite, descripcion, categoria, modalidad, formulario,
            dependencia_nombre, subdependencia_nombre, requiere_pago, tiempo_respuesta, requisitos, instrucciones,
            url_suit, url_gov
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
              disabled={loading}
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {file ? file.name : "Haz clic para seleccionar un archivo CSV"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">o arrastra y suelta aquí</p>
            </label>
          </div>

          {file && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
          )}

          {result && (
            <Alert variant={result.errors.length > 0 ? "destructive" : "default"}>
              {result.errors.length === 0 ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertDescription>
                {result.success > 0 && <p className="font-medium">{result.success} trámites importados exitosamente</p>}
                {result.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Errores encontrados:</p>
                    <ul className="list-disc list-inside text-sm mt-1">
                      {result.errors.slice(0, 5).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                      {result.errors.length > 5 && <li>... y {result.errors.length - 5} más</li>}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button onClick={handleImport} disabled={!file || loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar Trámites
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
