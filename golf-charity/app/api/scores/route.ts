import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: scores, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("played_at", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ scores });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { score, played_at } = await req.json();

    if (!Number.isInteger(score) || score < 1 || score > 45) {
      return NextResponse.json({ error: "Score must be an integer between 1 and 45" }, { status: 400 });
    }

    if (!played_at || isNaN(Date.parse(played_at))) {
      return NextResponse.json({ error: "Invalid played_at date" }, { status: 400 });
    }

    const { data: newScore, error } = await supabase
      .from("scores")
      .insert({
        user_id: user.id,
        score,
        played_at
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ score: newScore });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
