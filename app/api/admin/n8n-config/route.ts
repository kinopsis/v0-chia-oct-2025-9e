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

    const { data: existingConfig } = await supabase.from("n8n_config").select("id").limit(1).maybeSingle()

    let result

    if (existingConfig) {
      // Update existing config
      result = await supabase
        .from("n8n_config")
        .update({
          ...configData,
          updated_by: user.id,
        })
        .eq("id", existingConfig.id)
    } else {
      // Insert new config
      result = await supabase.from("n8n_config").insert({
        ...configData,
        created_by: user.id,
        updated_by: user.id,
      })
    }

    if (result.error) throw result.error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
