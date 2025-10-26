import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
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
        url_gov
      `)
      .eq("is_active", true)
      .order("nombre_tramite", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching tramites:", error)
      return NextResponse.json({ error: "Failed to fetch tramites" }, { status: 500 })
    }

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

    // Transform data to maintain backward compatibility
    const transformedData = (data || []).map(tramite => ({
      ...tramite,
      dependencia_nombre: tramite.dependencia_id ? dependenciasMap.get(tramite.dependencia_id) || null : null,
      subdependencia_nombre: tramite.subdependencia_id ? dependenciasMap.get(tramite.subdependencia_id) || null : null
    }))

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("[v0] Error in tramites API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
