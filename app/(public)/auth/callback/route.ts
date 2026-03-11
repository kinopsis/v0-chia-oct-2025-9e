import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  
  // 🔒 VALIDACIÓN DE ORIGEN - OWASP A01:2021 Broken Access Control
  // Previene open redirect attacks y phishing
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'https://chia.gov.co',
    'https://www.chia.gov.co',
    'https://tramites.chia.gov.co',
    'http://localhost:3000'
  ]
  
  if (!allowedOrigins.includes(requestUrl.origin)) {
    console.error("🚨 SECURITY ALERT: Invalid origin attempt:", requestUrl.origin)
    
    // Log de intento sospechoso (si hay código de auditoría)
    try {
      const { logAudit, AuditActions } = await import("@/lib/audit-logger")
      await logAudit({
        action: AuditActions.UNAUTHORIZED_ACCESS,
        resource: 'auth',
        details: { 
          type: 'invalid_origin_redirect',
          origin: requestUrl.origin,
          url: requestUrl.toString()
        }
      })
    } catch (e) {
      // Ignorar si falla el log
    }
    
    // Redirigir a login sin procesar callback
    return NextResponse.redirect(
      new URL('/auth/login?error=invalid_origin', requestUrl.origin)
    )
  }
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error("Error exchanging code:", error)
      return NextResponse.redirect(
        new URL('/auth/login?error=auth_failed', requestUrl.origin)
      )
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}/admin`)
}
