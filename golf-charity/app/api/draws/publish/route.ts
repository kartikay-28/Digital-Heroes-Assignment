import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
// import { Resend } from "resend"; 
// const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { drawId } = await req.json();

    if (!drawId) {
      return NextResponse.json({ error: "Missing drawId" }, { status: 400 });
    }

    const { data: draw, error: fetchErr } = await supabase
      .from("draws")
      .select("*")
      .eq("id", drawId)
      .single();

    if (fetchErr || !draw) {
      return NextResponse.json({ error: "Draw not found" }, { status: 404 });
    }

    if (draw.status === "published") {
      return NextResponse.json({ error: "Draw already published" }, { status: 400 });
    }

    const { data: updatedDraw, error: updateErr } = await supabase
      .from("draws")
      .update({ status: "published" })
      .eq("id", drawId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Send emails logic can be placed here 
    // Fetch winners
    // const { data: winners } = await supabase.from("winners").select("user_id, tier, prize_amount").eq("draw_id", drawId);
    // ... resend.emails.send(...)

    return NextResponse.json({ draw: updatedDraw });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}