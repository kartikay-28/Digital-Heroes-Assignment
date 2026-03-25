import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { runDraw } from "@/lib/draw-engine";

export async function POST(req: Request) {
  try {
    // We should ideally ensure only super_admin can trigger this, using server client
    // For now, let's assume we use the service role to orchestrate this heavy operation
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { month, year, drawType } = await req.json();

    if (!month || !year || !['random', 'algorithm'].includes(drawType)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // 1. Get all active subscribers
    const { data: subscribers, error: subError } = await supabase
      .from("profiles")
      .select("id")
      .eq("subscription_status", "active");

    if (subError) throw subError;

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: "No active subscribers found" }, { status: 400 });
    }

    // 2. Get last 5 scores for each active subscriber
    const userIds = subscribers.map(sub => sub.id);
    const { data: scores, error: scoresError } = await supabase
      .from("scores")
      .select("user_id, score")
      .in("user_id", userIds)
      .order("played_at", { ascending: false });

    if (scoresError) throw scoresError;

    // Group scores by userId
    const userScoresMap: Record<string, number[]> = {};
    scores?.forEach(s => {
      if (!userScoresMap[s.user_id]) {
        userScoresMap[s.user_id] = [];
      }
      if (userScoresMap[s.user_id].length < 5) {
        userScoresMap[s.user_id].push(s.score);
      }
    });

    const userEntries = Object.keys(userScoresMap)
      .filter(userId => userScoresMap[userId].length === 5)
      .map(userId => ({
        userId,
        numbers: userScoresMap[userId].sort((a, b) => a - b)
      }));

    if (userEntries.length === 0) {
      return NextResponse.json({ error: "No active subscribers with 5 scores" }, { status: 400 });
    }

    // 3. Calculate pool logic
    // Usually avg monthly is 9.99 but here let's simplify for calculation (or sum actual subs)
    const averageMonthlyRevenue = 9.99; 
    
    // 4. Get previous jackpot accumulation
    const { data: lastDraw } = await supabase
      .from("draws")
      .select("jackpot_amount")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const jackpotAccumulated = lastDraw?.jackpot_amount || 0;

    // 5. Run Draw
    const drawResult = runDraw({
      subscriberCount: subscribers.length,
      averageMonthlyRevenue,
      jackpotAccumulated,
      userEntries,
      drawType: drawType as "random" | "algorithm"
    });

    // 6. Insert Draw simulation
    const { data: drawRecord, error: insertDrawErr } = await supabase
      .from("draws")
      .insert({
        month,
        year,
        drawn_numbers: drawResult.drawnNumbers,
        draw_type: drawType,
        status: "simulation",
        prize_pool_total: drawResult.prizePool,
        jackpot_rolled_over: drawResult.jackpotRolledOver,
        jackpot_amount: drawResult.jackpotRolledOver ? drawResult.prizes.tier5Pool : 0
      })
      .select()
      .single();

    if (insertDrawErr) throw insertDrawErr;

    // 7. Insert all draw_entries
    const entriesToInsert = drawResult.entries.map(e => ({
      draw_id: drawRecord.id,
      user_id: e.userId,
      entry_numbers: e.numbers,
      match_count: e.matchCount,
      tier: e.tier
    }));

    // Batch insert 
    for (let i = 0; i < entriesToInsert.length; i += 1000) {
      const batch = entriesToInsert.slice(i, i + 1000);
      await supabase.from("draw_entries").insert(batch);
    }

    // 8. Insert winners
    const winnersToInsert = drawResult.winners.map(w => ({
      draw_id: drawRecord.id,
      user_id: w.userId,
      tier: w.tier,
      prize_amount: w.prizeAmount,
      status: "pending"
    }));

    if (winnersToInsert.length > 0) {
      await supabase.from("winners").insert(winnersToInsert);
    }

    // 9. Return result
    return NextResponse.json(drawResult);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}