import { createClient } from "@/lib/supabase/server";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default async function AdminCharitiesPage() {
  const supabase = await createClient();

  const { data: charities } = await supabase
    .from("charities")
    .select("*")
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-cabinet font-bold text-white mb-2">Charities Directory</h1>
          <p className="text-zinc-400">Manage supported charities and their details.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-lime-400 text-zinc-950 font-bold rounded-xl hover:bg-lime-500 transition-colors">
          <Plus size={18} />
          Add Charity
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-950 border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Charity Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-sm">
              {charities?.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{c.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      c.is_active 
                        ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20' 
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}>
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 line-clamp-1 max-w-xs">{c.description}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button className="text-zinc-400 hover:text-white transition-colors"><Edit2 size={16} /></button>
                      <button className="text-red-400 hover:text-red-300 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!charities?.length && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                    No charities found.
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
