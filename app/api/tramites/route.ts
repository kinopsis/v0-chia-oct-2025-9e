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
        dependencia_nombre,
        subdependencia_nombre,
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

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[v0] Error in tramites API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
