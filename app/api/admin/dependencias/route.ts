import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Dependencia, DependenciaFormData, ApiResponse } from "@/lib/types-dependencias";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    
    // Check if user has permission to view dependencias
    const canView = user?.profile?.role === "admin" || user?.profile?.role === "supervisor";
    if (!canView) {
      return NextResponse.json(
        { error: "No tiene permiso para acceder a las dependencias" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const tipo = searchParams.get("tipo") || "";
    const is_active = searchParams.get("is_active");
    const nivel = searchParams.get("nivel");

    // Build base query
    let query = supabase
      .from("dependencias")
      .select("*", { count: "exact" })
      .order("nivel", { ascending: true })
      .order("orden", { ascending: true })
      .order("nombre", { ascending: true });

    // Apply filters
    if (search) {
      query = query.ilike("nombre", `%${search}%`);
    }

    if (tipo) {
      query = query.eq("tipo", tipo);
    }

    if (is_active !== null) {
      query = query.eq("is_active", is_active === "true");
    }

    if (nivel !== null) {
      query = query.eq("nivel", parseInt(nivel));
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error("[v0] Error fetching dependencias:", error);
      return NextResponse.json(
        { error: "Failed to fetch dependencias" },
        { status: 500 }
      );
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        total: count || 0,
        pages: totalPages,
        limit,
      },
      error: null,
      success: true,
    });
  } catch (error) {
    console.error("[v0] Error in dependencias GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    
    // Check if user has permission to create dependencias
    const canCreate = user?.profile?.role === "admin" || user?.profile?.role === "supervisor";
    if (!canCreate) {
      return NextResponse.json(
        { error: "No tiene permiso para crear dependencias" },
        { status: 403 }
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

    // Check if codigo already exists
    const { data: existingCodigo } = await supabase
      .from("dependencias")
      .select("id")
      .eq("codigo", body.codigo)
      .single();

    if (existingCodigo) {
      return NextResponse.json(
        { error: `El código ${body.codigo} ya está en uso` },
        { status: 409 }
      );
    }

    // Check if sigla already exists (if provided)
    if (body.sigla) {
      const { data: existingSigla } = await supabase
        .from("dependencias")
        .select("id")
        .eq("sigla", body.sigla)
        .single();

      if (existingSigla) {
        return NextResponse.json(
          { error: `La sigla ${body.sigla} ya está en uso` },
          { status: 409 }
        );
      }
    }

    // Prepare data for insertion
    const insertData = {
      codigo: body.codigo,
      sigla: body.sigla || null,
      nombre: body.nombre,
      tipo: body.tipo,
      dependencia_padre_id: body.dependencia_padre_id || null,
      orden: body.orden || 0,
      is_active: body.is_active !== false, // Default to true
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from("dependencias")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("[v0] Error creating dependencia:", error);
      return NextResponse.json(
        { error: "Failed to create dependencia" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      error: null,
      success: true,
    });
  } catch (error) {
    console.error("[v0] Error in dependencias POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}