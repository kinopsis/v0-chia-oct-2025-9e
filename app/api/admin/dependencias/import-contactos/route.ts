import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { ImportDependenciasResult } from '@/lib/types-dependencias';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';

const contactoSchema = z.object({
  CODIGO: z.string().min(1, 'El código es requerido'),
  SIGLA: z.string().nullable(),
  DEPENDENCIA: z.string().min(1, 'La dependencia es requerida'),
  RESPONSABLE: z.string().nullable().optional(),
  'CORREO ELECTRONICO': z.string().email('Formato de correo inválido').nullable().optional(),
  EXT: z.string().nullable().optional(),
  DIRECCIÓN: z.string().nullable().optional()
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    
    // Verificar permisos
    const canImport = user?.profile?.role === 'admin' || user?.profile?.role === 'supervisor';
    if (!canImport) {
      return NextResponse.json(
        { error: 'No tiene permiso para importar contactos' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó archivo' },
        { status: 400 }
      );
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'El archivo debe ser CSV' },
        { status: 400 }
      );
    }

    // Leer y parsear el archivo CSV
    const buffer = Buffer.from(await file.arrayBuffer());
    let records;
    
    try {
      records = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        delimiter: ','
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Error al parsear el archivo CSV' },
        { status: 400 }
      );
    }

    let totalImported = 0;
    let totalSkipped = 0;
    const errors: Array<{ row: number; error: string; data: Record<string, unknown> }> = [];

    // Procesar cada registro
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      try {
        // Validar el registro
        const validatedRecord = contactoSchema.parse(record);
        
        // Buscar dependencia existente por código
        const { data: existingDependencia } = await supabase
          .from('dependencias')
          .select('id')
          .eq('codigo', validatedRecord.CODIGO)
          .single();

        if (!existingDependencia) {
          totalSkipped++;
          errors.push({
                      row: i + 2, // +2 porque la primera fila es encabezado y arrays empiezan en 0
                      error: `No se encontró dependencia con código ${validatedRecord.CODIGO}`,
                      data: record as Record<string, unknown>
                    });
          continue;
        }

        // Validar que el correo no esté duplicado (si se proporciona)
        if (validatedRecord['CORREO ELECTRONICO']) {
          const { data: existingEmail } = await supabase
            .from('dependencias')
            .select('id')
            .eq('correo_electronico', validatedRecord['CORREO ELECTRONICO'])
            .neq('id', existingDependencia.id)
            .single();

          if (existingEmail) {
            totalSkipped++;
            errors.push({
                          row: i + 2,
                          error: `El correo ${validatedRecord['CORREO ELECTRONICO']} ya está registrado en otra dependencia`,
                          data: record as Record<string, unknown>
                        });
            continue;
          }
        }

        // Actualizar la dependencia con los campos de contacto
        const updateData: any = {
          responsable: validatedRecord.RESPONSABLE || null,
          correo_electronico: validatedRecord['CORREO ELECTRONICO'] || null,
          extension_telefonica: validatedRecord.EXT || null,
          direccion: validatedRecord.DIRECCIÓN || null,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        };

        const { error: updateError } = await supabase
          .from('dependencias')
          .update(updateData)
          .eq('id', existingDependencia.id);

        if (updateError) {
          totalSkipped++;
          errors.push({
                      row: i + 2,
                      error: `Error al actualizar dependencia: ${updateError.message}`,
                      data: record as Record<string, unknown>
                    });
          continue;
        }

        totalImported++;

      } catch (validationError) {
        totalSkipped++;
        errors.push({
                  row: i + 2,
                  error: validationError instanceof z.ZodError
                    ? validationError.errors.map(e => e.message).join(', ')
                    : String(validationError),
                  data: record as Record<string, unknown>
                });
      }
    }

    const success = totalImported > 0 && errors.length === 0;
    const message = errors.length === 0
      ? `Importación completada exitosamente: ${totalImported} registros actualizados`
      : `Importación parcial: ${totalImported} actualizados, ${errors.length} errores`;

    return NextResponse.json<ImportDependenciasResult>({
      success,
      total_imported: totalImported,
      total_skipped: totalSkipped,
      errors,
      message
    });

  } catch (error) {
    console.error('[v0] Error en importación de contactos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    // Retornar plantilla CSV para referencia
    const csvTemplate = `CODIGO,SIGLA,DEPENDENCIA,RESPONSABLE,CORREO ELECTRONICO,EXT,DIRECCIÓN
000,DA,DESPACHO DEL ALCALDE,Nombre Responsable,correo@ejemplo.com,1234,Dirección Completa
001,OAJ,Oficina Asesora Jurídica,Nombre Responsable2,correo2@ejemplo.com,5678,Dirección 2`;

    return new NextResponse(csvTemplate, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="plantilla-contactos.csv"'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}