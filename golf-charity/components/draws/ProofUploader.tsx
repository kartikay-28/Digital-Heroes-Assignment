"use client";

import { useState } from "react";
import { Upload, CheckCircle2, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";

export default function ProofUploader({ winnerId, currentProofUrl, status }: { winnerId: string, currentProofUrl: string | null, status: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [proofUrl, setProofUrl] = useState<string | null>(currentProofUrl);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${winnerId}-${Math.random()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('winner-proofs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('winner-proofs')
        .getPublicUrl(fileName);

      const res = await fetch(`/api/winners/${winnerId}/proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofUrl: publicUrl })
      });

      if (res.ok) {
        setProofUrl(publicUrl);
        // Page reload could be triggered to refresh status naturally
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      alert("Failed to upload. Note: in a real environment the 'winner-proofs' bucket must be created first.");
    } finally {
      setIsUploading(false);
    }
  };

  if (status === 'paid' || status === 'approved') {
    return (
      <div className="flex items-center gap-2 text-lime-400 text-sm font-medium">
        <CheckCircle2 size={16} />
        {status === 'paid' ? 'Paid Out' : 'Approved'}
      </div>
    );
  }

  if (proofUrl) {
    return (
      <div className="flex items-center gap-2 text-sky-400 text-sm font-medium">
        <Clock size={16} />
        In Review
      </div>
    );
  }

  return (
    <div className="relative">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleUpload}
        disabled={isUploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
      />
      <button 
        disabled={isUploading}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-zinc-900 bg-white hover:bg-zinc-200 rounded-lg transition-colors"
      >
        <Upload size={14} />
        <span>{isUploading ? "Uploading..." : "Upload Proof"}</span>
      </button>
    </div>
  );
}