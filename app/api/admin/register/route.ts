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

    const { data: existing, error: existingError } = await supabase
      .from("admins")
      .select("id")
      .eq("name", name)
      .maybeSingle()

    if (existingError) {
      console.error("Admin exists check error:", existingError)
      return NextResponse.json(
        { error: "Failed to check admin name" },
        { status: 500 },
      )
    }

    if (existing) {
      return NextResponse.json(
        { error: "Admin name already exists" },
        { status: 409 },
      )
    }

    const passwordHash = hashAdminPassword(password)

    const { data, error } = await supabase
      .from("admins")
      .insert({
        name,
        password_hash: passwordHash,
      })
      .select("id, name, created_at, updated_at")
      .single()

    if (error) {
      console.error("Admin register error:", error)
      return NextResponse.json(
        { error: "Failed to register admin" },
        { status: 500 },
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Admin register API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
