"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { AccessibilityWrapper } from "@/components/accessibility-wrapper"
import {
  FileText,
  Download,
  Eye,
  Search,
  FolderOpen,
  FileSpreadsheet,
  Calendar,
  HardDrive,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Documento {
  id: string
  nombre: string
  descripcion: string | null
  tipo_archivo: string
  tamano_bytes: number | null
  url_archivo: string
  categoria: string
  fecha_subida: string
  activo: boolean
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(tipo: string) {
  if (tipo.includes("pdf")) return <FileText className="h-8 w-8" />
  if (tipo.includes("word") || tipo.includes("document")) return <FileSpreadsheet className="h-8 w-8" />
  return <FolderOpen className="h-8 w-8" />
}

function getFileExtension(tipo: string): string {
  if (tipo.includes("pdf")) return "PDF"
  if (tipo.includes("word") || tipo.includes("document")) return "DOCX"
  return "DOC"
}

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategoria, setSelectedCategoria] = useState<string>("Todas")

  useEffect(() => {
    async function fetchDocumentos() {
      try {
        const res = await fetch("/api/documentos")
        const data = await res.json()
        setDocumentos(data.documentos || [])
      } catch (err) {
        console.error("Error loading documents:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDocumentos()
  }, [])

  const categorias = ["Todas", ...Array.from(new Set(documentos.map((d) => d.categoria)))]

  const filteredDocs = documentos.filter((doc) => {
    const matchesSearch =
      doc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.descripcion && doc.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategoria = selectedCategoria === "Todas" || doc.categoria === selectedCategoria
    return matchesSearch && matchesCategoria
  })

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Header Section */}
        <section className="relative bg-gradient-to-br from-[#009540]/10 via-background to-[#ffdc00]/5 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#009540]/10 mb-6">
                <FolderOpen className="h-8 w-8 text-[#009540]" />
              </div>
              <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl" style={{ fontFamily: 'var(--font-futura-bold)' }}>
                Documentos Relacionados
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Descarga formularios, normativas y documentos de interés público del municipio de Chía
              </p>
            </div>
          </div>
        </section>

        {/* Search & Filter Bar */}
        <section className="py-6 border-b border-border/40 bg-background sticky top-[116px] z-30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#009540] focus-visible:ring-offset-2"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <select
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  className="py-2.5 px-3 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#009540] focus-visible:ring-offset-2"
                >
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Documents Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-muted mb-4" />
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-full mb-1" />
                      <div className="h-3 bg-muted rounded w-2/3 mb-4" />
                      <div className="flex gap-2">
                        <div className="h-8 bg-muted rounded flex-1" />
                        <div className="h-8 bg-muted rounded flex-1" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center py-16">
                <FolderOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No se encontraron documentos
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm
                    ? "Intenta con otros términos de búsqueda"
                    : "No hay documentos disponibles en este momento"}
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-6 max-w-7xl mx-auto">
                  Mostrando {filteredDocs.length} documento{filteredDocs.length !== 1 ? "s" : ""}
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                  {filteredDocs.map((doc) => (
                    <Card
                      key={doc.id}
                      className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-border/60 hover:border-[#009540]/40"
                    >
                      <CardContent className="p-0">
                        {/* File Type Badge */}
                        <div className="relative bg-gradient-to-br from-[#009540]/5 to-[#009540]/10 dark:from-[#009540]/10 dark:to-[#009540]/20 p-6 pb-4">
                          <div className="absolute top-3 right-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#009540] text-white">
                              {getFileExtension(doc.tipo_archivo)}
                            </span>
                          </div>
                          <div className="w-14 h-14 rounded-xl bg-white dark:bg-card shadow-sm flex items-center justify-center text-[#009540] group-hover:scale-110 transition-transform duration-300">
                            {getFileIcon(doc.tipo_archivo)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 pt-3 flex flex-col">
                          <h3 className="font-bold text-sm leading-tight mb-2 line-clamp-2 text-foreground group-hover:text-[#009540] transition-colors" style={{ fontFamily: 'var(--font-futura-bold)' }}>
                            {doc.nombre}
                          </h3>

                          {doc.descripcion && (
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                              {doc.descripcion}
                            </p>
                          )}

                          {/* Metadata */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                            <span className="inline-flex items-center gap-1">
                              <HardDrive className="h-3 w-3" />
                              {formatFileSize(doc.tamano_bytes)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(doc.fecha_subida).toLocaleDateString("es-CO", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          {/* Category tag */}
                          <div className="mb-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-muted text-muted-foreground font-medium">
                              {doc.categoria}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 mt-auto">
                            {doc.tipo_archivo.includes("pdf") && (
                              <a
                                href={doc.url_archivo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-xs gap-1.5 border-[#009540]/30 text-[#009540] hover:bg-[#009540]/10 hover:text-[#009540]"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  Ver
                                </Button>
                              </a>
                            )}
                            <a
                              href={doc.url_archivo}
                              download
                              className="flex-1"
                            >
                              <Button
                                size="sm"
                                className="w-full text-xs gap-1.5 bg-[#009540] hover:bg-[#007b36] text-white"
                              >
                                <Download className="h-3.5 w-3.5" />
                                Descargar
                              </Button>
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <AccessibilityWrapper />
    </div>
  )
}
