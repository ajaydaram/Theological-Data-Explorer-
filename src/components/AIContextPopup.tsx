import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, X, Loader2, Highlighter } from 'lucide-react';

export function AIContextPopup({ documentTitle, documentId, contentRef }: { documentTitle: string, documentId: string, contentRef: React.RefObject<HTMLDivElement> }) {
  const [selection, setSelection] = useState<{ text: string, x: number, y: number, context: string } | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#EFECE6');

  const THEME_COLORS = [
    { value: '#EFECE6', label: 'Parchment' },
    { value: '#A52A2A', label: 'Crimson' },
    { value: '#7A756D', label: 'Graphite' }
  ];

  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) {
          if (!explanation && !loading && !showNoteForm && !savingNote) {
            setSelection(null);
          }
          return;
        }

        const text = sel.toString().trim();
        if (!text || !contentRef.current?.contains(sel.anchorNode)) {
          return;
        }

        const contextNode = sel.anchorNode?.parentElement;
        const context = contextNode?.textContent || text;

        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setSelection({
          text,
          context: context.substring(0, 300),
          x: rect.left + rect.width / 2,
          y: rect.top
        });
      }, 50);
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [contentRef, explanation, loading, showNoteForm, savingNote]);

  const handleExplain = async () => {
    if (!selection) return;
    setLoading(true);
    setExplanation(null);
    setError(null);

    try {
      const res = await fetch('/api/gemini/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: selection.text,
          context: selection.context,
          documentTitle
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setExplanation(data.explanation);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHighlight = () => {
    if (!selection) return;
    setSavingNote(true);
    try {
       const newHighlight = {
          id: Date.now().toString(),
          docId: documentId,
          text: selection.text,
          color: selectedColor,
          notes: noteText,
          createdAt: Date.now(),
          updatedAt: Date.now(),
       };
       const localHighlights = localStorage.getItem('theos_highlights');
       const parsed = localHighlights ? JSON.parse(localHighlights) : [];
       const updated = [...parsed, newHighlight];
       localStorage.setItem('theos_highlights', JSON.stringify(updated));
       window.dispatchEvent(new Event('highlights_updated'));
       handleClose();
    } catch (e: any) {
       console.error(e);
       setError("Failed to save highlight.");
    } finally {
       setSavingNote(false);
    }
  };

  const handleClose = () => {
    setSelection(null);
    setExplanation(null);
    setLoading(false);
    setError(null);
    setNoteText('');
    setShowNoteForm(false);
    setSelectedColor('#EFECE6');
    window.getSelection()?.removeAllRanges();
  };

  if (!selection) return null;

  return (
    <div 
      className="fixed z-[999] -translate-x-1/2 -translate-y-[calc(100%+10px)]"
      style={{ left: selection.x, top: selection.y }}
    >
      <div className="bg-[#1A1A1A] p-4 shadow-2xl border border-[#A52A2A] text-white w-72 flex flex-col relative text-left">
        <button onClick={handleClose} className="absolute top-2 right-2 text-[#7A756D] hover:text-white">
          <X className="w-4 h-4" />
        </button>
        
        <div className="font-mono text-[9px] text-[#D1CEC7] uppercase mb-3 tracking-widest font-bold border-b border-[#333] pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#A52A2A]">
             Selection Actions
          </div>
        </div>

        {explanation ? (
           <p className="font-serif text-[13px] leading-relaxed text-[#F9F7F2]">
             {explanation}
           </p>
        ) : error ? (
           <p className="font-serif text-[13px] text-red-400">{error}</p>
        ) : loading ? (
           <div className="flex items-center gap-2 font-mono text-[10px] text-[#D1CEC7]">
             <Loader2 className="w-3 h-3 animate-spin text-[#A52A2A]" /> Analyzing corpus...
           </div>
        ) : showNoteForm ? (
           <div className="flex flex-col gap-2">
             <div className="font-serif text-[12px] italic text-[#D1CEC7] select-none line-clamp-2 mb-2">"{selection.text}"</div>
             <div className="flex items-center gap-2 mb-1">
                {THEME_COLORS.map(c => (
                  <button 
                    key={c.value}
                    onClick={() => setSelectedColor(c.value)}
                    className={`w-4 h-4 rounded-full border-2 ${selectedColor === c.value ? 'border-white' : 'border-transparent'}`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
             </div>
             <textarea 
               value={noteText}
               onChange={e => setNoteText(e.target.value)}
               placeholder="Add a margin note... (optional)"
               className="w-full bg-[#111] border border-[#333] text-white p-2 text-xs font-mono resize-none focus:outline-none focus:border-[#A52A2A]"
               rows={3}
             />
             <button 
                onClick={handleSaveHighlight}
                disabled={savingNote}
                className="mt-2 font-mono text-[10px] bg-[#A52A2A] hover:bg-[#8A2525] text-white py-1 px-3 uppercase tracking-widest transition-colors font-bold disabled:opacity-50"
              >
                {savingNote ? 'Saving...' : 'Save Highlight'}
             </button>
           </div>
        ) : (
           <div className="flex flex-col gap-2">
             <div className="font-serif text-[12px] italic text-[#D1CEC7] select-none line-clamp-2 mb-2 border-l-2 border-[#333] pl-2">"{selection.text}"</div>
             
             <div className="flex flex-col gap-2">
               {selection.text.length <= 150 && (
                 <button 
                   onClick={handleExplain}
                   className="font-mono text-[10px] bg-[#333] hover:bg-[#444] text-[#F9F7F2] py-2 px-3 uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                 >
                   <Sparkles className="w-3 h-3 text-[#A52A2A]" /> Explain Term
                 </button>
               )}
               <button 
                  onClick={() => setShowNoteForm(true)}
                  className="font-mono text-[10px] bg-[#333] hover:bg-[#444] text-[#F9F7F2] py-2 px-3 uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <Highlighter className="w-3 h-3 text-[#A52A2A]" /> Highlight text
               </button>
             </div>
           </div>
        )}

        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#A52A2A] h-0 w-0"></div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#1A1A1A] h-0 w-0 -mt-[1px]"></div>
      </div>
    </div>
  );
}
