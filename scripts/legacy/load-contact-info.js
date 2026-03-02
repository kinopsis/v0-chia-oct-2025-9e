#!/usr/bin/env node

/**
 * Script para cargar información de contacto desde CSV a la base de datos
 */

const fs = require('fs')
const path = require('path')

// Leer el archivo CSV
const csvPath = path.join(__dirname, 'directorios-funcionarios-dependenciasv2.csv')

try {
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n')
  
  // Saltar la cabecera
  const dataLines = lines.slice(1)
  
  console.log('🔍 Cargando información de contacto desde CSV...\n')
  console.log(`📁 Archivo encontrado: ${csvPath}`)
  console.log(`📊 Registros a procesar: ${dataLines.length - 1}\n`)
  
  // Procesar cada línea
  const updates = []
  let processedCount = 0
  let errorCount = 0
  
  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim()
    if (!line) continue
    
    try {
      // Parsear la línea CSV (manejar comillas y campos separados por comas)
      const fields = line.split(',').map(field => {
        // Manejar campos entre comillas
        if (field.startsWith('"') && field.endsWith('"')) {
          return field.slice(1, -1)
        }
        return field
      })
      
      if (fields.length >= 7) {
        const [codigo, sigla, dependencia, responsable, email, extension, direccion] = fields
        
        if (codigo && sigla && dependencia) {
          // Limpiar datos
          const cleanedCodigo = codigo.replace(/"/g, '').trim()
          const cleanedSigla = sigla.replace(/"/g, '').trim()
          const cleanedDependencia = dependencia.replace(/"/g, '').trim()
          const cleanedResponsable = responsable.replace(/"/g, '').trim()
          const cleanedEmail = email.replace(/"/g, '').trim()
          const cleanedExtension = extension.replace(/"/g, '').trim()
          const cleanedDireccion = direccion.replace(/"/g, '').trim()
          
          // Buscar dependencia por código o sigla
          const query = `UPDATE dependencias 
                        SET contacto_responsable = '${cleanedResponsable || ''}',
                            email = '${cleanedEmail || ''}',
                            extension = '${cleanedExtension || ''}',
                            direccion = '${cleanedDireccion || ''}'
                        WHERE (codigo = '${cleanedCodigo}' OR sigla = '${cleanedSigla}')
                        AND is_active = true`
          
          updates.push({
            codigo: cleanedCodigo,
            sigla: cleanedSigla,
            dependencia: cleanedDependencia,
            query
          })
          
          processedCount++
          console.log(`✅ Procesado: ${cleanedDependencia} (${cleanedSigla})`)
        }
      }
    } catch (error) {
      errorCount++
      console.log(`❌ Error procesando línea ${i + 2}: ${error.message}`)
    }
  }
  
  console.log(`\n📊 Resumen del procesamiento:`)
  console.log(`   ✅ Registros procesados: ${processedCount}`)
  console.log(`   ❌ Errores: ${errorCount}`)
  console.log(`   📝 Total de queries generadas: ${updates.length}`)
  
  // Guardar las queries en un archivo para ejecutar con MCP
  const queriesFile = path.join(__dirname, 'contact-queries.sql')
  const queriesContent = updates.map(update => update.query).join(';\n') + ';'
  fs.writeFileSync(queriesFile, queriesContent)
  
  console.log(`\n📁 Queries SQL generadas en: ${queriesFile}`)
  console.log('\n💡 Siguiente paso: Ejecutar las queries con el MCP de Supabase')
  
} catch (error) {
  console.error('❌ Error leyendo el archivo CSV:', error.message)
}