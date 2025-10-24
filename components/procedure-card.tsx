"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Procedure } from "@/lib/types"
import { Clock, MapPin } from "lucide-react"

interface ProcedureCardProps {
  procedure: Procedure
  onClick: () => void
}

function formatPaymentBadge(requierePago: string): { text: string; variant: "default" | "outline" | "secondary" } {
  const normalized = requierePago.trim().toLowerCase()

  if (normalized === "no") {
    return { text: "Gratis", variant: "outline" }
  }

  // For any value other than "no", show "Requiere Pago"
  return { text: "Requiere Pago", variant: "default" }
}

export function ProcedureCard({ procedure, onClick }: ProcedureCardProps) {
  const paymentInfo = formatPaymentBadge(procedure.requiere_pago)

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Ver detalles de ${procedure.nombre_tramite}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
          <Badge variant="secondary" className="text-xs max-w-[60%] break-words line-clamp-2">
            {procedure.categoria}
          </Badge>
          <Badge variant={paymentInfo.variant} className="text-xs flex-shrink-0">
            {paymentInfo.text}
          </Badge>
        </div>
        <CardTitle className="text-base leading-tight line-clamp-2">{procedure.nombre_tramite}</CardTitle>
        <CardDescription className="line-clamp-2 text-sm">{procedure.descripcion}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="text-xs">{procedure.tiempo_respuesta}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="text-xs line-clamp-1">{procedure.modalidad}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
