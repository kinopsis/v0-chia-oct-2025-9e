"use server"

import type { Procedure } from "./types"
import { createClient } from "@/lib/supabase/server"

// Fetch procedures from Supabase database instead of CSV
export async function fetchProceduresFromDB(): Promise<Procedure[]> {
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
      console.error("[v0] Error fetching procedures from database:", error)
      return []
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

    // Transform data to match Procedure interface
    const transformedData = (data || []).map(tramite => ({
      id: tramite.id,
      nombre_tramite: tramite.nombre_tramite,
      descripcion: tramite.descripcion,
      categoria: tramite.categoria,
      modalidad: tramite.modalidad,
      formulario: tramite.formulario,
      dependencia_nombre: tramite.dependencia_id ? dependenciasMap.get(tramite.dependencia_id) || null : null,
      subdependencia_nombre: tramite.subdependencia_id ? dependenciasMap.get(tramite.subdependencia_id) || null : null,
      dependencia_id: tramite.dependencia_id,
      subdependencia_id: tramite.subdependencia_id,
      requiere_pago: tramite.requiere_pago,
      tiempo_respuesta: tramite.tiempo_respuesta,
      requisitos: tramite.requisitos,
      instrucciones: tramite.instrucciones,
      url_suit: tramite.url_suit,
      url_gov: tramite.url_gov
    }))

    return transformedData
  } catch (error) {
    console.error("[v0] Error in fetchProceduresFromDB:", error)
    return []
  }
}
