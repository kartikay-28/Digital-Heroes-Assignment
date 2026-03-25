import { createClient } from "@/lib/supabase/server";
import { Users, Euro, Heart } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Basic stats
  const { count: usersCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true });
  const { count: charitiesCount } = await supabase.from("charities").select("*", { count: 'exact', head: true });
  const { count: activeSubs } = await supabase.from("profiles").select("*", { count: 'exact', head: true }).eq("subscription_status", "active");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-cabinet font-bold text-white mb-2">Admin Overview</h1>
        <p className="text-zinc-400">Platform statistics and reports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-lime-400/10 text-lime-400 rounded-xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <div className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Total Users</div>
              <div className="text-2xl font-bold text-white">{usersCount || 0}</div>
            </div>
          </div>
          <div className="text-sm text-zinc-500">
            <span className="text-lime-400 font-medium">{activeSubs || 0}</span> active subscriptions
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-lime-400/10 text-lime-400 rounded-xl flex items-center justify-center">
              <Euro size={24} />
            </div>
            <div>
              <div className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Est. Monthly Revenue</div>
              <div className="text-2xl font-bold text-white">
                £{((activeSubs || 0) * 10).toLocaleString()} {/* Simple £10 rough estimate for preview */}
              </div>
            </div>
          </div>
          <div className="text-sm text-zinc-500">Based on active subscriptions</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-lime-400/10 text-lime-400 rounded-xl flex items-center justify-center">
              <Heart size={24} />
            </div>
            <div>
              <div className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Active Charities</div>
              <div className="text-2xl font-bold text-white">{charitiesCount || 0}</div>
            </div>
          </div>
          <div className="text-sm text-zinc-500">Approved for donations</div>
        </div>
      </div>

    </div>
  );
}
