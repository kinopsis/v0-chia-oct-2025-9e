import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Dependencia, ApiResponse } from "@/lib/types-dependencias";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    
    // Check if user has permission to import dependencias
    const canImport = user?.profile?.role === "admin" || user?.profile?.role === "supervisor";
    if (!canImport) {
      return NextResponse.json(
        { error: "No tiene permiso para importar dependencias" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Archivo CSV requerido" },
        { status: 400 }
      );
    }

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "El archivo debe ser un CSV válido" },
        { status: 400 }
      );
    }

    // Read and parse CSV file
    const text = await file.text();
    const lines = text.split('\n');
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: "El archivo CSV debe contener encabezados y al menos una fila de datos" },
        { status: 400 }
      );
    }

    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const expectedHeaders = ['CODIGO SUBDEPENDENCIA', 'SIGLA', 'Subdependencia', 'Dependencias', 'CODIGO DEPENDENCIA'];
    
    const hasExpectedHeaders = expectedHeaders.every(header => headers.includes(header));
    if (!hasExpectedHeaders) {
      return NextResponse.json(
        { error: `El archivo CSV debe contener los encabezados: ${expectedHeaders.join(', ')}` },
        { status: 400 }
      );
    }

    const dependenciasToInsert: Array<{
      codigo: string;
      sigla: string | null;
      nombre: string;
      tipo: 'dependencia' | 'subdependencia';
      dependencia_padre_id: number | null;
      orden: number;
    }> = [];
    
    const errors: string[] = [];
    const warnings: string[] = [];

    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      try {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        
        if (values.length < 5) {
          errors.push(`Línea ${i + 1}: Formato de fila inválido (se esperaban 5 columnas, se encontraron ${values.length})`);
          continue;
        }

        const [
          codigoSubdependencia,
          sigla,
          subdependenciaNombre,
          dependenciaNombre,
          codigoDependencia
        ] = values;

        if (!codigoSubdependencia || !subdependenciaNombre || !dependenciaNombre) {
          warnings.push(`Línea ${i + 1}: Campos requeridos vacíos, saltando fila`);
          continue;
        }

        // Determine if this is a main dependency or subdependency
        const isMainDependency = subdependenciaNombre === 'Directo' || !codigoDependencia || codigoDependencia === '';
        
        let tipo: 'dependencia' | 'subdependencia';
        let dependenciaPadreId: number | null = null;
        let codigo: string;
        let nombre: string;

        if (isMainDependency) {
          tipo = 'dependencia';
          codigo = codigoSubdependencia;
          nombre = dependenciaNombre;
        } else {
          tipo = 'subdependencia';
          codigo = codigoSubdependencia;
          nombre = subdependenciaNombre;
          
          // Find parent dependency by codigo
          if (codigoDependencia) {
            const { data: parentDependencia } = await supabase
              .from("dependencias")
              .select("id")
              .eq("codigo", codigoDependencia)
              .eq("tipo", "dependencia")
              .single();

            if (parentDependencia) {
              dependenciaPadreId = parentDependencia.id;
            } else {
              warnings.push(`Línea ${i + 1}: Dependencia padre con código "${codigoDependencia}" no encontrada, se creará como dependencia principal`);
              tipo = 'dependencia';
              dependenciaPadreId = null;
            }
          }
        }

        // Check for duplicates
        const { data: existingCodigo } = await supabase
          .from("dependencias")
          .select("id")
          .eq("codigo", codigo)
          .single();

        if (existingCodigo) {
          warnings.push(`Línea ${i + 1}: Código "${codigo}" ya existe, saltando`);
          continue;
        }

        if (sigla) {
          const { data: existingSigla } = await supabase
            .from("dependencias")
            .select("id")
            .eq("sigla", sigla)
            .single();

          if (existingSigla) {
            warnings.push(`Línea ${i + 1}: Sigla "${sigla}" ya existe, se omitirá`);
          }
        }

        dependenciasToInsert.push({
          codigo,
          sigla: sigla || null,
          nombre,
          tipo,
          dependencia_padre_id: dependenciaPadreId,
          orden: 0, // Will be set during insertion
        });

      } catch (lineError) {
        errors.push(`Línea ${i + 1}: Error al procesar fila - ${lineError}`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { 
          error: "Errores críticos en el archivo CSV",
          errors,
          warnings
        },
        { status: 400 }
      );
    }

    if (dependenciasToInsert.length === 0) {
      return NextResponse.json(
        { 
          error: "No se encontraron dependencias válidas para importar",
          warnings
        },
        { status: 400 }
      );
    }

    // Insert dependencias in batches to handle dependencies correctly
    const insertedDependencias: Dependencia[] = [];
    const insertErrors: string[] = [];

    // First, insert main dependencies
    const mainDependencies = dependenciasToInsert.filter(d => d.tipo === 'dependencia');
    if (mainDependencies.length > 0) {
      try {
        const { data: insertedMain, error: mainError } = await supabase
          .from("dependencias")
          .insert(
            mainDependencies.map(dep => ({
              ...dep,
              created_by: user.id,
            }))
          )
          .select();

        if (mainError) throw mainError;
        insertedDependencias.push(...(insertedMain || []));
      } catch (error) {
        insertErrors.push(`Error insertando dependencias principales: ${error}`);
      }
    }

    // Then, insert subdependencies (they depend on main dependencies being created first)
    const subDependencies = dependenciasToInsert.filter(d => d.tipo === 'subdependencia');
    if (subDependencies.length > 0) {
      try {
        const { data: insertedSub, error: subError } = await supabase
          .from("dependencias")
          .insert(
            subDependencies.map(dep => ({
              ...dep,
              created_by: user.id,
            }))
          )
          .select();

        if (subError) throw subError;
        insertedDependencias.push(...(insertedSub || []));
      } catch (error) {
        insertErrors.push(`Error insertando subdependencias: ${error}`);
      }
    }

    if (insertErrors.length > 0) {
      return NextResponse.json(
        { 
          error: "Error al insertar dependencias en la base de datos",
          insertErrors,
          warnings
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        inserted: insertedDependencias.length,
        warnings,
        details: insertedDependencias
      },
      error: null,
      success: true,
    });

  } catch (error) {
    console.error("[v0] Error importing dependencias:", error);
    return NextResponse.json(
      { error: "Internal server error during import" },
      { status: 500 }
    );
  }
}