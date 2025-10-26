import type { Procedure } from "./types"
import { createClient } from "@/lib/supabase/server"

const CSV_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tramites-normalizado-con-langchain-text-wzruqQfIlAZHsrMWq3NVTVdbaCI2nD.csv"

// Normalize Spanish text for search
export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

// Parse CSV data
function parseCSV(csvText: string): Procedure[] {
  const lines = csvText.split("\n")
  const headers = lines[0].split(",").map((h) => h.trim())

  const procedures: Procedure[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    // Handle CSV with potential commas in quoted fields
    const values: string[] = []
    let currentValue = ""
    let insideQuotes = false

    for (let j = 0; j < line.length; j++) {
      const char = line[j]

      if (char === '"') {
        insideQuotes = !insideQuotes
      } else if (char === "," && !insideQuotes) {
        values.push(currentValue.trim())
        currentValue = ""
      } else {
        currentValue += char
      }
    }
    values.push(currentValue.trim())

    if (values.length >= 14) {
      procedures.push({
        id: Number.parseInt(values[0]) || 0,
        nombre_tramite: values[1] || "",
        descripcion: values[2] || "",
        categoria: values[3] || "",
        modalidad: values[4] || "",
        formulario: values[5] || "",
        dependencia_nombre: values[6] || "",
        subdependencia_nombre: values[7] || "",
        requiere_pago: values[8] || "",
        tiempo_respuesta: values[9] || "",
        requisitos: values[10] || "",
        instrucciones: values[11] || "",
        url_suit: values[12] || "",
        url_gov: values[13] || "",
      })
    }
  }

  return procedures
}

// Fetch procedures from CSV
export async function fetchProcedures(): Promise<Procedure[]> {
  try {
    const response = await fetch(CSV_URL, {
      cache: "force-cache",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch procedures")
    }

    const csvText = await response.text()
    return parseCSV(csvText)
  } catch (error) {
    console.error("Error fetching procedures:", error)
    return []
  }
}

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

export function searchProcedures(procedures: Procedure[], query: string): Procedure[] {
  if (!query.trim()) return procedures

  const normalizedQuery = normalizarTexto(query)

  // Split query into individual words for better matching
  const queryWords = normalizedQuery.split(/\s+/).filter((word) => word.length > 2)

  // Synonym mapping for semantic search
  const synonyms: Record<string, string[]> = {
    casa: ["vivienda", "construccion", "edificacion", "obra", "inmueble"],
    impuesto: ["pago", "tributo", "contribucion", "tasa", "tarifa"],
    carro: ["vehiculo", "transito", "automovil", "moto", "motocicleta"],
    salud: ["eps", "medico", "hospital", "clinica", "sanitario"],
    educacion: ["colegio", "escuela", "estudio", "academico", "educativo"],
    ambiente: ["ambiental", "ecologia", "naturaleza", "verde", "ecologico"],
    negocio: ["empresa", "emprendimiento", "comercio", "establecimiento", "comercial"],
    certificado: ["certificacion", "constancia", "documento"],
    residencia: ["domicilio", "vivienda", "habitacion", "direccion"],
    licencia: ["permiso", "autorizacion", "habilitacion"],
  }

  // Expand query with synonyms
  const expandedTerms = [...queryWords]
  for (const word of queryWords) {
    if (synonyms[word]) {
      expandedTerms.push(...synonyms[word])
    }
  }

  return procedures.filter((proc) => {
    const searchableText = [
      proc.nombre_tramite,
      proc.descripcion,
      proc.categoria,
      proc.dependencia_nombre,
      proc.requisitos,
    ].join(" ")

    const normalizedText = normalizarTexto(searchableText)

    // Check if all query words are present (AND logic for multi-word queries)
    if (queryWords.length > 1) {
      return queryWords.every((word) => normalizedText.includes(word))
    }

    // For single word, check expanded terms (OR logic with synonyms)
    return expandedTerms.some((term) => normalizedText.includes(term))
  })
}

// Filter procedures by category
export function filterByCategory(procedures: Procedure[], category: string | null): Procedure[] {
  if (!category) return procedures
  return procedures.filter((proc) => proc.categoria === category)
}

// Get unique categories
export function getCategories(procedures: Procedure[]): string[] {
  const categories = new Set(procedures.map((proc) => proc.categoria))
  return Array.from(categories).sort()
}
