import { createClient } from "@/lib/supabase/server";
import { CheckCircle, XCircle } from "lucide-react";

export default async function AdminWinnersPage() {
  const supabase = await createClient();

  const { data: winners } = await supabase
    .from("winners")
    .select(`
      *,
      user:user_id(id, full_name, email),
      draw:draw_id(draw_date)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-cabinet font-bold text-white mb-2">Winners & Verification</h1>
        <p className="text-zinc-400">Verify score proofs and manage payouts.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-950 border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Winner</th>
                <th className="px-6 py-4">Draw Date</th>
                <th className="px-6 py-4">Tier</th>
                <th className="px-6 py-4">Prize</th>
                <th className="px-6 py-4">Proof</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-sm">
              {winners?.map((w) => (
                <tr key={w.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{w.user?.full_name || "Unknown"}</div>
                    <div className="text-xs text-zinc-500">{w.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {new Date(w.draw?.draw_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{w.match_tier}-Match</td>
                  <td className="px-6 py-4 font-bold text-lime-400">£{w.prize_amount}</td>
                  <td className="px-6 py-4">
                    {w.proof_url ? (
                      <a href={w.proof_url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">View Proof</a>
                    ) : (
                      <span className="text-zinc-600">Pending upload</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      w.payment_status === 'paid' 
                        ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20' 
                        : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                    }`}>
                      {w.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button className="p-1.5 text-zinc-400 hover:text-lime-400 transition-colors tooltip" title="Verify & Pay">
                         <CheckCircle size={18} />
                       </button>
                       <button className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors tooltip" title="Reject">
                         <XCircle size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!winners?.length && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                    No winners found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
