import React, { useMemo, useRef, useState, useEffect } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { CreedDocument } from '../types';
import { VERSE_INDEX_ARRAY } from '../data/verseIndex';

interface TopographyMapProps {
  data: CreedDocument[];
  onNodeClick: (nodeId: string) => void;
  width?: number;
  height?: number;
}

export function TopographyMap({ data, onNodeClick, width, height }: TopographyMapProps) {
  const fgRef = useRef<ForceGraphMethods>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const graphData = useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];
    const nodeIds = new Set<string>();

    // 1. Add Document Nodes
    data.forEach(doc => {
      if (!nodeIds.has(doc.id)) {
        nodes.push({
          id: doc.id,
          name: doc.title,
          group: 'doc',
          val: Math.max(1, doc.proofs.length * 0.5), // size based on proofs
          color: '#A52A2A',
          docData: doc
        });
        nodeIds.add(doc.id);
      }

      // Add Document -> Document Links
      if (doc.history_link) {
        links.push({
          source: doc.id,
          target: doc.history_link,
          type: 'lineage',
          value: 3
        });
      }

      doc.connections.forEach(conn => {
        links.push({
          source: doc.id,
          target: conn,
          type: 'connection',
          value: 1
        });
      });
    });

    // 2. Add Verse Nodes
    // To prevent graph clutter, only include verses referenced by multiple documents
    const multiRefVerses = VERSE_INDEX_ARRAY.filter(v => v.referencedBy.length > 1);
    
    multiRefVerses.forEach(v => {
      const verseId = `verse-${v.verse}`;
      if (!nodeIds.has(verseId)) {
        nodes.push({
          id: verseId,
          name: v.verse,
          group: 'verse',
          val: v.referencedBy.length,
          color: '#7A756D'
        });
        nodeIds.add(verseId);
      }

      // Add Document -> Verse Links
      v.referencedBy.forEach(docId => {
        if (nodeIds.has(docId)) { // ensure doc exists in graph nodes
          links.push({
            source: docId,
            target: verseId,
            type: 'proof',
            value: 1
          });
        }
      });
    });

    return { nodes, links };
  }, [data]);

  return (
    <div ref={containerRef} className="w-full h-full bg-[#0D0D0D] relative overflow-hidden text-white pattern-dots pattern-gray-900 pattern-bg-white pattern-size-4 pattern-opacity-100">
      <div className="absolute top-4 left-4 z-10 font-mono text-[10px] text-[#D1CEC7] font-bold uppercase tracking-widest bg-[#1A1A1A]/80 p-2 border border-[#333] shadow-lg backdrop-blur-sm pointer-events-none">
        <div className="mb-1 text-[#A52A2A]">Nodes: {graphData.nodes.length}</div>
        <div>Links: {graphData.links.length}</div>
      </div>
      
      {dimensions.width > 0 && dimensions.height > 0 && (
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel="name"
          nodeColor="color"
          linkColor={(link: any) => link.type === 'lineage' ? '#A52A2A' : '#333333'}
          linkWidth={(link: any) => link.type === 'lineage' ? 2 : 1}
          linkDirectionalArrowLength={(link: any) => link.type === 'lineage' ? 3.5 : 0}
          linkDirectionalArrowRelPos={1}
          onNodeClick={(node: any) => {
            if (node.group === 'doc') {
              onNodeClick(node.id);
            }
          }}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.name;
            const fontSize = Math.max(12 / globalScale, 2);
            ctx.font = `${node.group === 'doc' ? 'bold' : ''} ${fontSize}px Sans-Serif`;
            
            // Draw circle
            const r = Math.sqrt(Math.max(0, node.val)) * (node.group === 'doc' ? 1.5 : 1);
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
            
            if (node.group === 'doc') {
               ctx.fillStyle = '#A52A2A'; 
               ctx.shadowColor = '#A52A2A';
               ctx.shadowBlur = 10;
            } else {
               ctx.fillStyle = '#7A756D';
               ctx.shadowColor = 'transparent';
               ctx.shadowBlur = 0;
            }
            
            ctx.fill();
            ctx.shadowBlur = 0; // reset for text

            // Only show labels when somewhat zoomed in
            if (globalScale > 0.8 || node.val > 20) {
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              
              if (globalScale > 1.2) {
                 ctx.fillStyle = node.group === 'doc' ? '#F9F7F2' : '#D1CEC7';
                 ctx.fillText(label, node.x, node.y + r + fontSize/2 + 2);
              }
            }
          }}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
        />
      )}
    </div>
  );
}
