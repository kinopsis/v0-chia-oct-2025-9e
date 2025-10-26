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

    let query = supabase
      .from("tramites")
      .select(`
        id,
        nombre_tramite,
        descripcion,
        categoria,
        modalidad,
        formulario,
        dependencia_id,
        subdependencia_id,
        requiere_pago,
        tiempo_respuesta,
        requisitos,
        instrucciones,
        url_suit,
        url_gov,
        is_active,
        created_at,
        updated_at
      `)
      .order("id", { ascending: true })

    if (!includeInactive) {
      query = query.eq("is_active", true)
    }

    const { data: tramites, error } = await query

    if (error) throw error

    // Get all dependencias for lookup
    const { data: dependenciasData } = await supabase
      .from("dependencias")
      .select("id, nombre")
      .eq("is_active", true)

    const dependenciasMap = new Map()
    if (dependenciasData) {
      for (const dep of dependenciasData) {
        dependenciasMap.set(dep.id, dep.nombre)
      }
    }

    // Transform tramites data to include dependency names
    const transformedTramites = tramites?.map(tramite => ({
      ...tramite,
      dependencia_nombre: tramite.dependencia_id ? dependenciasMap.get(tramite.dependencia_id) || "" : "",
      subdependencia_nombre: tramite.subdependencia_id ? dependenciasMap.get(tramite.subdependencia_id) || "" : ""
    })) || []

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
      "is_active",
      "created_at",
      "updated_at",
    ]

    const csvRows = [headers.join(",")]

    transformedTramites.forEach((tramite) => {
      const row = headers.map((header) => {
        let value = ""
        
        if (header === "dependencia_nombre") {
          value = tramite.dependencia_nombre || ""
        } else if (header === "subdependencia_nombre") {
          value = tramite.subdependencia_nombre || ""
        } else {
          // Type assertion to handle dynamic property access
          const tramiteAny = tramite as any
          value = tramiteAny[header] || ""
        }
        
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
