"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Trophy, Plus, Trash2, Edit2, AlertCircle } from "lucide-react";
import clsx from "clsx";

interface Score {
  id: string;
  score: number;
  played_at: string;
}

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newScore, setNewScore] = useState("");
  const [newDate, setNewDate] = useState("");
  
  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const res = await fetch("/api/scores");
      if (res.ok) {
        const data = await res.json();
        setScores(data.scores);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScore || !newDate) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: parseInt(newScore),
          played_at: newDate,
        }),
      });
      
      if (res.ok) {
        setNewScore("");
        setNewDate("");
        await fetchScores();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 36) return "text-lime-400";
    if (score >= 28) return "text-sky-400";
    return "text-coral-400"; // custom coral color or use orange-400
  };

  if (loading) {
    return <div className="animate-pulse flex space-x-4">Loading scores...</div>;
  }

  const oldestScore = scores.length === 5 
    ? [...scores].sort((a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime())[0] 
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-cabinet font-bold text-white mb-2">My Scores</h1>
        <p className="text-zinc-400">Enter your Stableford scores to enter the monthly draw. We take your last 5 rounds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1 border border-zinc-800 bg-zinc-900 rounded-2xl p-6 h-fit">
          <h2 className="text-xl font-bold text-white mb-6 font-cabinet">Add New Score</h2>
          
          <form onSubmit={handleAddScore} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Stableford Points</label>
              <input
                type="number"
                min="1"
                max="45"
                required
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                placeholder="e.g. 36"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Date Played</label>
              <input
                type="date"
                required
                value={newDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50"
              />
            </div>

            {scores.length >= 5 && oldestScore && (
              <div className="flex items-start gap-3 bg-orange-500/10 text-orange-400 p-3 rounded-lg text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  Adding this score will remove your oldest score ({oldestScore.score}pts on {format(new Date(oldestScore.played_at), "MMM d")}).
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-950 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Plus size={18} />
              {isSubmitting ? "Saving..." : "Add Score"}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          {scores.length === 0 ? (
            <div className="border border-zinc-800 border-dashed rounded-2xl p-12 text-center flex flex-col items-center">
              <Trophy className="w-12 h-12 text-zinc-700 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2 font-cabinet">No Scores yet</h3>
              <p className="text-zinc-500 max-w-sm">
                Add your first 5 scores to secure your entry into the next monthly draw.
              </p>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {scores.map((score) => (
                    <tr key={score.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white">{format(new Date(score.played_at), "MMMM d, yyyy")}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={clsx("font-bold", getScoreColor(score.score))}>
                          {score.score} pts
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button className="text-zinc-500 hover:text-white transition-colors p-1">
                          <Edit2 size={16} />
                        </button>
                        <button className="text-zinc-500 hover:text-red-400 transition-colors p-1">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-zinc-950 p-4 border-t border-zinc-800 text-sm text-zinc-500 text-center">
                {5 - scores.length > 0
                  ? `Add ${5 - scores.length} more score${5 - scores.length > 1 ? 's' : ''} to qualify for the full draw weight.`
                  : "All 5 slots filled. Ready for the next draw!"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}