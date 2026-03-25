import Link from "next/link";
import { Users, Gift, Heart, Trophy, LayoutDashboard, LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 flex flex-col hidden md:flex top-0 sticky h-screen">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <div className="font-cabinet font-bold text-xl tracking-tight text-white">
            Admin<span className="text-lime-400">Panel</span>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
            <LayoutDashboard size={20} />
            <span className="font-medium">Overview</span>
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
            <Users size={20} />
            <span className="font-medium">Users</span>
          </Link>
          <Link href="/admin/draws" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
            <Gift size={20} />
            <span className="font-medium">Draw Engine</span>
          </Link>
          <Link href="/admin/charities" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
            <Heart size={20} />
            <span className="font-medium">Charities</span>
          </Link>
          <Link href="/admin/winners" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
            <Trophy size={20} />
            <span className="font-medium">Winners</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Exit Admin</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-950 md:hidden sticky top-0 z-30">
          <div className="font-cabinet font-bold text-xl tracking-tight text-white">
            Admin<span className="text-lime-400">Panel</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
