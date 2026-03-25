import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { Trophy, Clock, CheckCircle2 } from "lucide-react";
import ProofUploader from "@/components/draws/ProofUploader";

export default async function WinningsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: winnings, error } = await supabase
    .from("winners")
    .select(`
      id,
      tier,
      prize_amount,
      proof_url,
      status,
      created_at,
      draws ( month, year )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const totalWon = winnings?.reduce((sum, w) => sum + Number(w.prize_amount), 0) || 0;
  const pendingPayouts = winnings
    ?.filter(w => w.status === 'pending' || w.status === 'approved')
    .reduce((sum, w) => sum + Number(w.prize_amount), 0) || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-cabinet font-bold text-white mb-2">My Winnings</h1>
        <p className="text-zinc-400">View your draw history and upload scorecards to claim your prizes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Total Won</div>
            <div className="text-4xl font-bold text-white font-cabinet">Â£{totalWon.toFixed(2)}</div>
          </div>
          <Trophy className="w-12 h-12 text-lime-400 opacity-20" />
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Pending Payouts</div>
            <div className="text-4xl font-bold text-lime-400 font-cabinet">Â£{pendingPayouts.toFixed(2)}</div>
          </div>
          <Clock className="w-12 h-12 text-zinc-700" />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {(!winnings || winnings.length === 0) ? (
          <div className="p-12 text-center text-zinc-500 border-dashed border border-zinc-800 m-8 rounded-xl">
            You haven't won any prizes yet. Don't worry, your time will come!
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Draw</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tier</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Prize</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {winnings.map((win) => {
                const draw = Array.isArray(win.draws) ? win.draws[0] : win.draws;
                const monthName = draw ? new Date(draw.year, draw.month - 1).toLocaleString('default', { month: 'long' }) : '-';
                
                return (
                  <tr key={win.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white font-medium">{monthName} {draw?.year}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-zinc-300">Match {win.tier}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-lime-400">Â£{Number(win.prize_amount).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        win.status === 'paid' ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20' :
                        win.status === 'approved' ? 'bg-sky-400/10 text-sky-400 border border-sky-400/20' :
                        win.status === 'rejected' ? 'bg-red-400/10 text-red-400 border border-red-400/20' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        {win.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex justify-end">
                      <ProofUploader winnerId={win.id} currentProofUrl={win.proof_url} status={win.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
