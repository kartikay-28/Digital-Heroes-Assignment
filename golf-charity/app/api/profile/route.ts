import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const updates = await req.json();

    const allowedFields = ["full_name", "handicap", "charity_id", "charity_percent"];
    const payload: any = {};

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        payload[key] = updates[key];
      }
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*, charities(*)")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
