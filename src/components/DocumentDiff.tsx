import React, { useMemo } from 'react';
import { diffWordsWithSpace } from 'diff';

interface DocumentDiffProps {
  originalText: string;
  modifiedText: string;
}

export function DocumentDiff({ originalText, modifiedText }: DocumentDiffProps) {
  const diffResult = useMemo(() => {
    return diffWordsWithSpace(originalText, modifiedText);
  }, [originalText, modifiedText]);

  return (
    <div className="font-serif leading-relaxed text-xl mb-16 text-[#000000]">
      {diffResult.map((part, index) => {
        if (part.added) {
          return (
            <span key={index} className="bg-green-200 text-green-900 border-b-2 border-green-500 rounded-sm px-0.5 mx-0.5">
              {part.value}
            </span>
          );
        }
        if (part.removed) {
          return (
            <span key={index} className="bg-red-200 text-red-900 line-through rounded-sm px-0.5 mx-0.5 opacity-80">
              {part.value}
            </span>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}
    </div>
  );
}
