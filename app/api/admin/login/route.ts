import { NextRequest, NextResponse } from "next/server"
import { hashAdminPassword } from "@/lib/admin-password"
import { createServiceRoleClient } from "@/lib/supabase/service-role"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()

    if (!supabase) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      )
    }

    const { name, password } = await request.json()

    if (!name || !password) {
      return NextResponse.json(
        { error: "Name and password are required" },
        { status: 400 },
      )
    }

    const passwordHash = hashAdminPassword(password)

    const { data, error } = await supabase
      .from("admins")
      .select("id")
      .eq("name", name)
      .eq("password_hash", passwordHash)
      .maybeSingle()

    if (error) {
      console.error("Admin login error:", error)
      return NextResponse.json(
        { error: "Failed to verify credentials" },
        { status: 500 },
      )
    }

    return NextResponse.json({ valid: !!data })
  } catch (error) {
    console.error("Admin login API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
