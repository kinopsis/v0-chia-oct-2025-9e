/**
 * Script to upload local documents to Supabase Storage and seed the documentos table.
 * 
 * Run: node scripts/seed-documentos.mjs
 */

import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SUPABASE_URL = "https://mhzgppyjznotjopafpdw.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY is required. Set it as an environment variable.")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const UPLOAD_DIR = path.resolve(__dirname, "..", "upload")
const BUCKET_NAME = "documentos"

const documentMetadata = {
  "CRONOGRAMA-ESTRATEGIA-INNOVADORA-SERVICIO-AL-CIUDADANO1.pdf": {
    nombre: "Cronograma Estrategia Innovadora de Servicio al Ciudadano",
    descripcion: "Cronograma de implementación de la estrategia innovadora de servicio al ciudadano del municipio de Chía.",
    categoria: "Servicio al Ciudadano",
  },
  "CURVA-DE-APRENDIZAJE-DCAC-Actual-4.pdf": {
    nombre: "Curva de Aprendizaje DCAC",
    descripcion: "Documento de la curva de aprendizaje de la Dirección de Atención al Ciudadano actualizado.",
    categoria: "Servicio al Ciudadano",
  },
  "ESTRATEGIA-DE-SERVICIO-AL-CIUDADANO-2026.pdf": {
    nombre: "Estrategia de Servicio al Ciudadano 2026",
    descripcion: "Estrategia integral de servicio al ciudadano para el año 2026 del municipio de Chía.",
    categoria: "Servicio al Ciudadano",
  },
  "PENDON-CARTA-TRATO-DIGNO-1.pdf": {
    nombre: "Pendón Carta de Trato Digno",
    descripcion: "Pendón informativo de la carta de trato digno para los puntos de atención al ciudadano.",
    categoria: "Normatividad",
  },
  "PROGRAMA-DE-TRANSPARENCIA-Y-ETICA-PUBLICA-2025.pdf": {
    nombre: "Programa de Transparencia y Ética Pública 2025",
    descripcion: "Programa de transparencia y ética pública vigente para la Alcaldía de Chía.",
    categoria: "Transparencia",
  },
  "Pagina PACO.docx": {
    nombre: "Página PACO - Diseño de Referencia",
    descripcion: "Documento de diseño de referencia para la página de Puntos de Atención al Ciudadano.",
    categoria: "Diseño",
  },
  "Protocolo-v3.pdf": {
    nombre: "Protocolo de Atención v3",
    descripcion: "Protocolo de atención al ciudadano versión 3 del municipio de Chía.",
    categoria: "Normatividad",
  },
  "caracterizacion-grupos-de-valor-DCAC-2024.pdf": {
    nombre: "Caracterización de Grupos de Valor DCAC 2024",
    descripcion: "Caracterización de los grupos de valor de la Dirección de Atención al Ciudadano para 2024.",
    categoria: "Servicio al Ciudadano",
  },
}

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase()
  const mimes = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".doc": "application/msword",
  }
  return mimes[ext] || "application/octet-stream"
}

async function main() {
  console.log("🚀 Starting document upload to Supabase...\n")

  const files = fs.readdirSync(UPLOAD_DIR)
  let successCount = 0
  let errorCount = 0

  for (const filename of files) {
    const filePath = path.join(UPLOAD_DIR, filename)
    const stat = fs.statSync(filePath)

    if (!stat.isFile()) continue

    const meta = documentMetadata[filename]
    if (!meta) {
      console.log(`⚠️  Skipping unknown file: ${filename}`)
      continue
    }

    const mimeType = getMimeType(filename)
    const fileBuffer = fs.readFileSync(filePath)
    const storagePath = filename.replace(/\s+/g, "-")

    console.log(`📄 Uploading: ${filename} (${(stat.size / 1024).toFixed(1)} KB)`)

    // Upload to Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      })

    if (uploadError) {
      console.error(`   ❌ Upload failed: ${uploadError.message}`)
      errorCount++
      continue
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath)

    const publicUrl = urlData.publicUrl

    // Insert into documentos table
    const { error: insertError } = await supabase.from("documentos").upsert(
      {
        nombre: meta.nombre,
        descripcion: meta.descripcion,
        tipo_archivo: mimeType,
        tamano_bytes: stat.size,
        url_archivo: publicUrl,
        categoria: meta.categoria,
        activo: true,
      },
      { onConflict: "nombre" }
    )

    if (insertError) {
      // Try insert without upsert
      const { error: insertError2 } = await supabase.from("documentos").insert({
        nombre: meta.nombre,
        descripcion: meta.descripcion,
        tipo_archivo: mimeType,
        tamano_bytes: stat.size,
        url_archivo: publicUrl,
        categoria: meta.categoria,
        activo: true,
      })

      if (insertError2) {
        console.error(`   ❌ DB insert failed: ${insertError2.message}`)
        errorCount++
        continue
      }
    }

    console.log(`   ✅ Uploaded and registered: ${meta.nombre}`)
    successCount++
  }

  console.log(`\n🏁 Done! ${successCount} uploaded, ${errorCount} errors.`)
}

main().catch(console.error)
