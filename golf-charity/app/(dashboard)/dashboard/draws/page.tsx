import { createClient } from "@/lib/supabase/server";
import { Info, Calendar } from "lucide-react";
import { format } from "date-fns";

export default async function DrawsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch user's scores
  const { data: scores } = await supabase
    .from("scores")
    .select("score")
    .eq("user_id", user.id)
    .order("played_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  const entryNumbers = scores?.map((s) => s.score).sort((a, b) => a - b) || [];

  // Fetch draw history this user participated in
  // First get entries
  const { data: history } = await supabase
    .from("draw_entries")
    .select(`
      match_count,
      tier,
      draws ( month, year, drawn_numbers, status ),
      winners ( prize_amount )
    `)
    .eq("user_id", user.id)
    // .eq("draws.status", "published")
    .order("created_at", { ascending: false });

  // Calculate next draw date
  const today = new Date();
  const nextDraw = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const daysRemaining = Math.ceil((nextDraw.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-cabinet font-bold text-white mb-2">Draws</h1>
        <p className="text-zinc-400">Track your entry into upcoming draws and view past results.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Next Draw Card */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-white font-cabinet mb-1">Next Draw</h2>
              <p className="text-zinc-400 text-sm">{format(nextDraw, "MMMM yyyy")} â€¢ Draw is run on the 1st</p>
            </div>
            <div className="bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800 text-center">
              <div className="text-2xl font-bold text-lime-400 tracking-tight">{daysRemaining}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Days</div>
            </div>
          </div>

          <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center gap-2 mb-4 text-sm text-zinc-400">
              <Calendar size={16} />
              <span>Your entry combination</span>
            </div>

            {entryNumbers.length > 0 ? (
              <div className="flex justify-center gap-3">
                {entryNumbers.map((num, i) => (
                  <div key={i} className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl font-bold text-white shadow-inner">
                    {num}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-zinc-500 py-2">
                No scores entered. Add at least 1 score to participate.
              </div>
            )}
            
            {entryNumbers.length > 0 && entryNumbers.length < 5 && (
              <div className="mt-4 flex gap-2 items-start text-xs text-orange-400 bg-orange-400/10 p-3 rounded-lg">
                <Info size={16} className="shrink-0" />
                <p>You have fewer than 5 scores. You can still play, but your chances are mathematically lower.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white font-cabinet mb-4">Draw History</h2>
        
        {(!history || history.length === 0) ? (
          <div className="border border-zinc-800 border-dashed rounded-2xl p-12 text-center text-zinc-500">
            You haven't participated in any completed draws yet.
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Draw</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Drawn Numbers</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-center">Matches</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Prize</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {history.map((entry, idx) => {
                  const draw = Array.isArray(entry.draws) ? entry.draws[0] : entry.draws;
                  if (!draw) return null;
                  
                  const monthName = new Date(draw.year, draw.month - 1).toLocaleString('default', { month: 'long' });
                  
                  // In Supabase many-to-one joining can sometimes return an array if improperly configured, but it should be singular for one-to-many
                  const prizeList: any = entry.winners;
                  const prizeAmt = Array.isArray(prizeList) ? prizeList[0]?.prize_amount : prizeList?.prize_amount;
                  
                  return (
                    <tr key={idx} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-medium">{monthName} {draw.year}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1.5">
                          {draw.drawn_numbers?.map((num: number, i: number) => (
                            <span key={i} className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-800 text-xs font-bold text-white border border-zinc-700">
                              {num}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`font-bold ${entry.match_count >= 3 ? 'text-lime-400' : 'text-zinc-500'}`}>
                          {entry.match_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {entry.tier ? (
                          <span className="text-white font-bold">Â£{Number(prizeAmt || 0).toFixed(2)}</span>
                        ) : (
                          <span className="text-zinc-500">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
