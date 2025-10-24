import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: config, error } = await supabase
      .from("n8n_config")
      .select("is_active, custom_prompts")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("[v0] Error fetching n8n config:", error)
      return NextResponse.json({ is_active: false })
    }

    if (!config) {
      return NextResponse.json({ is_active: false })
    }

    return NextResponse.json({
      is_active: config.is_active,
      greeting: config.custom_prompts?.greeting || "Hola! Soy el asistente virtual del Municipio de Chía.",
    })
  } catch (error) {
    console.error("[v0] Exception in chat config:", error)
    return NextResponse.json({ is_active: false })
  }
}
