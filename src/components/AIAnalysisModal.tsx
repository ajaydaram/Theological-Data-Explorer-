import React, { useState } from 'react';
import { Sparkles, X, Loader2, Minimize2 } from 'lucide-react';
import { CreedDocument } from '../types';

export function AIAnalysisModal({ doc1, doc2, onClose }: { doc1: CreedDocument, doc2: CreedDocument, onClose: () => void }) {
  const [differences, setDifferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gemini/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc1Title: doc1.title,
          doc1Content: doc1.content,
          doc2Title: doc2.title,
          doc2Content: doc2.content
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.differences) {
        setDifferences(data.differences);
      } else {
         setError("Invalid response format from AI.");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 p-4 backdrop-blur-sm">
      <div className="bg-[#1A1A1A] w-full max-w-2xl border-2 border-[#A52A2A] shadow-2xl flex flex-col max-h-full">
        
        <div className="flex justify-between items-center p-4 border-b border-[#333]">
          <div className="flex items-center gap-2 text-[#A52A2A] font-mono font-bold tracking-widest text-[11px] uppercase">
             <Sparkles className="w-4 h-4" /> AI Theological Analysis
          </div>
          <button onClick={onClose} className="text-[#D1CEC7] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto">
           <div className="text-center mb-8">
             <h3 className="font-serif text-xl text-white mb-2 underline decoration-[#A52A2A] underline-offset-4 decoration-2">{doc1.title}</h3>
             <span className="font-mono text-[#7A756D] text-[10px] mx-4 uppercase tracking-widest block mb-2">Vs.</span>
             <h3 className="font-serif text-xl text-white underline decoration-[#A52A2A] underline-offset-4 decoration-2">{doc2.title}</h3>
           </div>

           {!loading && differences.length === 0 && !error && (
              <div className="flex justify-center my-12">
                 <button 
                   onClick={handleAnalyze}
                   className="bg-[#A52A2A] hover:bg-[#8A2525] text-white font-mono uppercase tracking-widest text-xs font-bold py-3 px-6 flex items-center gap-2 transition-colors border border-transparent focus:border-white"
                 >
                   <Sparkles className="w-4 h-4" /> Generate Comparison
                 </button>
              </div>
           )}

           {loading && (
             <div className="flex flex-col items-center justify-center my-16 text-[#A52A2A]">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p className="font-mono text-xs uppercase tracking-widest text-[#D1CEC7]">Scanning Historical Corpus...</p>
             </div>
           )}

           {error && (
             <div className="bg-red-900/20 border border-red-500/50 p-4 text-center my-4">
                <p className="font-mono text-xs text-red-400 uppercase">{error}</p>
             </div>
           )}

           {differences.length > 0 && (
              <div className="space-y-4">
                 <h4 className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#7A756D] border-b border-[#333] pb-2">Substantive Distinctions</h4>
                 <ul className="space-y-4 mt-4">
                    {differences.map((diff, i) => (
                      <li key={i} className="flex items-start gap-4 text-[#F9F7F2] font-serif leading-relaxed text-sm">
                         <span className="font-mono text-[#A52A2A] text-xs mt-1 block shrink-0">{String(i+1).padStart(2, '0')}</span>
                         <span>{diff}</span>
                      </li>
                    ))}
                 </ul>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
