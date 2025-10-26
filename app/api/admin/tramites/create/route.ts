import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tramiteData = await request.json()

    // Validate requiere_pago field - debe ser "Sí" o "No" (no valores detallados)
    if (tramiteData.requiere_pago !== "Sí" && tramiteData.requiere_pago !== "No") {
      return NextResponse.json({
        error: "El campo 'requiere_pago' debe contener 'Sí' o 'No'. La información detallada del pago debe ir en el campo correspondiente."
      }, { status: 400 })
    }

    // Validate relationship between requiere_pago and informacion_pago
    if (tramiteData.requiere_pago === "Sí" && (!tramiteData.informacion_pago || !tramiteData.informacion_pago.trim())) {
      return NextResponse.json({
        error: "Cuando 'requiere_pago' es 'Sí', el campo 'informacion_pago' es requerido"
      }, { status: 400 })
    }

    if (tramiteData.requiere_pago === "No" && tramiteData.informacion_pago && tramiteData.informacion_pago.trim()) {
      return NextResponse.json({
        error: "Cuando 'requiere_pago' es 'No', el campo 'informacion_pago' debe estar vacío"
      }, { status: 400 })
    }

    // Prepare data for insertion, handling both old and new dependency fields
    const insertData: any = {
      nombre_tramite: tramiteData.nombre_tramite,
      descripcion: tramiteData.descripcion,
      categoria: tramiteData.categoria,
      modalidad: tramiteData.modalidad,
      formulario: tramiteData.formulario || "",
      requiere_pago: tramiteData.requiere_pago,
      tiempo_respuesta: tramiteData.tiempo_respuesta,
      requisitos: tramiteData.requisitos,
      instrucciones: tramiteData.instrucciones,
      url_suit: tramiteData.url_suit || "",
      url_gov: tramiteData.url_gov || "",
      is_active: true,
      created_by: user.id,
      updated_by: user.id,
    }

    // Handle informacion_pago field if provided
    if (tramiteData.informacion_pago !== undefined) {
      insertData.informacion_pago = tramiteData.informacion_pago?.trim() || null
    }

    // Handle new dependency structure
    if (tramiteData.dependencia_id) {
      insertData.dependencia_id = parseInt(tramiteData.dependencia_id);
    }
    if (tramiteData.subdependencia_id) {
      insertData.subdependencia_id = parseInt(tramiteData.subdependencia_id);
    }

    // Handle legacy dependency fields (for backward compatibility during transition)
    if (tramiteData.dependencia_nombre && !tramiteData.dependencia_id) {
      // Find or create dependency by name (legacy support)
      const { data: existingDep } = await supabase
        .from("dependencias")
        .select("id")
        .ilike("nombre", tramiteData.dependencia_nombre)
        .eq("tipo", "dependencia")
        .single();

      if (existingDep) {
        insertData.dependencia_id = existingDep.id;
      }
    }

    if (tramiteData.subdependencia_nombre && !tramiteData.subdependencia_id) {
      // Find or create subdependency by name (legacy support)
      const { data: existingSubDep } = await supabase
        .from("dependencias")
        .select("id")
        .ilike("nombre", tramiteData.subdependencia_nombre)
        .eq("tipo", "subdependencia")
        .single();

      if (existingSubDep) {
        insertData.subdependencia_id = existingSubDep.id;
      }
    }

    const { data, error } = await supabase
      .from("tramites")
      .insert(insertData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
