import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { message, history } = await request.json()

    // Get N8n configuration
    const { data: config, error } = await supabase
      .from("n8n_config")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("[v0] Error fetching n8n config:", error)
      return NextResponse.json({ error: "N8n integration not configured" }, { status: 503 })
    }

    if (!config || !config.webhook_url) {
      return NextResponse.json({ error: "N8n integration not configured" }, { status: 503 })
    }

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (config.api_key) {
      headers["Authorization"] = `Bearer ${config.api_key}`
    }

    // Send to N8n webhook
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeout_seconds * 1000)

    let lastError: Error | null = null
    let response: Response | null = null

    // Retry logic
    for (let attempt = 0; attempt <= config.max_retries; attempt++) {
      try {
        response = await fetch(config.webhook_url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            message,
            history: history?.slice(-5), // Send last 5 messages for context
            system_prompt: config.custom_prompts?.system_prompt,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          return NextResponse.json({ response: data.response || data.message || data.text })
        }

        lastError = new Error(`HTTP ${response.status}`)
      } catch (error: any) {
        lastError = error
        if (attempt < config.max_retries) {
          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    throw lastError || new Error("Failed to get response from N8n")
  } catch (error: any) {
    console.error("Error in chat send:", error)
    return NextResponse.json({ error: error.message || "Error processing message" }, { status: 500 })
  }
}
