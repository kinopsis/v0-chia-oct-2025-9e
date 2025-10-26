"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Procedure } from "@/lib/types"
import { Clock, MapPin, Building2, FileText, ListChecks, ExternalLink, DollarSign } from "lucide-react"

interface ProcedureModalProps {
  procedure: Procedure
  onClose: () => void
}

function isURL(str: string): boolean {
  return str.startsWith("http://") || str.startsWith("https://")
}

function parseListItems(text: string): string[] {
  if (!text) return []

  // Split by pipe character or line breaks
  const items = text.includes("|")
    ? text
        .split("|")
        .map((item) => item.trim())
        .filter(Boolean)
    : text
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)

  return items
}

function formatPaymentInfo(requierePago: string): { requiresPayment: boolean; description: string } {
  const normalized = requierePago.trim().toLowerCase()

  if (normalized === "no") {
    return { requiresPayment: false, description: "Este trámite es gratuito" }
  }

  if (normalized === "si" || normalized === "sí") {
    return { requiresPayment: true, description: "Este trámite requiere pago" }
  }

  // If it's a specific amount or description
  return { requiresPayment: true, description: `Costo: ${requierePago}` }
}

export function ProcedureModal({ procedure, onClose }: ProcedureModalProps) {
  const requisitosList = parseListItems(procedure.requisitos)
  const instruccionesList = parseListItems(procedure.instrucciones)
  const paymentInfo = formatPaymentInfo(procedure.requiere_pago)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-2 mb-2">
            <Badge variant="secondary">{procedure.categoria}</Badge>
            <Badge variant={paymentInfo.requiresPayment ? "default" : "outline"}>
              {paymentInfo.requiresPayment ? "Requiere Pago" : "Gratuito"}
            </Badge>
          </div>
          <DialogTitle className="text-2xl text-balance">{procedure.nombre_tramite}</DialogTitle>
          <DialogDescription className="text-base text-pretty">{procedure.descripcion}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
            <div className="flex items-start gap-3">
              <DollarSign
                className={`h-5 w-5 mt-0.5 flex-shrink-0 ${paymentInfo.requiresPayment ? "text-primary" : "text-green-600 dark:text-green-500"}`}
              />
              <div>
                <p className="font-semibold text-sm mb-1">Información de Pago</p>
                <p className="text-sm text-muted-foreground">{paymentInfo.description}</p>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Tiempo de Respuesta</p>
                <p className="text-sm text-muted-foreground">{procedure.tiempo_respuesta}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Modalidad</p>
                <p className="text-sm text-muted-foreground">{procedure.modalidad}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Dependencia</p>
                <p className="text-sm text-muted-foreground">
                  {procedure.dependencia_nombre || 'No especificada'}
                </p>
                {procedure.subdependencia_nombre && (
                  <p className="text-xs text-muted-foreground">{procedure.subdependencia_nombre}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Formulario</p>
                {isURL(procedure.formulario) ? (
                  <a
                    href={procedure.formulario}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Descargar formulario
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {procedure.formulario.toLowerCase() === "no" ? "NO" : procedure.formulario}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {requisitosList.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg">Requisitos</h3>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <ol className="list-decimal list-inside space-y-2">
                  {requisitosList.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {instruccionesList.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg">Instrucciones</h3>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <ol className="list-decimal list-inside space-y-2">
                  {instruccionesList.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* External Links */}
          <div className="flex flex-col sm:flex-row gap-3">
            {procedure.url_suit && (
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <a href={procedure.url_suit} target="_blank" rel="noopener noreferrer">
                  Ver en SUIT
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
            {procedure.url_gov && (
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <a href={procedure.url_gov} target="_blank" rel="noopener noreferrer">
                  Ver en Gov.co
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
