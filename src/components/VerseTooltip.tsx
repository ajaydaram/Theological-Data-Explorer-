import React, { useState, useRef } from 'react';

const cache: Record<string, string> = {};

export function VerseTooltip({ verse, children, className = "" }: { verse: string, children: React.ReactNode, className?: string }) {
  const [text, setText] = useState<string | null>(cache[verse] || null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(async () => {
      setShow(true);
      if (text || loading) return;
      setLoading(true);
      try {
        const res = await fetch(`https://bible-api.com/${encodeURIComponent(verse)}`);
        const data = await res.json();
        const cleanedText = data.text.replace(/\n/g, ' ').trim();
        cache[verse] = cleanedText;
        setText(cleanedText);
      } catch (e) {
        setText("Unable to load verse text from API.");
      }
      setLoading(false);
    }, 300); // Small hover delay
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShow(false);
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {show && (
        <div className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 md:w-80 bg-[#1A1A1A] p-4 shadow-2xl border border-[#A52A2A] pointer-events-none">
          <div className="font-mono text-[9px] text-[#A52A2A] uppercase mb-2 tracking-widest font-bold border-b border-[#333] pb-1">
            {verse}
          </div>
          <div className="font-serif text-[13px] leading-relaxed text-[#F9F7F2]">
            {loading ? <span className="opacity-50 italic">Loading from bible-api.com...</span> : text}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#A52A2A] h-0 w-0"></div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#1A1A1A] h-0 w-0 -mt-[1px]"></div>
        </div>
      )}
    </div>
  );
}
