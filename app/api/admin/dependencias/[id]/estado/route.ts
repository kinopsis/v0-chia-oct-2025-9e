import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse } from "@/lib/types-dependencias";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    
    // Await the params promise
    const resolvedParams = await params;
    
    // Check if user has permission to update dependencias
    const canUpdate = user?.profile?.role === "admin" || user?.profile?.role === "supervisor";
    if (!canUpdate) {
      return NextResponse.json(
        { error: "No tiene permiso para actualizar dependencias" },
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

    const body = await request.json();
    const is_active = body.is_active;

    if (typeof is_active !== "boolean") {
      return NextResponse.json(
        { error: "El campo is_active debe ser un valor booleano" },
        { status: 400 }
      );
    }

    // Check if dependencia exists
    const { data: existingDependencia } = await supabase
      .from("dependencias")
      .select("id, nombre, tipo")
      .eq("id", id)
      .single();

    if (!existingDependencia) {
      return NextResponse.json(
        { error: "Dependencia no encontrada" },
        { status: 404 }
      );
    }

    // If deactivating, check for associated tramites
    if (!is_active) {
      const { count: tramiteCount } = await supabase
        .from("tramites")
        .select("id", { count: "exact" })
        .or(`dependencia_id.eq.${id},subdependencia_id.eq.${id}`);

      if (tramiteCount && tramiteCount > 0) {
        return NextResponse.json(
          { error: `No se puede desactivar la dependencia "${existingDependencia.nombre}" porque tiene ${tramiteCount} trámites asociados` },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from("dependencias")
      .update({ 
        is_active, 
        updated_by: user.id 
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[v0] Error updating dependencia estado:", error);
      return NextResponse.json(
        { error: "Failed to update dependencia estado" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      error: null,
      success: true,
    });
  } catch (error) {
    console.error("[v0] Error in dependencias estado PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}