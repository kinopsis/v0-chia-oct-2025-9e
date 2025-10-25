import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DependenciaArbol, ApiResponse } from "@/lib/types-dependencias";
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
    const is_active = searchParams.get("is_active");
    
    // Build base query for all dependencias
    let query = supabase
      .from("dependencias")
      .select("*")
      .order("nivel", { ascending: true })
      .order("orden", { ascending: true })
      .order("nombre", { ascending: true });

    // Apply active filter
    if (is_active !== null) {
      query = query.eq("is_active", is_active === "true");
    }

    const { data, error } = await query;

    if (error) {
      console.error("[v0] Error fetching dependencias tree:", error);
      return NextResponse.json(
        { error: "Failed to fetch dependencias tree" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        data: [],
        error: null,
        success: true,
      });
    }

    // Build hierarchical tree structure
    const dependenciasMap = new Map<number, DependenciaArbol>();
    const rootDependencias: DependenciaArbol[] = [];

    // First pass: create all dependencias with empty hijos arrays
    data.forEach(dep => {
      dependenciasMap.set(dep.id, {
        ...dep,
        hijos: []
      });
    });

    // Second pass: build hierarchy
    data.forEach(dep => {
      const dependencia = dependenciasMap.get(dep.id)!;
      
      if (dep.dependencia_padre_id === null) {
        // This is a root dependencia
        rootDependencias.push(dependencia);
      } else {
        // This is a child dependencia
        const parent = dependenciasMap.get(dep.dependencia_padre_id);
        if (parent) {
          parent.hijos.push(dependencia);
        }
      }
    });

    return NextResponse.json({
      data: rootDependencias,
      error: null,
      success: true,
    });
  } catch (error) {
    console.error("[v0] Error in dependencias tree GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}