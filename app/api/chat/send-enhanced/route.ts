import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { message, history } = await request.json()

    // Get N8n configuration with better error handling
    let config
    try {
      const { data: configData, error } = await supabase
        .from("n8n_config")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error("[v0-enhanced] Error fetching n8n config:", error)
        return NextResponse.json({ error: "Database error" }, { status: 500 })
      }

      if (!configData || !configData.webhook_url) {
        return NextResponse.json({ error: "N8n integration not configured" }, { status: 503 })
      }

      config = configData
    } catch (error) {
      console.error("[v0-enhanced] Exception in config fetch:", error)
      return NextResponse.json({ error: "Configuration service unavailable" }, { status: 503 })
    }

    // Prepare headers with better security
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "Municipio-Chia-Chat-Widget/1.0"
    }

    if (config.api_key) {
      headers["Authorization"] = `Bearer ${config.api_key}`
    }

    // Enhanced timeout and retry logic
    const controller = new AbortController()
    const timeoutMs = Math.min(config.timeout_seconds * 1000, 60000) // Max 60s
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    let lastError: Error | null = null
    let response: Response | null = null
    let attempt = 0

    // Retry logic with exponential backoff
    for (attempt = 0; attempt <= config.max_retries; attempt++) {
      try {
        response = await fetch(config.webhook_url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            message,
            history: history?.slice(-5), // Send last 5 messages for context
            system_prompt: config.custom_prompts?.system_prompt,
            timestamp: new Date().toISOString(),
            source: "web-chat"
          }),
          signal: controller.signal,
          // Add keep-alive for better connection reuse
          keepalive: true
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          
          // Validate response format
          if (!data || (typeof data !== 'object')) {
            throw new Error("Invalid response format from n8n")
          }

          const responseText = data.response || data.message || data.text || data.reply
          
          if (!responseText || typeof responseText !== 'string') {
            throw new Error("Missing or invalid response text from n8n")
          }

          return NextResponse.json({ 
            response: responseText,
            source: "n8n",
            timestamp: new Date().toISOString()
          })
        }

        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`)
        
        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          break
        }

      } catch (error: any) {
        lastError = error
        
        // Don't retry on abort or network errors that indicate permanent failure
        if (error.name === 'AbortError' || error.message.includes('network')) {
          break
        }

        // Wait before retry with exponential backoff
        if (attempt < config.max_retries) {
          const delay = Math.min(Math.pow(2, attempt) * 1000, 5000) // Max 5s delay
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    // All retries exhausted or permanent error
    if (lastError) {
      console.error(`[v0-enhanced] Failed after ${attempt + 1} attempts:`, lastError.message)
      
      // Return structured error for better client handling
      return NextResponse.json({ 
        error: lastError.message,
        code: "n8n_connection_failed",
        attemptCount: attempt + 1,
        retryable: lastError.name !== 'AbortError' && !lastError.message.includes('network')
      }, { status: 500 })
    }

    throw new Error("Failed to get response from N8n")

  } catch (error: any) {
    console.error("Error in enhanced chat send:", error)
    
    // Return different error messages based on error type
    if (error.name === 'AbortError') {
      return NextResponse.json({ 
        error: "Request timeout",
        code: "timeout"
      }, { status: 408 })
    }
    
    return NextResponse.json({ 
      error: error.message || "Error processing message",
      code: "server_error"
    }, { status: 500 })
  }
}