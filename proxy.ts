/**
 * Proxy configuration replacing legacy middleware.
 * Use for request interception, routing, and lightweight rewrites.
 */

import type { NextRequest } from "next/server"
import { updateSession } from "./lib/supabase/middleware"

export async function proxy(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|admin-test|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
