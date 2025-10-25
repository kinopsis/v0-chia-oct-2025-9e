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
      console.error("[v0] Error fetching dependencias for export:", error);
      return NextResponse.json(
        { error: "Failed to fetch dependencias for export" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "No hay dependencias para exportar" },
        { status: 404 }
      );
    }

    // Generate CSV content
    const headers = [
      "CODIGO SUBDEPENDENCIA",
      "SIGLA", 
      "Subdependencia",
      "Dependencias",
      "CODIGO DEPENDENCIA",
      "TIPO",
      "ESTADO",
      "NIVEL"
    ];

    const csvRows = [headers.join(",")];

    for (const dep of data) {
      const parentName = dep.parent ? dep.parent.nombre : (dep.tipo === 'dependencia' ? dep.nombre : '');
      const parentCode = dep.parent ? dep.parent.codigo : (dep.tipo === 'dependencia' ? dep.codigo : '');
      const subdepName = dep.tipo === 'dependencia' ? 'Directo' : dep.nombre;
      
      const row = [
        `"${dep.codigo}"`,
        dep.sigla ? `"${dep.sigla}"` : '""',
        `"${subdepName}"`,
        `"${parentName}"`,
        parentCode ? `"${parentCode}"` : '""',
        `"${dep.tipo}"`,
        dep.is_active ? '"Activa"' : '"Inactiva"',
        `"${dep.nivel}"`
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
    console.error("[v0] Error in dependencias export GET:", error);
    return NextResponse.json(
      { error: "Internal server error during export" },
      { status: 500 }
    );
  }
}