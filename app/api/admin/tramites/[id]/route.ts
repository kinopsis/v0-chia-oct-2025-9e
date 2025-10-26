import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
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

    const tramiteId = (await params).id
    
    // Get tramite basic information
    const { data: tramiteData, error: tramiteError } = await supabase
      .from("tramites")
      .select("*")
      .eq("id", tramiteId)
      .single()

    if (tramiteError) throw tramiteError

    if (!tramiteData) {
      return NextResponse.json({ error: "Trámite no encontrado" }, { status: 404 })
    }

    // Get dependency information if exists
    let dependenciaData = null
    let subdependenciaData = null

    if (tramiteData.dependencia_id) {
      const { data: dependencia, error: depError } = await supabase
        .from("dependencias")
        .select("id, nombre, tipo")
        .eq("id", tramiteData.dependencia_id)
        .single()
      
      if (!depError && dependencia) {
        dependenciaData = dependencia
      }
    }

    if (tramiteData.subdependencia_id) {
      const { data: subdependencia, error: subError } = await supabase
        .from("dependencias")
        .select("id, nombre, tipo")
        .eq("id", tramiteData.subdependencia_id)
        .single()
      
      if (!subError && subdependencia) {
        subdependenciaData = subdependencia
      }
    }

    // Combine data
    const responseData = {
      ...tramiteData,
      dependencia: dependenciaData,
      subdependencia: subdependenciaData
    }

    return NextResponse.json({ success: true, data: responseData })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
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

    const tramiteId = (await params).id
    const data = await request.json()

    // Validaciones robustas para el trámite
    const validationErrors = []

    // Validar campos obligatorios
    if (!data.nombre_tramite || !data.nombre_tramite.trim()) {
      validationErrors.push("El campo 'nombre_tramite' es requerido")
    }

    if (!data.descripcion || !data.descripcion.trim()) {
      validationErrors.push("El campo 'descripcion' es requerido")
    }

    if (!data.categoria) {
      validationErrors.push("El campo 'categoria' es requerido")
    }

    if (!data.modalidad) {
      validationErrors.push("El campo 'modalidad' es requerido")
    }

    if (!data.tiempo_respuesta || !data.tiempo_respuesta.trim()) {
      validationErrors.push("El campo 'tiempo_respuesta' es requerido")
    }

    if (!data.requisitos || !data.requisitos.trim()) {
      validationErrors.push("El campo 'requisitos' es requerido")
    }

    if (!data.instrucciones || !data.instrucciones.trim()) {
      validationErrors.push("El campo 'instrucciones' es requerido")
    }

    // Validar dependencia o subdependencia
    if (!data.dependencia_id && !data.subdependencia_id) {
      validationErrors.push("Debe seleccionar al menos una dependencia o subdependencia")
    }

    // Validar dependencia si se proporciona
    if (data.dependencia_id) {
      const { data: dependencia, error: depError } = await supabase
        .from("dependencias")
        .select("id")
        .eq("id", data.dependencia_id)
        .eq("is_active", true)
        .single()

      if (depError || !dependencia) {
        validationErrors.push("La dependencia seleccionada no existe o no está activa")
      }
    }

    // Validar subdependencia si se proporciona
    if (data.subdependencia_id) {
      const { data: subdependencia, error: subError } = await supabase
        .from("dependencias")
        .select("id, dependencia_padre_id")
        .eq("id", data.subdependencia_id)
        .eq("is_active", true)
        .single()

      if (subError || !subdependencia) {
        validationErrors.push("La subdependencia seleccionada no existe o no está activa")
      } else if (data.dependencia_id && subdependencia.dependencia_padre_id !== data.dependencia_id) {
        validationErrors.push("La subdependencia no pertenece a la dependencia seleccionada")
      }
    }

    // Validar campo requiere_pago (debe ser "Sí" o "No" o nulo)
    if (data.requiere_pago !== undefined && data.requiere_pago !== null) {
      if (data.requiere_pago !== "Sí" && data.requiere_pago !== "No") {
        validationErrors.push("El campo 'requiere_pago' debe ser 'Sí' o 'No'")
      }
    }

    // Validar relación entre requiere_pago e informacion_pago
    if (data.requiere_pago === "Sí" && (!data.informacion_pago || !data.informacion_pago.trim())) {
      validationErrors.push("Cuando 'requiere_pago' es 'Sí', el campo 'informacion_pago' es requerido")
    }

    if (data.requiere_pago === "No" && data.informacion_pago && data.informacion_pago.trim()) {
      validationErrors.push("Cuando 'requiere_pago' es 'No', el campo 'informacion_pago' debe estar vacío")
    }

    // Validar que el trámite exista
    const { data: existingTramite, error: tramiteError } = await supabase
      .from("tramites")
      .select("id")
      .eq("id", tramiteId)
      .single()

    if (tramiteError || !existingTramite) {
      return NextResponse.json({ error: "Trámite no encontrado" }, { status: 404 })
    }

    // Si hay errores de validación, devolverlos
    if (validationErrors.length > 0) {
      return NextResponse.json({
        error: "Errores de validación",
        details: validationErrors
      }, { status: 400 })
    }

    // Preparar datos para actualización
    const updateData: any = {
      nombre_tramite: data.nombre_tramite?.trim(),
      descripcion: data.descripcion?.trim(),
      categoria: data.categoria,
      modalidad: data.modalidad,
      tiempo_respuesta: data.tiempo_respuesta?.trim(),
      requisitos: data.requisitos?.trim(),
      instrucciones: data.instrucciones?.trim(),
      updated_at: new Date().toISOString(),
      updated_by: user.id
    }

    // Manejar campos opcionales
    if (data.dependencia_id !== undefined) {
      updateData.dependencia_id = data.dependencia_id || null
    }

    if (data.subdependencia_id !== undefined) {
      updateData.subdependencia_id = data.subdependencia_id || null
    }

    if (data.requiere_pago !== undefined) {
      updateData.requiere_pago = data.requiere_pago || null
    }

    if (data.informacion_pago !== undefined) {
      updateData.informacion_pago = data.informacion_pago?.trim() || null
    }

    if (data.formulario !== undefined) {
      updateData.formulario = data.formulario?.trim() || ""
    }

    if (data.url_suit !== undefined) {
      updateData.url_suit = data.url_suit?.trim() || ""
    }

    if (data.url_gov !== undefined) {
      updateData.url_gov = data.url_gov?.trim() || ""
    }

    // Actualizar el trámite
    const { data: updatedTramite, error: updateError } = await supabase
      .from("tramites")
      .update(updateData)
      .eq("id", tramiteId)
      .select(`
        *,
        dependencias!tramites_dependencia_id_fkey (id, nombre, tipo) AS dependencia,
        dependencias!tramites_subdependencia_id_fkey (id, nombre, tipo) AS subdependencia
      `)
      .single()

    if (updateError) {
      console.error("Error detallado en actualización de trámite:", {
        code: updateError?.code,
        message: updateError?.message,
        details: updateError?.details,
        hint: updateError?.hint,
        updateData,
        tramiteId
      })

      // Manejar errores específicos de base de datos
      if (updateError?.code === '23505') { // Violación de restricción única
        return NextResponse.json({
          error: "Ya existe un trámite con este nombre"
        }, { status: 409 })
      }

      if (updateError?.code === '23503') { // Foreign key violation
        return NextResponse.json({
          error: "Dependencia o subdependencia no válida",
          details: "La dependencia o subdependencia seleccionada no existe en la base de datos"
        }, { status: 400 })
      }

      // Manejar errores de PostgREST relacionados con relaciones
      if (updateError?.message && updateError.message.includes('relationship')) {
        return NextResponse.json({
          error: "Error de relación de base de datos",
          details: "No se pudo encontrar la relación entre trámites y dependencias. Esto puede deberse a:",
          suggestions: [
            "1. Las restricciones de clave foránea no están correctamente configuradas",
            "2. Los nombres de las restricciones no coinciden con lo esperado por PostgREST",
            "3. El caché de esquema de PostgREST está desactualizado",
            "4. Las columnas dependencia_id o subdependencia_id no existen o no tienen las restricciones adecuadas"
          ],
          technical: {
            errorMessage: updateError.message,
            errorCode: updateError.code,
            constraintNames: ["tramites_dependencia_id_fkey", "tramites_subdependencia_id_fkey"]
          }
        }, { status: 500 })
      }

      // Manejar errores de formato de datos
      if (updateError?.code === '22P02' || (updateError?.message && updateError.message.includes('invalid input'))) {
        return NextResponse.json({
          error: "Formato de datos inválido",
          details: "Los datos proporcionados no tienen el formato correcto para la base de datos"
        }, { status: 400 })
      }

      // Error genérico con más contexto
      return NextResponse.json({
        error: "Error al actualizar el trámite",
        details: process.env.NODE_ENV === 'development' ? updateError?.message : "Error interno del servidor",
        technical: process.env.NODE_ENV === 'development' ? {
          code: updateError?.code,
          details: updateError?.details,
          hint: updateError?.hint
        } : undefined
      }, { status: 500 })
    }

    if (!updatedTramite) {
      return NextResponse.json({ error: "No se encontró el trámite para actualizar" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedTramite,
      message: "Trámite actualizado exitosamente"
    })
  } catch (error: any) {
    console.error("Error en PUT /api/admin/tramites/[id]:", error)
    
    // Manejo específico de errores comunes
    if (error.code === '22P02') { // Invalid text representation
      return NextResponse.json({
        error: "Formato de datos inválido"
      }, { status: 400 })
    }

    if (error.code === '23503') { // Foreign key violation
      return NextResponse.json({
        error: "Dependencia o subdependencia no válida"
      }, { status: 400 })
    }

    return NextResponse.json({
      error: "Error interno del servidor",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error } = await supabase.from("tramites").delete().eq("id", (await params).id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
