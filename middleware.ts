/**
 * Legacy middleware used for Supabase auth session management.
 * Next.js now recommends the `proxy.ts` convention. To keep behavior stable
 * while silencing the deprecation warning, the logic is moved to `proxy.ts`
 * and this file is kept as a thin delegator (or can be removed once fully migrated).
 */

import type { NextRequest } from "next/server"
import { updateSession } from "./lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|admin-test|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
