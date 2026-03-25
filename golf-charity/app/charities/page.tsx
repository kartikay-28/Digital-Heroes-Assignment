import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CharityList from "./CharityList";

export default async function PublicCharitiesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("charities").select("*").eq("is_active", true);

  const initialCharities = data && data.length > 0 ? data : [
    { id: "sample-1", name: "Youth Golf Foundation", description: "Providing access to golf for underprivileged youth." },
    { id: "sample-2", name: "Fairways for Veterans", description: "Using golf as a therapeutic outlet for combat veterans." },
    { id: "sample-3", name: "Green Impact Initiative", description: "Promoting sustainability on and off the golf course." }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <nav className="fixed top-0 w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-cabinet font-bold text-xl tracking-tight">
            Golf<span className="text-lime-400">Gives</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="/#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="/charities" className="text-white transition-colors">Charities</Link>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white flex items-center px-4">
              Sign In
            </Link>
            <Link href="/signup" className="text-sm font-bold bg-white text-zinc-950 px-5 py-2 rounded-full hover:bg-zinc-200 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold font-cabinet mb-6">Our Impact Partners</h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Discover the incredible organizations supported by our community of players. 
            Choose your cause when you sign up.
          </p>
        </div>
        
        <CharityList initialCharities={initialCharities} />
      </main>
    </div>
  );
}
