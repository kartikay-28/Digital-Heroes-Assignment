"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Mail, Lock, User, Heart, AlertCircle, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // Registration data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [charityId, setCharityId] = useState<string>("");
  const [charityPercent, setCharityPercent] = useState<number>(10);
  
  const [charities, setCharities] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("charities").select("id, name").eq("is_active", true);
      
      let loadedCharities = data || [];

      if (loadedCharities.length === 0) {
        loadedCharities = [
          { id: "sample-1", name: "Youth Golf Foundation" },
          { id: "sample-2", name: "Fairways for Veterans" },
          { id: "sample-3", name: "Green Impact Initiative" }
        ];
      }

      setCharities(loadedCharities);
      setCharityId(loadedCharities[0].id);
    } catch (e: any) {
      console.error("Failed to load charities", e);
      const fallback = [
        { id: "sample-1", name: "Youth Golf Foundation" },
        { id: "sample-2", name: "Fairways for Veterans" },
        { id: "sample-3", name: "Green Impact Initiative" }
      ];
      setCharities(fallback);
      setCharityId(fallback[0].id);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();
      // 1. Sign up user
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error("No user returned");

      // 2. Setup profile charity pref (assuming table has charity_id and charity_percentage)
      // wait 2 seconds for trigger to create profile, then update it
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
            selected_charity_id: charityId,
            charity_percentage: charityPercent
        })
        .eq("id", user.id);
        
      if (profileError) {
         console.warn("Could not save charity pref initially, they can set it later.", profileError);
      }

      setSuccess("Account successfully created!");

      setTimeout(() => {
        router.push("/dashboard/settings");
      }, 1000);

    } catch (err: any) {
      setError(err.message || "Failed to create account.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center p-4">
      <div className="w-full max-w-md mt-16 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-lime-400"></div>
        <div className="mb-8">
          <Link href="/" className="font-cabinet font-bold text-xl tracking-tight text-white mb-6 inline-block">
            Golf<span className="text-lime-400">Gives</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-zinc-400">
            {step === 1 ? "Start your journey and track your scores." : "Choose your impact."}
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="flex gap-2 mb-8">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-lime-400' : 'bg-zinc-800'}`}></div>
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-lime-400' : 'bg-zinc-800'}`}></div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-lime-400/10 border border-lime-400/20 rounded-xl flex items-center gap-3 text-lime-400 text-sm">
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          {step === 1 ? (
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-lime-400/50 outline-none"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-lime-400/50 outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-lime-400/50 outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                className="w-full py-3.5 mt-4 bg-lime-400 text-zinc-950 font-bold rounded-xl hover:bg-lime-500 transition-colors flex items-center justify-center gap-2"
              >
                Continue to Step 2
                <ArrowRight size={18} />
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Select a Charity</label>
                <div className="relative">
                  <Heart className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lime-400" size={20} />
                  <select 
                    required
                    value={charityId}
                    onChange={(e) => setCharityId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-lime-400/50 outline-none appearance-none"
                  >
                    {charities.length === 0 && <option value="">Loading charities...</option>}
                    {charities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-sm font-medium text-zinc-400">Contribution Percentage</label>
                  <span className="text-sm font-bold text-lime-400">{charityPercent}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  step="5"
                  value={charityPercent}
                  onChange={(e) => setCharityPercent(Number(e.target.value))}
                  className="w-full accent-lime-400"
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Minimum 10% of your subscription goes to your selected charity. You can increase this impact if you wish.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3.5 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading || !charityId}
                  className="flex-1 py-3.5 bg-white text-zinc-950 font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                  {!isLoading && <CheckCircle size={18} />}
                </button>
              </div>
            </>
          )}
        </form>

        {step === 1 && (
          <p className="mt-8 text-center text-sm text-zinc-400">
            Already have an account? <Link href="/login" className="text-lime-400 hover:underline">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
