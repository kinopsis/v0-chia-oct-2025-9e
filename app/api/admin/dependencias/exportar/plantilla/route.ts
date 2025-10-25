import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // Check if user has permission to view dependencias
    const canView = user?.profile?.role === "admin" || user?.profile?.role === "supervisor";
    if (!canView) {
      return NextResponse.json(
        { error: "No tiene permiso para descargar plantilla" },
        { status: 403 }
      );
    }

    // Generate CSV template content
    const headers = [
      "CODIGO SUBDEPENDENCIA",
      "SIGLA", 
      "Subdependencia",
      "Dependencias",
      "CODIGO DEPENDENCIA"
    ];

    const exampleRows = [
      "000", "DA", "Directo", "Despacho Alcalde", "000",
      "001", "OAJ", "Oficina Asesora Jurídica", "Despacho Alcalde", "",
      "010", "SP", "Directo", "Secretaría de Planeación", "010",
      "011", "OSIE", "Dirección Sistemas de la Información y Estadísticas", "Secretaría de Planeación", "010"
    ];

    const csvContent = `${headers.join(",")}\n"${exampleRows.slice(0, 5).join('","')}"\n"${exampleRows.slice(5, 10).join('","')}"\n"${exampleRows.slice(10, 15).join('","')}"\n"${exampleRows.slice(15, 20).join('","')}"`;

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="plantilla-dependencias.csv"',
        "Content-Length": csvContent.length.toString(),
      },
    });

  } catch (error) {
    console.error("[v0] Error in dependencias plantilla GET:", error);
    return NextResponse.json(
      { error: "Internal server error during template generation" },
      { status: 500 }
    );
  }
}