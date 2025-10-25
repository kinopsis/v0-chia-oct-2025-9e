import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    
    // Check if user has permission to view dependencias
    const canView = user?.profile?.role === "admin" || user?.profile?.role === "supervisor";
    if (!canView) {
      return NextResponse.json(
        { error: "No tiene permiso para exportar dependencias" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const is_active = searchParams.get("is_active");

    // Build query for all dependencias with parent information
    let query = supabase
      .from("dependencias")
      .select(`
        *,
        parent:dependencia_padre_id (
          nombre,
          codigo
        )
      `)
      .order("nivel", { ascending: true })
      .order("orden", { ascending: true })
      .order("nombre", { ascending: true });

    // Apply active filter
    if (is_active !== null) {
      query = query.eq("is_active", is_active === "true");
    }

    const { data, error } = await query;

    if (error) {
      console.error("[v0] Error fetching dependencias for Excel export:", error);
      return NextResponse.json(
        { error: "Failed to fetch dependencias for Excel export" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "No hay dependencias para exportar" },
        { status: 404 }
      );
    }

    // Generate CSV content (Excel can read CSV files)
    const headers = [
      "CODIGO",
      "SIGLA", 
      "NOMBRE",
      "TIPO",
      "DEPENDENCIA_PADRE",
      "CODIGO_PADRE",
      "NIVEL",
      "ESTADO",
      "TELEFONO",
      "EMAIL",
      "DIRECCION",
      "HORARIO_ATENCION",
      "FECHA_CREACION",
      "FECHA_ACTUALIZACION"
    ];

    const csvRows = [headers.join(",")];

    for (const dep of data) {
      const parentName = dep.parent ? dep.parent.nombre : (dep.tipo === 'dependencia' ? 'N/A' : 'Sin padre');
      const parentCode = dep.parent ? dep.parent.codigo : (dep.tipo === 'dependencia' ? 'N/A' : 'Sin codigo');
      
      const row = [
        `"${dep.codigo}"`,
        dep.sigla ? `"${dep.sigla}"` : '""',
        `"${dep.nombre}"`,
        `"${dep.tipo}"`,
        `"${parentName}"`,
        `"${parentCode}"`,
        `"${dep.nivel}"`,
        dep.is_active ? '"Activa"' : '"Inactiva"',
        dep.telefono ? `"${dep.telefono}"` : '""',
        dep.email ? `"${dep.email}"` : '""',
        dep.direccion ? `"${dep.direccion}"` : '""',
        dep.horario_atencion ? `"${dep.horario_atencion}"` : '""',
        `"${dep.created_at}"`,
        `"${dep.updated_at}"`
      ];
      
      csvRows.push(row.join(","));
    }

    const csvContent = csvRows.join("\n");
    const filename = `dependencias-export-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": csvContent.length.toString(),
      },
    });

  } catch (error) {
    console.error("[v0] Error in dependencias Excel export GET:", error);
    return NextResponse.json(
      { error: "Internal server error during Excel export" },
      { status: 500 }
    );
  }
}