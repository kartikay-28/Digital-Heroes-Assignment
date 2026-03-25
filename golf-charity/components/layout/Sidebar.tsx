"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, Trophy, Heart, Settings, LogOut } from "lucide-react";
import clsx from "clsx";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/scores", label: "My Scores", icon: Target },
  { href: "/dashboard/draws", label: "Draws", icon: Trophy },
  { href: "/dashboard/winnings", label: "Winnings", icon: Trophy },
  { href: "/dashboard/charity", label: "My Charity", icon: Heart },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight text-lime-400 font-cabinet">
          GolfGives.
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 font-instrument">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "bg-zinc-800 text-lime-400" 
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              )}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button className="flex items-center gap-3 px-3 py-2 w-full rouded-lg text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-colors rounded-lg font-instrument">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}