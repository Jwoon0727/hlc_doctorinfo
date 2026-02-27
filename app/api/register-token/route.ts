import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Check if Supabase credentials are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      console.warn("Supabase not configured - skipping token registration");
      return NextResponse.json(
        {
          success: false,
          message: "Database not configured",
        },
        { status: 200 },
      );
    }

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Check if token already exists
    const { data: existing } = await supabase
      .from("fcm_tokens")
      .select("id")
      .eq("token", token)
      .single();

    if (existing) {
      // Update existing token to active
      const { error } = await supabase
        .from("fcm_tokens")
        .update({
          active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("token", token);

      if (error) {
        console.error("Error updating token:", error);
        return NextResponse.json(
          { error: "Failed to update token" },
          { status: 500 },
        );
      }
    } else {
      // Insert new token
      const { error } = await supabase.from("fcm_tokens").insert({
        token,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error inserting token:", error);
        return NextResponse.json(
          { error: "Failed to register token" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in register-token API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
