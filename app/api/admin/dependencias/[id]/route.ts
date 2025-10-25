import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Dependencia, DependenciaFormData, ApiResponse } from "@/lib/types-dependencias";
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

    const { data, error } = await supabase
      .from("dependencias")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("[v0] Error fetching dependencia:", error);
      return NextResponse.json(
        { error: "Failed to fetch dependencia" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Dependencia no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data,
      error: null,
      success: true,
    });
  } catch (error) {
    console.error("[v0] Error in dependencias GET by ID:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    
    // Check if user has permission to update dependencias
    const canUpdate = user?.profile?.role === "admin" || user?.profile?.role === "supervisor";
    if (!canUpdate) {
      return NextResponse.json(
        { error: "No tiene permiso para actualizar dependencias" },
        { status: 403 }
      );
    }

    const id = parseInt((await params).id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const body: DependenciaFormData = await request.json();

    // Validate required fields
    if (!body.codigo || !body.nombre || !body.tipo) {
      return NextResponse.json(
        { error: "Los campos codigo, nombre y tipo son requeridos" },
        { status: 400 }
      );
    }

    // Validate tipo field
    if (body.tipo !== "dependencia" && body.tipo !== "subdependencia") {
      return NextResponse.json(
        { error: "El campo tipo debe ser 'dependencia' o 'subdependencia'" },
        { status: 400 }
      );
    }

    // Validate parent dependency for subdependencies
    if (body.tipo === "subdependencia" && !body.dependencia_padre_id) {
      return NextResponse.json(
        { error: "Las subdependencias deben tener una dependencia padre" },
        { status: 400 }
      );
    }

    // Check if this dependencia exists
    const { data: existingDependencia } = await supabase
      .from("dependencias")
      .select("id, tipo, dependencia_padre_id")
      .eq("id", id)
      .single();

    if (!existingDependencia) {
      return NextResponse.json(
        { error: "Dependencia no encontrada" },
        { status: 404 }
      );
    }

    // Check if codigo already exists for another dependencia
    const { data: existingCodigo } = await supabase
      .from("dependencias")
      .select("id")
      .eq("codigo", body.codigo)
      .neq("id", id)
      .single();

    if (existingCodigo) {
      return NextResponse.json(
        { error: `El código ${body.codigo} ya está en uso` },
        { status: 409 }
      );
    }

    // Check if sigla already exists for another dependencia (if provided)
    if (body.sigla) {
      const { data: existingSigla } = await supabase
        .from("dependencias")
        .select("id")
        .eq("sigla", body.sigla)
        .neq("id", id)
        .single();

      if (existingSigla) {
        return NextResponse.json(
          { error: `La sigla ${body.sigla} ya está en uso` },
          { status: 409 }
        );
      }
    }

    // Prepare data for update
    const updateData = {
      codigo: body.codigo,
      sigla: body.sigla || null,
      nombre: body.nombre,
      tipo: body.tipo,
      dependencia_padre_id: body.dependencia_padre_id || null,
      orden: body.orden || 0,
      is_active: body.is_active !== false,
      updated_by: user.id,
    };

    const { data, error } = await supabase
      .from("dependencias")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[v0] Error updating dependencia:", error);
      return NextResponse.json(
        { error: "Failed to update dependencia" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      error: null,
      success: true,
    });
  } catch (error) {
    console.error("[v0] Error in dependencias PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    
    // Check if user has permission to delete dependencias
    const canDelete = user?.profile?.role === "admin";
    if (!canDelete) {
      return NextResponse.json(
        { error: "No tiene permiso para eliminar dependencias" },
        { status: 403 }
      );
    }

    const id = parseInt((await params).id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
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

    // Check if dependencia has associated tramites
    const { count: tramiteCount } = await supabase
      .from("tramites")
      .select("id", { count: "exact" })
      .or(`dependencia_id.eq.${id},subdependencia_id.eq.${id}`);

    if (tramiteCount && tramiteCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar la dependencia "${existingDependencia.nombre}" porque tiene ${tramiteCount} trámites asociados` },
        { status: 400 }
      );
    }

    // Check if dependencia has child dependencias
    const { count: childCount } = await supabase
      .from("dependencias")
      .select("id", { count: "exact" })
      .eq("dependencia_padre_id", id);

    if (childCount && childCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar la dependencia "${existingDependencia.nombre}" porque tiene ${childCount} subdependencias asociadas` },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("dependencias")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[v0] Error deleting dependencia:", error);
      return NextResponse.json(
        { error: "Failed to delete dependencia" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: null,
      error: null,
      success: true,
    });
  } catch (error) {
    console.error("[v0] Error in dependencias DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}