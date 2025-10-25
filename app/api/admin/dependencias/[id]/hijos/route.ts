import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Dependencia, ApiResponse } from "@/lib/types-dependencias";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    
    // Await the params promise
    const resolvedParams = await params;
    
    // Check if user has permission to view dependencias
    const canView = user?.profile?.role === "admin" || user?.profile?.role === "supervisor";
    if (!canView) {
      return NextResponse.json(
        { error: "No tiene permiso para acceder a las dependencias" },
        { status: 403 }
      );
    }

    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Check if parent dependencia exists
    const { data: parentDependencia } = await supabase
      .from("dependencias")
      .select("id, nombre, tipo")
      .eq("id", id)
      .single();

    if (!parentDependencia) {
      return NextResponse.json(
        { error: "Dependencia no encontrada" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const is_active = searchParams.get("is_active");

    // Build query for child dependencias
    let query = supabase
      .from("dependencias")
      .select("*")
      .eq("dependencia_padre_id", id)
      .order("orden", { ascending: true })
      .order("nombre", { ascending: true });

    // Apply active filter
    if (is_active !== null) {
      query = query.eq("is_active", is_active === "true");
    }

    const { data, error } = await query;

    if (error) {
      console.error("[v0] Error fetching dependencia hijos:", error);
      return NextResponse.json(
        { error: "Failed to fetch dependencia hijos" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      error: null,
      success: true,
    });
  } catch (error) {
    console.error("[v0] Error in dependencias hijos GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}