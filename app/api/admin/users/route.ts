import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (profile?.role !== "admin") {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const body = await request.json()
        const { email, password, full_name, role, dependencia } = body

        if (!email || !password || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Create user using service role
        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        )

        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name,
            },
        })

        if (createError) {
            return NextResponse.json({ error: createError.message }, { status: 400 })
        }

        if (!newUser.user) {
            return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
        }

        // Update profile
        const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .upsert({
                id: newUser.user.id,
                email: email,
                full_name,
                role,
                dependencia,
                is_active: true,
            })

        if (updateError) {
            console.error("Error updating profile:", updateError)
            return NextResponse.json({ error: "User created but profile update failed: " + updateError.message }, { status: 500 })
        }

        return NextResponse.json({ user: newUser.user })
    } catch (error: any) {
        console.error("Error creating user:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
