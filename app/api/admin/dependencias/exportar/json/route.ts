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
      console.error("[v0] Error fetching dependencias for JSON export:", error);
      return NextResponse.json(
        { error: "Failed to fetch dependencias for JSON export" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "No hay dependencias para exportar" },
        { status: 404 }
      );
    }

    // Transform data to hierarchical structure
    const buildHierarchy = (items: any[], parentId: number | null = null, level: number = 0): any[] => {
      return items
        .filter(item => item.dependencia_padre_id === parentId)
        .map((item): any => ({
          id: item.id,
          codigo: item.codigo,
          sigla: item.sigla,
          nombre: item.nombre,
          tipo: item.tipo,
          nivel: item.nivel,
          orden: item.orden,
          is_active: item.is_active,
          created_at: item.created_at,
          updated_at: item.updated_at,
          telefono: item.telefono,
          email: item.email,
          direccion: item.direccion,
          horario_atencion: item.horario_atencion,
          parent: item.parent,
          children: buildHierarchy(items, item.id, level + 1)
        }));
    };

    const hierarchicalData = buildHierarchy(data);

    const filename = `dependencias-export-${new Date().toISOString().split("T")[0]}.json`;
    const jsonString = JSON.stringify(hierarchicalData, null, 2);

    return new NextResponse(jsonString, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": jsonString.length.toString(),
      },
    });

  } catch (error) {
    console.error("[v0] Error in dependencias JSON export GET:", error);
    return NextResponse.json(
      { error: "Internal server error during JSON export" },
      { status: 500 }
    );
  }
}