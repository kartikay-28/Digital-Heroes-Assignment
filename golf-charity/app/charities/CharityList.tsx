"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Search, ArrowRight } from "lucide-react";

export default function CharityList({ initialCharities }: { initialCharities: any[] }) {
  const [search, setSearch] = useState("");
  
  const filtered = initialCharities.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="max-w-xl mx-auto mb-16 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
        <input 
          type="text" 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search charities..." 
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(charity => (
          <div key={charity.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-zinc-700 transition-colors flex flex-col h-full">
            <div className="w-14 h-14 bg-zinc-800 rounded-2xl mb-6 flex items-center justify-center text-zinc-500">
              <Heart size={28} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">{charity.name}</h2>
            <p className="text-zinc-400 flex-1 mb-8 leading-relaxed">
              {charity.description}
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 text-lime-400 font-bold hover:text-lime-300 transition-colors mt-auto">
              Support this cause <ArrowRight size={18} />
            </Link>
          </div>
        ))}

        {!filtered.length && (
          <div className="md:col-span-2 lg:col-span-3 text-center py-24 text-zinc-500">
            No charities found matching your search.
          </div>
        )}
      </div>
    </>
  );
}