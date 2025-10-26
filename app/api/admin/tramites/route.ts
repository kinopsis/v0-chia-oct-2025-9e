import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user has admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin or supervisor role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || (profile.role !== "admin" && profile.role !== "supervisor")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get tramites with dependency information
    const { data: tramites, error: tramitesError } = await supabase
      .from("tramites")
      .select(`
        id,
        nombre_tramite,
        descripcion,
        categoria,
        dependencia_id,
        subdependencia_id,
        modalidad,
        requiere_pago,
        requisitos,
        is_active,
        created_at
      `)
      .order("created_at", { ascending: false })

    if (tramitesError) {
      console.error("[admin] Error fetching tramites:", tramitesError)
      return NextResponse.json({ error: "Failed to fetch tramites" }, { status: 500 })
    }

    // Fetch dependencias separately to avoid relationship conflicts
    const { data: dependencias, error: dependenciasError } = await supabase
      .from("dependencias")
      .select("id, nombre")
      .in("tipo", ["dependencia", "subdependencia"])

    if (dependenciasError) {
      console.error("[admin] Error fetching dependencias:", dependenciasError)
      return NextResponse.json({ error: "Failed to fetch dependencias" }, { status: 500 })
    }

    const dependenciasMap = new Map()
    if (dependencias) {
      for (const dep of dependencias) {
        dependenciasMap.set(dep.id, dep.nombre)
      }
    }

    // Transform data to include dependencia_nombre and subdependencia_nombre
    const transformedData = (tramites || []).map(tramite => ({
      ...tramite,
      dependencia_nombre: tramite.dependencia_id ? dependenciasMap.get(tramite.dependencia_id) || "" : "",
      subdependencia_nombre: tramite.subdependencia_id ? dependenciasMap.get(tramite.subdependencia_id) || "" : ""
    }))

    return NextResponse.json({ success: true, data: transformedData })
  } catch (error) {
    console.error("[admin] Error in tramites API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}