import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { webhook_url, api_key } = await request.json()

    if (!webhook_url) {
      return NextResponse.json({ error: "Webhook URL is required" }, { status: 400 })
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (api_key) {
      headers["Authorization"] = `Bearer ${api_key}`
    }

    const response = await fetch(webhook_url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message: "Test de conexión desde el backoffice de Chía",
        test: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return NextResponse.json({ success: true, message: "Conexión exitosa" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al conectar con N8n" }, { status: 500 })
  }
}
