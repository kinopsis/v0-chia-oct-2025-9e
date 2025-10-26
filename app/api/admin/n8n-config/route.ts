import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const configData = await request.json()

    // Siempre intentar actualizar primero el registro más reciente
    const { data: latestConfig } = await supabase
      .from("n8n_config")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    console.log("[v0-config] latestConfig:", latestConfig)
    
    let result

    if (latestConfig && latestConfig.id) {
      // Update existing config (preferido)
      console.log("[v0-config] Updating existing config with id:", latestConfig.id)
      result = await supabase
        .from("n8n_config")
        .update({
          ...configData,
          updated_by: user.id,
        })
        .eq("id", latestConfig.id)
    } else {
      // Insert as a fallback (should not happen if records exist)
      console.log("[v0-config] Inserting new config (fallback)")
      result = await supabase.from("n8n_config").insert({
        ...configData,
        created_by: user.id,
        updated_by: user.id,
      })
    }

    if (result.error) {
      console.error("[v0-config] Error saving n8n config:", result.error)
      return NextResponse.json({ error: result.error.message || "Database error" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0-config] Exception in n8n config save:", error)
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 })
  }
}
