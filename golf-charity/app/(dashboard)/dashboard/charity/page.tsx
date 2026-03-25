"use client";

import { useState, useEffect } from "react";
import { Heart, Search, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

export default function CharityPage() {
  const [profile, setProfile] = useState<any>(null);
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);
  const [percent, setPercent] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then(res => res.json()),
      fetch("/api/charities").then(res => res.json())
    ]).then(([profileData, charitiesData]) => {
      setProfile(profileData.profile);
      setCharities(charitiesData.charities || []);
      
      setSelectedCharity(profileData.profile?.charity_id || null);
      setPercent(profileData.profile?.charity_percent || 10);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          charity_id: selectedCharity,
          charity_percent: percent
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setIsModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const currentCharity = charities.find(c => c.id === selectedCharity);
  const planAmount = profile?.subscription_plan === "yearly" ? 8.33 : 9.99; // roughly
  const donationAmount = (planAmount * (percent / 100)).toFixed(2);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-cabinet font-bold text-white mb-2">My Charity</h1>
        <p className="text-zinc-400">Choose who to support and control how much of your subscription goes directly to them.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          <div className="flex-1 space-y-6 w-full">
            <div>
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Supported Cause</h2>
              
              {currentCharity ? (
                <div className="border border-zinc-800 bg-zinc-950 p-4 rounded-xl flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-zinc-800 overflow-hidden relative shrink-0">
                    {currentCharity.image_url ? (
                      <Image src={currentCharity.image_url} alt={currentCharity.name} fill className="object-cover" />
                    ) : (
                      <Heart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{currentCharity.name}</h3>
                    <p className="text-zinc-400 text-sm line-clamp-1">{currentCharity.description}</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="border border-zinc-800 border-dashed bg-zinc-950/50 p-6 rounded-xl text-center">
                  <p className="text-zinc-400 mb-4">You haven't selected a charity yet.</p>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-zinc-950 bg-lime-400 hover:bg-lime-500 rounded-lg transition-colors font-bold"
                  >
                    Select a Charity
                  </button>
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Contribution Level</h2>
                <div className="text-2xl font-bold text-lime-400">{percent}%</div>
              </div>
              
              <input 
                type="range" 
                min="10" 
                max="50" 
                step="5"
                value={percent}
                onChange={(e) => setPercent(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-lime-400"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-2">
                <span>10% (Min)</span>
                <span>50% (Max)</span>
              </div>
            </div>

            <div className="bg-lime-400/10 border border-lime-400/20 p-4 rounded-xl">
              <p className="text-lime-400/90 text-sm">
                You are donating <strong className="text-lime-400 font-bold">£{donationAmount}</strong> of your £{planAmount}/mo subscription directly to your chosen charity.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving || (percent === profile?.charity_percent && selectedCharity === profile?.charity_id)}
              className="w-full py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Charity Selection */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white font-cabinet">Select a Charity</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {charities.map(c => (
                  <div 
                    key={c.id}
                    onClick={() => setSelectedCharity(c.id)}
                    className={clsx(
                      "border p-4 rounded-xl cursor-pointer transition-all flex gap-4",
                      selectedCharity === c.id 
                        ? "border-lime-400 bg-lime-400/5" 
                        : "border-zinc-800 bg-zinc-950 hover:bg-zinc-800/50"
                    )}
                  >
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden relative shrink-0">
                      {c.image_url && <Image src={c.image_url} alt={c.name} fill className="object-cover" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm">{c.name}</h3>
                        {selectedCharity === c.id && <CheckCircle2 size={14} className="text-lime-400" />}
                      </div>
                      <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{c.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-zinc-800 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-lime-400 text-zinc-950 font-bold rounded-lg hover:bg-lime-500"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}