"use server"

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// SSRF Protection: validate URL is safe
function isValidN8nUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    
    // Only allow HTTPS
    if (parsed.protocol !== "https:") return false
    
    // Block internal/private IPs and localhost
    const blockedHosts = [
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      "[::1]",
      "169.254.0.0/16",  // link-local
      "10.0.0.0/8",      // private
      "172.16.0.0/12",    // private
      "192.168.0.0/16",   // private
      "metadata.google.internal", // GCP metadata
      "169.254.169.254",  // cloud metadata
    ]
    
    const hostname = parsed.hostname.toLowerCase()
    
    for (const blocked of blockedHosts) {
      if (blocked.includes("/")) {
        // CIDR notation - simple check for common private ranges
        const [network, bits] = blocked.split("/")
        const networkParts = network.split(".").map(Number)
        const hostParts = hostname.split(".").map(Number)
        if (hostParts.length !== 4 || hostParts.some(isNaN)) continue
        const mask = parseInt(bits)
        const fullMask = ~((1 << (32 - mask)) - 1)
        const networkInt = (networkParts[0] << 24 | networkParts[1] << 16 | networkParts[2] << 8 | networkParts[3]) >>> 0
        const hostInt = (hostParts[0] << 24 | hostParts[1] << 16 | hostParts[2] << 8 | hostParts[3]) >>> 0
        if ((hostInt & fullMask) === (networkInt & fullMask)) return false
      } else if (hostname === blocked || hostname.endsWith("." + blocked)) {
        return false
      }
    }
    
    return true
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    // Authentication check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Authorization check - only admins
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { webhook_url, api_key } = await request.json()

    if (!webhook_url) {
      return NextResponse.json({ error: "Webhook URL is required" }, { status: 400 })
    }

    // SSRF Protection: validate the URL before making request
    if (!isValidN8nUrl(webhook_url)) {
      return NextResponse.json(
        { error: "Invalid or unsafe webhook URL" },
        { status: 400 }
      )
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
