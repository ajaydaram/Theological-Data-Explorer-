import React from 'react';
import { X, Github, Database, FileJson, Code, Star } from 'lucide-react';

export function ContributeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 p-4 backdrop-blur-sm">
      <div className="bg-[#1A1A1A] w-full max-w-3xl border-2 border-[#A52A2A] shadow-2xl flex flex-col max-h-full">
        
        <div className="flex justify-between items-center p-4 border-b border-[#333]">
          <div className="flex items-center gap-2 text-[#A52A2A] font-mono font-bold tracking-widest text-[11px] uppercase">
             <Github className="w-4 h-4" /> Open-Source Scholar Community
          </div>
          <button onClick={onClose} className="text-[#D1CEC7] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto">
           <div className="mb-8">
             <h3 className="font-serif text-3xl md:text-4xl text-white mb-4 leading-tight">
                Crowdsourcing the <br/><span className="text-[#A52A2A] italic">Theological Graph</span>
             </h3>
             <p className="font-serif text-lg text-[#D1CEC7] leading-relaxed max-w-2xl">
               The hardest part of this project is the meticulous mapping of historical lineages, scriptural proofs, and doctrinal cross-references. 
               We invite theology students, historians, and scholars to contribute to our open-source <code className="font-mono bg-[#333] px-1 text-sm text-[#F9F7F2]">data.json</code> file.
             </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-[#333] bg-[#111] p-6">
                 <Database className="w-6 h-6 text-[#A52A2A] mb-4" />
                 <h4 className="font-mono text-xs uppercase tracking-widest text-white font-bold mb-2">The Standard Schema</h4>
                 <p className="font-serif text-sm text-[#7A756D] mb-4">
                   We have published a standardized JSON schema for historical confessions and catechisms.
                 </p>
                 <a 
                   href="/schema.json" 
                   target="_blank" 
                   rel="noreferrer"
                   className="inline-flex items-center gap-2 font-mono text-[10px] uppercase font-bold text-[#1A1A1A] bg-[#EFECE6] px-4 py-2 hover:bg-white transition-colors"
                 >
                    <FileJson className="w-3 h-3" /> View schema.json
                 </a>
              </div>

              <div className="border border-[#333] bg-[#111] p-6">
                 <Code className="w-6 h-6 text-[#A52A2A] mb-4" />
                 <h4 className="font-mono text-xs uppercase tracking-widest text-white font-bold mb-2">Submit Pull Requests</h4>
                 <p className="font-serif text-sm text-[#7A756D] mb-4">
                   Add localized confessions, fix historical mappings, or add new scriptural proofs directly via GitHub.
                 </p>
                 <a 
                   href="#" 
                   className="inline-flex items-center gap-2 font-mono text-[10px] uppercase font-bold text-[#F9F7F2] bg-[#A52A2A] px-4 py-2 border border-[#A52A2A] hover:bg-[#8A2525] transition-colors"
                 >
                    <Github className="w-3 h-3" /> Go to Repository
                 </a>
              </div>
           </div>

           <div className="space-y-4">
              <h4 className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#7A756D] border-b border-[#333] pb-2">Ways to Contribute</h4>
              <ul className="space-y-4 mt-4">
                 <li className="flex items-start gap-4 text-[#F9F7F2] font-serif leading-relaxed text-sm">
                    <span className="font-mono text-[#A52A2A] text-xs mt-1 block shrink-0">01</span>
                    <span><strong>Add Obscure Documents:</strong> Help us digitize and map regional or lesser-known confessions (e.g. The Savoy Declaration).</span>
                 </li>
                 <li className="flex items-start gap-4 text-[#F9F7F2] font-serif leading-relaxed text-sm">
                    <span className="font-mono text-[#A52A2A] text-xs mt-1 block shrink-0">02</span>
                    <span><strong>Original Languages:</strong> Provide standard Latin, German, Greek, or Dutch text mappings to existing English documents.</span>
                 </li>
                 <li className="flex items-start gap-4 text-[#F9F7F2] font-serif leading-relaxed text-sm">
                    <span className="font-mono text-[#A52A2A] text-xs mt-1 block shrink-0">03</span>
                    <span><strong>Refine the Cross-References:</strong> Link related paragraphs that historically responded to or borrowed from one another.</span>
                 </li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
