import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get("includeInactive") === "true"

    let query = supabase.from("tramites").select("*").order("id", { ascending: true })

    if (!includeInactive) {
      query = query.eq("is_active", true)
    }

    const { data: tramites, error } = await query

    if (error) throw error

    // Generate CSV
    const headers = [
      "id",
      "nombre_tramite",
      "descripcion",
      "categoria",
      "modalidad",
      "formulario",
      "dependencia_nombre",
      "subdependencia_nombre",
      "requiere_pago",
      "tiempo_respuesta",
      "requisitos",
      "instrucciones",
      "url_suit",
      "url_gov",
    ]

    const csvRows = [headers.join(",")]

    tramites?.forEach((tramite) => {
      const row = headers.map((header) => {
        const value = tramite[header] || ""
        // Escape quotes and wrap in quotes if contains comma
        const escaped = String(value).replace(/"/g, '""')
        return escaped.includes(",") ? `"${escaped}"` : escaped
      })
      csvRows.push(row.join(","))
    })

    const csv = csvRows.join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="tramites-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
