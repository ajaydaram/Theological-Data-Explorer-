import React, { useState } from 'react';
import { Network, Link as LinkIcon, BookOpen, Clock, FileText, ChevronRight, Hash, Search, Map as MapIcon, Type as TypeIcon, Sparkles, LogIn, LogOut, Save, FolderOpen, Github } from 'lucide-react';
import { SEED_DATA } from './data/seed';
import { CreedDocument } from './types';
import { normalizeVerse } from './lib/normalizer';
import { THEMES, ThemeMode } from './theme';
import { VERSE_INDEX_ARRAY, VERSE_INDEX_MAP } from './data/verseIndex';
import { VerseTooltip } from './components/VerseTooltip';
import { TopographyMap } from './components/TopographyMap';

import { AIContextPopup } from './components/AIContextPopup';
import { AIAnalysisModal } from './components/AIAnalysisModal';
import { ContributeModal } from './components/ContributeModal';

import { DocumentDiff } from './components/DocumentDiff';
import { TimelineMap } from './components/TimelineMap';

import { auth, db, loginWithGoogle, logout } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';

type ViewMode = 'reader' | 'map' | 'timeline';

export default function App() {
  const [data, setData] = useState<CreedDocument[]>(SEED_DATA);
  const [activeId, setActiveId] = useState<string>(data[0]?.id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deepSearchQuery, setDeepSearchQuery] = useState<string>('');
  const [isSemanticSearch, setIsSemanticSearch] = useState<boolean>(false);
  const [isSemanticSearching, setIsSemanticSearching] = useState<boolean>(false);
  const [semanticResultsList, setSemanticResultsList] = useState<any[]>([]);

  const [parallelId, setParallelId] = useState<string | null>(null);
  const [isDiffMode, setIsDiffMode] = useState<boolean>(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('museum');
  const [viewMode, setViewMode] = useState<ViewMode>('reader');

  const [showOriginalLang, setShowOriginalLang] = useState<boolean>(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState<boolean>(false);
  const [showContribute, setShowContribute] = useState<boolean>(false);

  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [showSaveWorkspace, setShowSaveWorkspace] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');

  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(json => {
        if (json && json.documents) {
          setData(json.documents);
        }
      })
      .catch(e => console.error("Could not load local data lake API: ", e));
  }, []);

  React.useEffect(() => {
    return onAuthStateChanged(auth, u => setUser(u));
  }, []);

  React.useEffect(() => {
    if (!user) { setWorkspaces([]); setHighlights([]); return; }
    
    const wq = query(collection(db, 'workspaces'), where('userId', '==', user.uid));
    const unsubW = onSnapshot(wq, snap => {
       const w = snap.docs.map(d => ({ id: d.id, ...d.data() }));
       setWorkspaces(w);
    });

    const hq = query(collection(db, 'highlights'), where('userId', '==', user.uid));
    const unsubH = onSnapshot(hq, snap => {
       const h = snap.docs.map(d => ({ id: d.id, ...d.data() }));
       setHighlights(h);
    });

    return () => { unsubW(); unsubH(); };
  }, [user]);

  const handleSaveWorkspace = async () => {
    if (!user || !workspaceName) return;
    try {
      await addDoc(collection(db, 'workspaces'), {
        userId: user.uid,
        name: workspaceName,
        activeId: activeId,
        parallelId: parallelId || null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      setShowSaveWorkspace(false);
      setWorkspaceName('');
    } catch(e) {
      console.error(e);
      alert("Failed to save workspace.");
    }
  };

  const handleLoadWorkspace = (ws: any) => {
    setActiveId(ws.activeId);
    setParallelId(ws.parallelId || null);
  };

  const handleDeleteWorkspace = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'workspaces', id));
    } catch (e) {
      console.error(e);
    }
  };

  const theme = THEMES[themeMode];

  const activeDoc: CreedDocument = data.find(d => d.id === activeId) || data[0];
  const getDoc = (id: string): CreedDocument | undefined => data.find(d => d.id === id);
  const parallelDoc: CreedDocument | null = parallelId ? getDoc(parallelId) || null : null;

  React.useEffect(() => {
    if (!deepSearchQuery) {
       setSemanticResultsList([]);
       return;
    }
    if (isSemanticSearch) {
       const doSemanticSearch = async () => {
         setIsSemanticSearching(true);
         try {
           const res = await fetch('/api/gemini/semantic-search', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ query: deepSearchQuery, documents: data })
           });
           const json = await res.json();
           if (json.results) {
             // Only keep scores > 0.45 or top 5
             const valid = json.results.filter((r: any) => r.score > 0.45);
             if (valid.length === 0) valid.push(...json.results.slice(0, 3)); // fallback top 3
             setSemanticResultsList(valid.map((r: any) => r.id));
           }
         } catch (e) {
           console.error(e);
         } finally {
           setIsSemanticSearching(false);
         }
       };
       // Simple debounce
       const t = setTimeout(doSemanticSearch, 800);
       return () => clearTimeout(t);
    }
  }, [deepSearchQuery, isSemanticSearch, data]);

  const deepSearchResults = React.useMemo(() => {
    if (!deepSearchQuery) return { docs: [], verses: [] };
    
    if (isSemanticSearch) {
       const docs = semanticResultsList.map(id => getDoc(id)!).filter(Boolean);
       
       // Union Verses from those semantics
       const verseStrings = new Set<string>();
       docs.forEach(d => d.proofs.forEach(p => verseStrings.add(normalizeVerse(p.display))));
       const verses = Array.from(verseStrings)
         .map(v => VERSE_INDEX_ARRAY.find(vi => vi.verse === v)!)
         .filter(Boolean)
         .sort((a,b) => b.referencedBy.length - a.referencedBy.length);
       
       return { docs, verses };
    }

    const q = deepSearchQuery.toLowerCase();
    
    // 1. Text match Confessions
    const matchedDocs = data.filter(d => 
      d.title.toLowerCase().includes(q) || 
      d.content.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q)
    );
    
    // 2. Text match Verses
    const matchedVerses = VERSE_INDEX_ARRAY.filter(v => 
      v.verse.toLowerCase().includes(q)
    );
    
    // 3. Union Docs (Matched directly + docs referencing matched verses)
    const docIds = new Set<string>();
    matchedDocs.forEach(d => docIds.add(d.id));
    matchedVerses.forEach(v => v.referencedBy.forEach(id => docIds.add(id)));
    const finalDocs = Array.from(docIds).map(id => getDoc(id)!).filter(Boolean);
    
    // 4. Union Verses (Matched directly + verses referenced by matched docs)
    const verseStrings = new Set<string>();
    matchedVerses.forEach(v => verseStrings.add(v.verse));
    finalDocs.forEach(d => d.proofs.forEach(p => verseStrings.add(normalizeVerse(p.display))));
    const finalVerses = Array.from(verseStrings)
      .map(v => VERSE_INDEX_ARRAY.find(vi => vi.verse === v)!)
      .filter(Boolean)
      .sort((a,b) => b.referencedBy.length - a.referencedBy.length);
      
    return { docs: finalDocs, verses: finalVerses };
  }, [deepSearchQuery, data]);

  const computeLineage = (docId: string) => {
    const pathList = [];
    let current = getDoc(docId);
    while (current) {
      pathList.unshift(current);
      if (!current.history_link) break;
      if (pathList.find(p => p.id === current!.history_link)) break; // prevent cycle
      current = getDoc(current.history_link);
    }
    return pathList;
  };
  const lineage = computeLineage(activeId);

  const topVerses = React.useMemo<{verse: string, referencedBy: string[]}[]>(() => {
    return [...VERSE_INDEX_ARRAY].sort((a, b) => b.referencedBy.length - a.referencedBy.length).slice(0, 5);
  }, []);

  const renderHighlightedContent = (content: string, docId: string) => {
    const docHighlights = highlights.filter(h => h.docId === docId);
    if (docHighlights.length === 0) return <>{content}</>;

    let segments = [{ text: content, isHighlight: false, note: '', color: '' }];

    docHighlights.forEach(h => {
       const newSegments: any[] = [];
       segments.forEach(seg => {
          if (seg.isHighlight) { newSegments.push(seg); return; }
          
          const parts = seg.text.split(h.text);
          parts.forEach((part, i) => {
             newSegments.push({ text: part, isHighlight: false, note: '', color: '' });
             if (i < parts.length - 1) {
                newSegments.push({ text: h.text, isHighlight: true, note: h.notes || '', color: h.color });
             }
          });
       });
       segments = newSegments.filter(s => s.text.length > 0);
    });

    return segments.map((seg, i) => 
       seg.isHighlight ? (
         <span key={i} className="bg-[#EAE5D9] border-b-2 border-[#A52A2A] relative group/h cursor-help transition-colors" style={{ backgroundColor: seg.color }}>
           {seg.text}
           {seg.note && (
              <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 hidden group-hover/h:block bg-[#1A1A1A] p-3 text-[#F9F7F2] z-50 min-w-48 max-w-64 text-[13px] font-serif shadow-2xl before:content-[''] before:absolute before:border-8 before:border-transparent before:border-r-[#1A1A1A] before:-left-4 before:top-1/2 before:-translate-y-1/2 -translate-x-2 opacity-0 group-hover/h:opacity-100 group-hover/h:translate-x-0 transition-all pointer-events-none">
                <div className="text-[#A52A2A] font-mono font-bold uppercase text-[9px] tracking-widest mb-2 border-b border-[#333] pb-1">Margin Note</div>
                {seg.note}
              </div>
           )}
         </span> 
       ) : <span key={i}>{seg.text}</span>
    );
  };

  const renderDocumentContent = (currentDoc: CreedDocument, isParallel: boolean = false) => {
    const docLineage: CreedDocument[] = computeLineage(currentDoc.id);
    return (
      <div className={`${theme.layout.docContainer} h-full ${!isParallel ? 'max-w-4xl mx-auto' : 'w-full'}`} ref={!isParallel ? contentRef : undefined}>
        <div className={`text-[120px] md:text-[200px] ${theme.typography.watermark} absolute right-4 top-12 pointer-events-none select-none max-w-full md:block z-0`}>
          {currentDoc.year}
        </div>
        
        <div className="relative z-10 flex flex-col h-full">
          {isParallel && (
            <div className="flex justify-end gap-3 mb-8 relative z-20">
              {currentDoc.content_original && (
                <button 
                  onClick={() => setShowOriginalLang(!showOriginalLang)} 
                  className={`font-mono text-[10px] font-bold uppercase p-1 px-3 border ${showOriginalLang ? theme.colors.bg : 'border-transparent'} ${theme.colors.border} text-[#000000] hover:${theme.colors.bg} transition-colors`}
                >
                  {showOriginalLang ? 'SHOW ENGLISH' : `SHOW ${currentDoc.language_original?.toUpperCase() || 'ORIGINAL'}`}
                </button>
              )}
              <button 
                onClick={() => { setParallelId(null); setIsDiffMode(false); }} 
                className={`font-mono text-[10px] uppercase p-1 px-3 border ${theme.colors.border} ${theme.colors.bg} text-[#000000] transition-colors`}
              >
                CLOSE PARALLEL
              </button>
            </div>
          )}

          {docLineage.length > 1 && (
            <div className="mb-10 flex flex-wrap items-center gap-2">
               <span className={`text-[9px] uppercase tracking-widest font-bold ${theme.colors.accent} mr-2`}>Doctrinal Lineage ::</span>
               {docLineage.map((node, i) => (
                 <React.Fragment key={node.id}>
                   <button 
                     onClick={() => {
                        if (isParallel) setParallelId(node.id);
                        else setActiveId(node.id);
                     }}
                     className={`font-mono text-[10px] uppercase tracking-widest ${node.id === currentDoc.id ? theme.interactive.linkActive : `${theme.colors.text} ${theme.interactive.linkBase} ${theme.interactive.linkHover}`}`}
                   >
                     {node.id}
                   </button>
                   {i < docLineage.length - 1 && <ChevronRight className={`w-3 h-3 ${theme.colors.border}`} />}
                 </React.Fragment>
               ))}
            </div>
          )}

          <h2 className={`${theme.typography.fontHeading} leading-tight mb-12 ${theme.colors.text} ${isParallel ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl lg:text-6xl'}`}>
            {currentDoc.title}
          </h2>
          
          <p className={`${theme.typography.fontBody} leading-relaxed ${theme.colors.text} mb-16 ${theme.typography.dropCap} ${isParallel ? 'text-lg md:first-letter:text-6xl' : 'text-xl'}`}>
            {isParallel && showOriginalLang && currentDoc.content_original 
              ? renderHighlightedContent(currentDoc.content_original, currentDoc.id) 
              : renderHighlightedContent(currentDoc.content, currentDoc.id)}
          </p>

          <div className={`grid grid-cols-1 xl:grid-cols-2 gap-12 border-t ${theme.colors.border} pt-12 mt-auto`}>
            <div className="group">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A52A2A] mb-6 flex items-center gap-2">
                 <BookOpen className="w-3 h-3" />
                 Normalized Proofs
              </h3>
              <ul className="space-y-5">
                {currentDoc.proofs.map((proof, i) => {
                  const normVerse = normalizeVerse(proof.display);
                  const sharedRefs = VERSE_INDEX_MAP[normVerse] || [];
                  const otherRefs = sharedRefs.filter(id => id !== currentDoc.id);

                  return (
                    <li key={i} className="flex items-start gap-3">
                      <VerseTooltip verse={normVerse}>
                        <span className="font-mono text-[10px] text-[#A52A2A] font-bold whitespace-nowrap underline decoration-[#D1CEC7] underline-offset-4 cursor-pointer">
                          {proof.verseId.substring(0, 15)}
                        </span>
                      </VerseTooltip>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-serif text-[#000000] pt-0.5">
                          {normVerse}
                        </span>
                        {otherRefs.length > 0 && (
                          <span className="text-[9px] font-mono text-[#A52A2A] mt-1 tracking-widest uppercase">
                            + Shared with {otherRefs.length} node(s)
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
                {currentDoc.proofs.length === 0 && (
                  <li className="text-[10px] font-mono text-[#7A756D] italic">NO_PROOFS_REGISTERED</li>
                )}
              </ul>
            </div>

            <div>
               <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A52A2A] mb-6">
                 Custody & References
               </h3>
               
               <div className="space-y-8">
                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-[#7A756D] block mb-3 flex items-center gap-2">
                       <LinkIcon className="w-3 h-3" />
                       Chain of Custody
                    </label>
                    {currentDoc.history_link ? (
                      <div className="group w-full py-2 block">
                        <div className="text-[9px] uppercase text-[#7A756D] font-bold mb-1">Evolved From</div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <button
                              onClick={() => {
                                 if (isParallel) setParallelId(currentDoc.history_link!);
                                 else setActiveId(currentDoc.history_link!);
                              }}
                              className="text-sm font-serif text-left font-bold text-[#000000] underline decoration-[#A52A2A] decoration-2 underline-offset-4 hover:text-[#A52A2A] transition-colors"
                            >
                              {getDoc(currentDoc.history_link)?.title || currentDoc.history_link}
                            </button>
                            {(!isParallel) && (
                              <button
                                 onClick={() => setParallelId(currentDoc.history_link!)}
                                 className="font-mono text-[9px] font-bold uppercase text-[#A52A2A] underline decoration-[#A52A2A] underline-offset-4 shrink-0 transition-colors hover:text-[#000000]"
                              >
                                OPEN PARALLEL
                              </button>
                            )}
                        </div>
                      </div>
                    ) : (
                      <div className="font-mono text-[10px] text-[#7A756D] py-2 border-b border-dashed border-[#D1CEC7]">
                        ROOT_NODE / FOUNDATIONAL
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-[#7A756D] block mb-3 flex items-center gap-2">
                       <Network className="w-3 h-3" />
                       Cross-Reference Engine
                    </label>
                    <div className="space-y-6">
                      {currentDoc.connections.map(connId => {
                        const connDoc = getDoc(connId);
                        if (!connDoc) return null;
                        return (
                          <div key={connId} className="w-full text-left group block">
                            <div className="flex justify-between items-start mb-1">
                              <button
                                onClick={() => {
                                   if (isParallel) setParallelId(connId);
                                   else setActiveId(connId);
                                }}
                                className="font-mono text-[10px] text-[#7A756D] font-bold hover:text-[#000000] transition-colors hover:underline decoration-[#A52A2A] underline-offset-4"
                              >
                               {connDoc.id.toUpperCase()}
                              </button>
                              <span className="text-[9px] font-bold text-[#7A756D]">{connDoc.year} AD</span>
                            </div>
                            <p className="text-xs font-serif leading-snug italic text-[#000000] line-clamp-2">
                              "{connDoc.content}"
                            </p>
                            {!isParallel && (
                              <div className="mt-2 flex justify-end">
                                <button 
                                  onClick={() => setParallelId(connId)}
                                  className="font-mono text-[9px] font-bold uppercase text-[#A52A2A] underline decoration-[#A52A2A] underline-offset-4 transition-colors hover:text-[#000000]"
                                >
                                  OPEN PARALLEL
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                      {currentDoc.connections.length === 0 && (
                         <div className="font-mono text-[10px] text-[#7A756D] py-2 border-b border-dashed border-[#D1CEC7]">
                            NO_CONNECTIONS_FOUND
                         </div>
                      )}
                    </div>
                  </div>

               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex h-screen w-full ${theme.colors.bg} ${theme.colors.text} ${theme.typography.fontBody} overflow-hidden`}>
      {/* Left Sidebar Layout */}
      <aside className={`w-80 border-r ${theme.colors.border} ${theme.colors.bg} flex flex-col h-full shrink-0`}>
        <div className={`p-6 border-b ${theme.colors.border} ${theme.colors.paperBg}/50 backdrop-blur-sm relative`}>
          <button 
            onClick={() => setThemeMode(themeMode === 'museum' ? 'minimalist' : 'museum')}
            className={`absolute top-4 right-4 text-[9px] uppercase font-bold p-1 border ${theme.colors.border} hover:${theme.colors.bg}`}
          >
            {themeMode}
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Network className={`w-5 h-5 ${theme.colors.accent}`} />
            <h1 className={`text-[10px] font-bold tracking-[0.2em] uppercase ${theme.colors.text}`}>Creed Transform Engine</h1>
          </div>
          <p className={`text-[10px] font-mono tracking-tighter ${theme.colors.accent} font-bold`}>THEOS_DATA_v2.0</p>
        </div>

        <div className="p-4 border-b border-[#D1CEC7]">
          <label className="text-[9px] uppercase tracking-widest text-[#7A756D] mb-2 flex items-center gap-2 font-bold">
            <Search className="w-3 h-3" /> Global Verse Search
          </label>
          <input
            type="text"
            placeholder="e.g. Romans 3:23"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#EFECE6] border border-[#D1CEC7] p-2 text-[11px] font-mono focus:border-[#A52A2A] focus:outline-none transition-colors text-[#1A1A1A] placeholder-[#7A756D]"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {searchQuery ? (
            <div>
              <h2 className="text-[10px] uppercase tracking-widest text-[#A52A2A] font-bold mb-4 px-2">Verse Results</h2>
              {VERSE_INDEX_ARRAY.filter(v => v.verse.toLowerCase().includes(searchQuery.toLowerCase())).map((vMatch) => (
                <div key={vMatch.verse} className="mb-6">
                  <div className="flex items-center gap-2 mb-2 px-2">
                     <span className="font-mono text-[10px] bg-[#1A1A1A] text-white p-1 px-2">{vMatch.verse}</span>
                     <span className="text-[9px] text-[#7A756D] font-bold">{vMatch.referencedBy.length} REF(S)</span>
                  </div>
                  <div className="space-y-2">
                   {vMatch.referencedBy.map(docId => {
                     const doc = getDoc(docId);
                     if (!doc) return null;
                     return (
                       <button
                         key={docId}
                         onClick={() => setActiveId(docId)}
                         className="w-full text-left py-2 border-b border-dashed border-[#D1CEC7] last:border-0 group transition-all"
                       >
                         <div className={`font-mono text-[9px] font-bold mb-1 ${activeId === docId ? 'text-[#A52A2A]' : 'text-[#7A756D] group-hover:text-[#000000]'}`}>{doc.id.toUpperCase()}</div>
                         <div className={`font-serif text-xs leading-snug line-clamp-2 ${activeId === docId ? 'text-[#000000] underline decoration-[#A52A2A] decoration-2 underline-offset-4 font-bold' : 'text-[#333] group-hover:underline underline-offset-4'}`}>"{doc.content}"</div>
                       </button>
                     );
                   })}
                  </div>
                </div>
              ))}
              {VERSE_INDEX_ARRAY.filter(v => v.verse.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <div className="font-mono text-[10px] p-4 text-center text-[#7A756D]">NO_MATCHES</div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-[10px] uppercase tracking-widest text-[#A52A2A] font-bold mb-4 px-2">Document Registry</h2>
              {data.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setActiveId(doc.id)}
                  className={`w-full text-left p-4 border-b border-[#D1CEC7] transition-all group ${
                    activeId === doc.id ? 'bg-[#EFECE6]' : 'hover:bg-[#EFECE6]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-mono text-[10px] font-bold ${activeId === doc.id ? 'text-[#A52A2A]' : 'text-[#7A756D] group-hover:text-[#000000]'}`}>{doc.id.toUpperCase()}</span>
                    <span className={`text-[10px] font-bold ${activeId === doc.id ? 'text-[#A52A2A]' : 'text-[#7A756D]'}`}>{doc.year} AD</span>
                  </div>
                  <h3 className={`font-serif text-sm leading-snug mb-2 ${activeId === doc.id ? 'text-[#000000] underline decoration-[#A52A2A] decoration-2 underline-offset-4' : 'text-[#1A1A1A] group-hover:underline underline-offset-4'}`}>
                    {doc.title}
                  </h3>
                  
                  {/* Heatmap Indicator */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex flex-wrap gap-[3px] flex-1">
                      {Array.from({ length: Math.min(doc.proofs.length, 45) }).map((_, i) => (
                        <div key={i} className={`w-[4px] h-[4px] ${activeId === doc.id ? 'bg-[#A52A2A]' : 'bg-[#D1CEC7] group-hover:bg-[#A52A2A]/40'}`}></div>
                      ))}
                      {doc.proofs.length > 45 && <span className="text-[7px] font-mono leading-none text-[#A52A2A] ml-1">+{doc.proofs.length - 45}</span>}
                    </div>
                    {doc.proofs.length > 0 && (
                       <span className={`text-[9px] font-mono font-bold tracking-widest ${activeId === doc.id ? 'text-[#A52A2A]' : 'text-[#7A756D]'}`}>
                         {doc.proofs.length}
                       </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Status panel mimicking design */}
        <div className="p-6 border-t border-[#D1CEC7] bg-[#EFECE6]">
           <button 
             onClick={() => setShowContribute(true)}
             className="w-full p-4 bg-[#1A1A1A] text-white hover:bg-[#A52A2A] transition-colors rounded-sm flex flex-col items-start group"
           >
              <div className="text-[9px] uppercase tracking-widest opacity-60 mb-2 flex items-center justify-between w-full">
                 <span>Open-Source Data</span>
                 <Github className="w-3 h-3 group-hover:animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="font-mono text-[11px] uppercase group-hover:underline">SCHEMA_V2_ACTIVE</span>
              </div>
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
        
        {/* Header */}
        <header className="h-16 border-b border-[#D1CEC7] px-8 flex items-center bg-white/50 backdrop-blur-sm shrink-0 gap-6 z-10 relative">
          <div className="flex bg-[#EFECE6] p-1 border border-[#D1CEC7]">
            <button 
              onClick={() => setViewMode('reader')}
              className={`flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest font-mono transition-colors ${viewMode === 'reader' ? 'bg-[#1A1A1A] text-white' : 'text-[#7A756D] hover:text-[#000000]'}`}
            >
              <TypeIcon className="w-3 h-3" /> Reader
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest font-mono transition-colors ${viewMode === 'map' ? 'bg-[#1A1A1A] text-white' : 'text-[#7A756D] hover:text-[#000000]'}`}
            >
              <MapIcon className="w-3 h-3" /> Topography
            </button>
            <button 
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest font-mono transition-colors ${viewMode === 'timeline' ? 'bg-[#1A1A1A] text-white' : 'text-[#7A756D] hover:text-[#000000]'}`}
            >
              <MapIcon className="w-3 h-3" /> Timeline
            </button>
          </div>

          <div className="flex-1 flex items-center relative h-10 group/search block">
            <Search className="w-4 h-4 text-[#A52A2A] absolute left-3" />
            <input 
              type="text"
              placeholder={isSemanticSearch ? "Semantic search concepts... (e.g. 'imputation of righteousness')" : "Deep Search nodes, texts, & verses... (e.g. 'Justification')"}
              value={deepSearchQuery}
              onChange={e => {
                setDeepSearchQuery(e.target.value);
                if (e.target.value === '') setSemanticResultsList([]);
              }}
              className="w-full h-full bg-[#F9F7F2] border border-[#D1CEC7] pl-10 pr-32 font-mono text-[11px] focus:border-[#A52A2A] focus:outline-none transition-colors text-[#000000] placeholder-[#7A756D] uppercase font-bold tracking-widest"
            />
            <button
               onClick={() => setIsSemanticSearch(!isSemanticSearch)}
               className={`absolute right-1 top-1 bottom-1 px-3 text-[9px] font-bold font-mono tracking-widest uppercase transition-colors flex items-center gap-1 ${isSemanticSearch ? 'bg-[#A52A2A] text-white' : 'bg-[#EFECE6] text-[#7A756D] hover:text-[#1A1A1A]'}`}
               title="Toggle Semantic AI Indexing"
            >
               <Sparkles className="w-3 h-3" /> AI Search
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            {!deepSearchQuery && (
              <div className="flex items-center gap-6 border-r border-[#D1CEC7] pr-6 h-full py-4">
                <div className="bg-[#A52A2A] text-white p-1 px-2 font-mono text-xs font-bold tracking-tighter uppercase">{activeDoc.id}</div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#7A756D]">
                  <span className="hidden sm:inline">Historical Year:</span>
                  <span className="font-serif italic text-lg text-[#1A1A1A]">{activeDoc.year}</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4 relative">
              {user ? (
                <>
                  <div className="flex flex-col items-end group relative">
                    <button 
                       className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold text-[#A52A2A] hover:text-[#8A2525]"
                    >
                      <FolderOpen className="w-4 h-4" /> Workspaces
                    </button>
                    {/* Workspaces Dropdown */}
                    <div className="absolute top-full right-0 mt-2 bg-white border border-[#D1CEC7] shadow-xl w-64 hidden group-hover:flex flex-col z-50">
                      <div className="p-3 border-b border-[#D1CEC7] bg-[#F9F7F2]">
                        <div className="text-[9px] uppercase tracking-widest text-[#7A756D] font-bold">Saved Views</div>
                      </div>
                      <div className="max-h-60 overflow-y-auto p-2">
                        {workspaces.map(ws => (
                          <div key={ws.id} className="flex items-center justify-between p-2 hover:bg-[#EFECE6] text-left group/item cursor-pointer" onClick={() => handleLoadWorkspace(ws)}>
                            <span className="font-serif text-sm font-bold text-[#1A1A1A]">{ws.name}</span>
                            <button onClick={(e) => handleDeleteWorkspace(ws.id, e)} className="text-[#A52A2A] opacity-0 group-hover/item:opacity-100 font-mono text-[9px] uppercase">DEL</button>
                          </div>
                        ))}
                        {workspaces.length === 0 && <div className="p-3 text-center font-mono text-[10px] text-[#7A756D]">NO WORKSPACES</div>}
                      </div>
                      <div className="p-2 border-t border-[#D1CEC7] bg-[#F9F7F2]">
                         {showSaveWorkspace ? (
                            <div className="flex gap-2">
                               <input type="text" value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} placeholder="Workspace Name..." className="flex-1 text-[10px] font-mono p-1 border border-[#D1CEC7] focus:outline-none focus:border-[#A52A2A]" />
                               <button onClick={handleSaveWorkspace} className="bg-[#A52A2A] text-white px-2 font-mono text-[9px] font-bold">SAVE</button>
                            </div>
                         ) : (
                            <button onClick={(e) => { e.stopPropagation(); setShowSaveWorkspace(true); }} className="w-full flex justify-center items-center gap-2 text-[10px] font-mono uppercase bg-[#1A1A1A] text-white p-2 font-bold hover:bg-[#333]">
                              <Save className="w-3 h-3" /> Save Current View
                            </button>
                         )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={logout}
                    className="font-mono text-[10px] uppercase p-1 px-3 border border-[#D1CEC7] text-[#000000] hover:bg-[#EFECE6] transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <button 
                  onClick={loginWithGoogle}
                  className="font-mono text-[10px] font-bold uppercase tracking-widest text-white bg-[#A52A2A] hover:bg-[#8A2525] p-2 px-4 transition-colors flex items-center gap-2"
                >
                  <LogIn className="w-3 h-3" /> Sync Identity
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        {viewMode === 'timeline' && !deepSearchQuery ? (
          <div className="flex-1 relative w-full bg-[#EFECE6]">
            <TimelineMap 
              documents={data} 
              onSelectDocument={(id) => {
                setActiveId(id);
                setViewMode('reader');
              }} 
            />
          </div>
        ) : viewMode === 'map' && !deepSearchQuery ? (
          <div className="flex-1 relative w-full bg-[#EFECE6]">
            <TopographyMap 
              data={data} 
              onNodeClick={(id) => {
                setActiveId(id);
                setViewMode('reader');
              }} 
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 md:p-16 relative w-full bg-[#F9F7F2]">
            {deepSearchQuery ? (
              <div className="max-w-5xl mx-auto bg-white border-double border-[6px] border-[#D1CEC7] p-8 md:p-16 relative shadow-sm">
              <div className="text-[120px] md:text-[180px] font-serif leading-[0.8] font-black text-[#A52A2A]/5 absolute right-4 top-12 pointer-events-none select-none italic max-w-full hidden md:block z-0">
                SEARCH
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-serif font-black leading-tight mb-12 text-[#000000] border-b border-[#D1CEC7] pb-8 flex items-center justify-between">
                  <span>Search Archive</span>
                  {isSemanticSearching && <span className="text-[12px] font-mono font-bold tracking-widest text-[#A52A2A] uppercase flex items-center gap-2"><Sparkles className="w-4 h-4 animate-spin" /> Thinking...</span>}
                </h2>
                
                <div className="mb-16">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#A52A2A] mb-6 flex items-center gap-2">
                    <FileText className="w-3 h-3" />
                    Mentioned in {deepSearchResults.docs.length} Confessions {isSemanticSearch && '(Semantic Match)'}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {deepSearchResults.docs.map(doc => (
                      <div 
                        key={doc.id}
                        className="text-left p-5 border border-[#D1CEC7] hover:border-[#A52A2A] bg-[#F9F7F2] transition-colors group flex flex-col"
                      >
                        <div className="flex flex-wrap gap-3 items-center mb-4">
                          <span className="font-mono text-[10px] bg-[#1A1A1A] text-white p-1 px-2">{doc.id.toUpperCase()}</span>
                          <span className="font-mono text-[10px] text-[#A52A2A] font-bold">{doc.year} AD</span>
                          <span className="font-mono text-[10px] text-[#7A756D]">{doc.proofs.length} PROOFS</span>
                          
                          <div className="ml-auto flex gap-4">
                              <button 
                                onClick={() => { setActiveId(doc.id); setDeepSearchQuery(''); }}
                                className="font-mono text-[10px] font-bold text-[#000000] underline decoration-[#000000] underline-offset-4 hover:text-[#A52A2A] hover:decoration-[#A52A2A]"
                              >
                                OPEN
                              </button>
                              <button 
                                onClick={() => { setParallelId(doc.id); setDeepSearchQuery(''); }}
                                className="font-mono text-[10px] font-bold text-[#A52A2A] underline decoration-[#A52A2A] underline-offset-4 hover:text-[#000000] hover:decoration-[#000000]"
                              >
                                OPEN PARALLEL
                              </button>
                          </div>
                        </div>
                        <div className="font-serif text-[15px] leading-relaxed text-[#333] group-hover:text-[#000000] line-clamp-3">
                          {doc.content}
                        </div>
                      </div>
                    ))}
                    {deepSearchResults.docs.length === 0 && (
                      <div className="font-mono text-[10px] text-[#7A756D] py-4 border border-dashed border-[#D1CEC7] bg-[#F9F7F2] text-center w-full">NO_DOCUMENTS_FOUND</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#A52A2A] mb-6 flex items-center gap-2">
                    <BookOpen className="w-3 h-3" />
                    Supported by {deepSearchResults.verses.length} Verses
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {deepSearchResults.verses.map(v => (
                      <button 
                        key={v.verse}
                        onClick={() => { setSearchQuery(v.verse); setDeepSearchQuery(''); }}
                        className="flex items-center gap-2 border border-[#D1CEC7] bg-[#F9F7F2] p-2 hover:border-[#A52A2A] transition-colors group"
                      >
                        <span className="font-mono text-[10px] text-[#000000] font-bold underline decoration-[#D1CEC7] group-hover:decoration-[#A52A2A] underline-offset-4">{v.verse}</span>
                        <span className="font-mono text-[9px] text-[#7A756D]">{v.referencedBy.length} REFS</span>
                      </button>
                    ))}
                    {deepSearchResults.verses.length === 0 && (
                      <div className="font-mono text-[10px] text-[#7A756D] py-4 border border-dashed border-[#D1CEC7] bg-[#F9F7F2] text-center w-full">NO_VERSES_FOUND</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            parallelDoc ? (
               <div className="flex flex-col h-full items-stretch">
                   <div className="flex justify-center gap-4 mb-6 shrink-0 flex-wrap">
                      <button 
                        onClick={() => setIsDiffMode(!isDiffMode)} 
                        className={`font-mono uppercase tracking-widest text-[9px] font-bold py-2 px-6 flex items-center gap-2 transition-colors border-2 ${isDiffMode ? 'bg-[#A52A2A] text-white border-[#A52A2A]' : 'bg-[#EFECE6] border-[#D1CEC7] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A]'}`}
                      >
                         <BookOpen className="w-3 h-3" /> {isDiffMode ? 'Exit Diff View' : 'Git-Style Diff View'}
                      </button>
                      <button 
                        onClick={() => setShowAIAnalysis(true)} 
                        className="bg-[#1A1A1A] hover:bg-[#A52A2A] text-white font-mono uppercase tracking-widest text-[9px] font-bold py-2 px-6 flex items-center gap-2 transition-colors border-2 border-transparent"
                      >
                         <Sparkles className="w-3 h-3" /> Analyze Theological Differences (AI)
                      </button>
                   </div>
                   <div className="flex flex-col lg:flex-row gap-8 w-full max-w-[2000px] mx-auto auto-rows-auto items-stretch flex-1 relative min-h-0">
                      {isDiffMode ? (
                        <div className="flex-1 w-full overflow-y-auto">
                           <div className={`${theme.layout.docContainer} h-full max-w-5xl mx-auto`}>
                             <div className="flex justify-between items-center mb-12 pb-4 border-b border-[#D1CEC7]">
                               <div>
                                 <div className="text-[10px] font-mono font-bold text-[#A52A2A] uppercase tracking-widest mb-2">Original Baseline</div>
                                 <h2 className="text-xl md:text-2xl font-serif text-[#000000]">{activeDoc.title}</h2>
                               </div>
                               <div className="text-left md:text-right">
                                 <div className="text-[10px] font-mono font-bold text-[#A52A2A] uppercase tracking-widest mb-2">Modified Fork</div>
                                 <h2 className="text-xl md:text-2xl font-serif text-[#000000]">{parallelDoc.title}</h2>
                               </div>
                             </div>
                             <div className="mb-4 flex items-center justify-center gap-6 text-[11px] font-mono font-bold uppercase tracking-widest text-[#7A756D]">
                               <span className="flex items-center gap-2"><span className="w-3 h-3 bg-red-200 inline-block"></span> Removed</span>
                               <span className="flex items-center gap-2"><span className="w-3 h-3 bg-green-200 inline-block"></span> Added</span>
                             </div>
                             <DocumentDiff originalText={activeDoc.content} modifiedText={parallelDoc.content} />
                           </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 w-full lg:w-1/2 overflow-y-auto">
                            {renderDocumentContent(activeDoc, false)}
                          </div>
                          <div className="flex-1 w-full lg:w-1/2 overflow-y-auto">
                            {renderDocumentContent(parallelDoc, true)}
                          </div>
                        </>
                      )}
                   </div>
               </div>
            ) : (
               renderDocumentContent(activeDoc, false)
            )
          )}
        </div>
        )}

        {/* Verse Density Footer / Bottom Status Bar */}
        <footer className="border-t border-[#D1CEC7] bg-[#1A1A1A] text-white px-8 py-3 hidden md:flex items-center justify-between font-mono text-[10px] tracking-tight shrink-0">
          <div className="flex gap-6 items-center flex-1">
            <span className="text-[#A52A2A] font-bold tracking-widest uppercase">Verse Density Engine ::</span>
            <div className="flex gap-4 items-center">
              {topVerses.map(v => (
                <button 
                  key={v.verse} 
                  onClick={() => setSearchQuery(v.verse)}
                  className="group flex items-center gap-2 hover:bg-[#A52A2A] transition-colors p-1 px-3 border border-[#333] hover:border-[#A52A2A]"
                >
                  <span className="text-white group-hover:text-[#F9F7F2] font-bold underline decoration-[#7A756D] underline-offset-4 group-hover:decoration-transparent">{v.verse}</span>
                  <span className="text-[#7A756D] group-hover:text-white font-mono">[{v.referencedBy.length}]</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-[#7A756D]">DB: CORE</span>
            <span className="text-green-400">SYS_OL</span>
          </div>
        </footer>
      </main>

      <AIContextPopup documentTitle={activeDoc.title} documentId={activeDoc.id} contentRef={contentRef} />
      {showAIAnalysis && parallelDoc && (
         <AIAnalysisModal 
           doc1={activeDoc} 
           doc2={parallelDoc} 
           onClose={() => setShowAIAnalysis(false)} 
         />
      )}
      {showContribute && (
         <ContributeModal onClose={() => setShowContribute(false)} />
      )}
    </div>
  );
}
