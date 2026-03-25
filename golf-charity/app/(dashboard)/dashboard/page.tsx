import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { Trophy, Target, Heart, Calendar } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, charities ( name )")
    .eq("id", user.id)
    .single();

  // Fetch subscription
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("current_period_end, plan")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Fetch scores
  const { data: scores } = await supabase
    .from("scores")
    .select("score, played_at")
    .eq("user_id", user.id)
    .order("played_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  // Calculate days to next draw (1st of next month)
  const today = new Date();
  const nextDraw = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const daysRemaining = Math.ceil((nextDraw.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-cabinet font-bold text-white mb-2">Welcome back, {profile?.full_name || 'Golfer'}</h1>
        <p className="text-zinc-400">Your next draw is in {daysRemaining} days. Make sure your scores are up to date.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="font-medium text-sm">Status</span>
            <Target size={18} className="text-lime-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white capitalize mb-1">
              {sub ? `${sub.plan} Plan` : 'Inactive'}
            </div>
            <div className="text-sm text-zinc-500">
              Renews {sub ? format(new Date(sub.current_period_end), "MMM d, yyyy") : '-'}
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="font-medium text-sm">Recent Scores</span>
            <Trophy size={18} className="text-lime-400" />
          </div>
          <div className="flex flex-col gap-2">
            {scores && scores.length > 0 ? (
              <div className="flex gap-2">
                {scores.map((s, i) => (
                  <div key={i} className="flex-1 bg-zinc-800 rounded font-bold text-white text-center py-1">
                    {s.score}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm text-zinc-500">No scores yet</span>
            )}
            <Link href="/dashboard/scores" className="text-xs text-lime-400 hover:underline">
              Manage scores â†’
            </Link>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="font-medium text-sm">Impact</span>
            <Heart size={18} className="text-lime-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-white mb-1 line-clamp-1">
              {profile?.charities?.name || 'No charity selected'}
            </div>
            <div className="text-sm text-zinc-500">
              Contributes {profile?.charity_percent || 10}%
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="font-medium text-sm">Next Draw</span>
            <Calendar size={18} className="text-lime-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1 tracking-tight">
              {daysRemaining} <span className="text-lg text-zinc-500 font-normal">days</span>
            </div>
            <div className="text-sm text-zinc-500">
              {format(nextDraw, "MMMM 1st, yyyy")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
