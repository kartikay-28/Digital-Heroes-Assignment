import { createClient } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      subscription_status,
      subscription_plan,
      is_admin,
      charity_percentage
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-cabinet font-bold text-white mb-2">Users Directory</h1>
        <p className="text-zinc-400">Manage platform users and their subscriptions.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-950 border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-sm">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{user.full_name || "Unnamed"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.subscription_status === 'active' 
                        ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20' 
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}>
                      {user.subscription_status || "inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 capitalize">{user.subscription_plan || "-"}</td>
                  <td className="px-6 py-4 text-zinc-400">
                    {user.is_admin ? (
                      <span className="text-indigo-400 font-medium">Admin</span>
                    ) : (
                      "User"
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-lime-400 font-medium hover:underline text-xs">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {!users?.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    No users found.
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
