import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from("documentos")
      .select("*")
      .eq("activo", true)
      .order("fecha_subida", { ascending: false })

    if (error) {
      console.error("Error fetching documentos:", error)
      return NextResponse.json({ error: "Error al obtener documentos" }, { status: 500 })
    }

    return NextResponse.json({ documentos: data })
  } catch (err) {
    console.error("Unexpected error:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
