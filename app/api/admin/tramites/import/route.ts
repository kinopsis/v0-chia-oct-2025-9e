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

    const { csvData } = await request.json()
    const lines = csvData.split("\n")
    const headers = lines[0].split(",").map((h: string) => h.trim())

    const tramites = []
    const errors = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      try {
        const values: string[] = []
        let currentValue = ""
        let insideQuotes = false

        for (let j = 0; j < line.length; j++) {
          const char = line[j]
          if (char === '"') {
            insideQuotes = !insideQuotes
          } else if (char === "," && !insideQuotes) {
            values.push(currentValue.trim().replace(/^"|"$/g, ""))
            currentValue = ""
          } else {
            currentValue += char
          }
        }
        values.push(currentValue.trim().replace(/^"|"$/g, ""))

        if (values.length >= 14) {
          const tramiteData: any = {
            nombre_tramite: values[1] || "",
            descripcion: values[2] || "",
            categoria: values[3] || "",
            modalidad: values[4] || "",
            formulario: values[5] || "",
            requiere_pago: values[8] || "",
            tiempo_respuesta: values[9] || "",
            requisitos: values[10] || "",
            instrucciones: values[11] || "",
            url_suit: values[12] || "",
            url_gov: values[13] || "",
            is_active: true,
            created_by: user.id,
            updated_by: user.id,
          }

          // Handle dependency fields - support both old and new formats
          if (values[6] && values[6].trim()) {
            // Check if it's a dependency name (old format) or ID (new format)
            const dependenciaValue = values[6].trim()
            if (!isNaN(Number(dependenciaValue))) {
              // It's an ID (new format)
              tramiteData.dependencia_id = Number(dependenciaValue)
            } else {
              // It's a name (old format)
              tramiteData.dependencia_nombre = dependenciaValue
            }
          }

          if (values[7] && values[7].trim()) {
            // Check if it's a subdependency name (old format) or ID (new format)
            const subdependenciaValue = values[7].trim()
            if (!isNaN(Number(subdependenciaValue))) {
              // It's an ID (new format)
              tramiteData.subdependencia_id = Number(subdependenciaValue)
            } else {
              // It's a name (old format)
              tramiteData.subdependencia_nombre = subdependenciaValue
            }
          }

          tramites.push(tramiteData)
        }
      } catch (err) {
        errors.push(`Error en línea ${i + 1}: ${err}`)
      }
    }

    const { data, error } = await supabase.from("tramites").insert(tramites).select()

    if (error) throw error

    return NextResponse.json({
      success: data?.length || 0,
      errors,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
