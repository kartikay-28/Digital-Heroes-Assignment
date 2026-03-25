"use client";

import { useState } from "react";
import { Dice5, Play, CheckCircle, AlertTriangle } from "lucide-react";

export default function AdminDrawsPage() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [publishResult, setPublishResult] = useState<any>(null);
  const [drawLogic, setDrawLogic] = useState("random");
  
  const handleSimulate = async () => {
    setIsSimulating(true);
    setSimulationResult(null);
    try {
      const res = await fetch("/api/draws/simulate", { method: "POST" });
      const data = await res.json();
      setSimulationResult(data);
    } catch (e: any) {
      alert("Simulation failed");
    } finally {
      setIsSimulating(false);
    }
  };

  const handlePublish = async () => {
    if (!simulationResult) return;
    setIsPublishing(true);
    try {
      const res = await fetch("/api/draws/publish", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulatedData: simulationResult })
      });
      const data = await res.json();
      setPublishResult(data);
      alert("Draw Published Successfully!");
    } catch (e: any) {
      alert("Publish failed");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-cabinet font-bold text-white mb-2">Draw Management</h1>
        <p className="text-zinc-400">Configure logic, run simulations, and publish monthly results.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Draw Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={`block border rounded-xl p-4 cursor-pointer transition-colors ${drawLogic === 'random' ? 'bg-lime-400/10 border-lime-400' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}>
            <input type="radio" name="logic" value="random" checked={drawLogic === 'random'} onChange={() => setDrawLogic("random")} className="sr-only" />
            <div className="font-bold text-white mb-1">Random Generation</div>
            <div className="text-sm text-zinc-400">Standard lottery-style execution.</div>
          </label>
          <label className={`block border rounded-xl p-4 cursor-pointer transition-colors ${drawLogic === 'algorithmic' ? 'bg-lime-400/10 border-lime-400' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}>
            <input type="radio" name="logic" value="algorithmic" checked={drawLogic === 'algorithmic'} onChange={() => setDrawLogic("algorithmic")} className="sr-only" />
            <div className="font-bold text-white mb-1">Algorithmic weighting</div>
            <div className="text-sm text-zinc-400">Weighted by frequently entered scores.</div>
          </label>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800">
          <button 
            onClick={handleSimulate}
            disabled={isSimulating}
            className="flex items-center gap-2 px-6 py-3 bg-white text-zinc-950 font-bold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            <Play size={18} />
            {isSimulating ? "Running Simulation..." : "Run Monthly Simulation"}
          </button>
        </div>
      </div>

      {simulationResult && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Simulation Results</h2>
            <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-bold border border-indigo-500/20">DRAFT</div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <div className="text-sm text-zinc-400 mb-2">Winning Numbers</div>
              <div className="flex gap-2">
                {simulationResult.winningNumbers.map((n: number, i: number) => (
                  <div key={i} className="w-12 h-12 rounded-xl bg-lime-400 text-zinc-950 font-bold text-xl flex items-center justify-center">
                    {n}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">5-Match Winners (40%)</div>
                <div className="text-xl font-bold text-white">{simulationResult.winners.tier1.length}</div>
              </div>
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">4-Match Winners (35%)</div>
                <div className="text-xl font-bold text-white">{simulationResult.winners.tier2.length}</div>
              </div>
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">3-Match Winners (25%)</div>
                <div className="text-xl font-bold text-white">{simulationResult.winners.tier3.length}</div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <AlertTriangle size={16} className="text-amber-400" />
                Review simulation before making it official.
              </div>
              <button 
                onClick={handlePublish}
                disabled={isPublishing || publishResult}
                className="flex items-center gap-2 px-6 py-3 bg-lime-400 text-zinc-950 font-bold rounded-xl hover:bg-lime-500 transition-colors disabled:opacity-50"
              >
                <CheckCircle size={18} />
                {isPublishing ? "Publishing..." : "Publish Official Draw"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
