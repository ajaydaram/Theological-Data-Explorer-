import React, { useMemo, useState, useEffect } from 'react';
import * as d3 from 'd3';
import { CreedDocument } from '../types';
import { Play, Pause } from 'lucide-react';

interface TimelineMapProps {
  documents: CreedDocument[];
  onSelectDocument: (id: string) => void;
}

const ORIGINS: Record<string, { name: string, lat: number, lng: number }> = {
  'geneva-1': { name: 'Geneva', lat: 46.2044, lng: 6.1432 },
  'apostles-1': { name: 'Rome', lat: 41.9028, lng: 12.4964 },
  'nicene-1': { name: 'Nicaea', lat: 40.4286, lng: 29.7214 },
  'athanasian-1': { name: 'Arles', lat: 43.6766, lng: 4.6278 },
  'chalcedon-1': { name: 'Chalcedon', lat: 40.9904, lng: 29.0292 },
  'augsburg-1': { name: 'Augsburg', lat: 48.3705, lng: 10.8978 },
  'thirty-nine-1': { name: 'London', lat: 51.5074, lng: -0.1278 },
  'hc-1': { name: 'Heidelberg', lat: 49.3988, lng: 8.6724 },
  'hc-2': { name: 'Heidelberg', lat: 49.3988, lng: 8.6724 },
  'bcf-1': { name: 'Tournai', lat: 50.6053, lng: 3.3879 },
  'bcf-2': { name: 'Tournai', lat: 50.6053, lng: 3.3879 },
  'bcf-3': { name: 'Tournai', lat: 50.6053, lng: 3.3879 },
  'dort-1': { name: 'Dordrecht', lat: 51.8133, lng: 4.6900 },
  'dort-2': { name: 'Dordrecht', lat: 51.8133, lng: 4.6900 },
  'lbcf-1-1': { name: 'London', lat: 51.5074, lng: -0.1278 },
};

// Map WCF documents to London
const getLocation = (doc: CreedDocument) => {
  if (doc.id.startsWith('wcf-') || doc.id.startsWith('wsc-')) {
    return { name: 'Westminster', lat: 51.4975, lng: -0.1288 };
  }
  return ORIGINS[doc.id] || null;
};

export function TimelineMap({ documents, onSelectDocument }: TimelineMapProps) {
  const [yearRange, setYearRange] = useState<number>(1700);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch('/europe.json')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(console.error);
  }, []);

  const minYear = 300;
  const maxYear = 1700;

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      if (yearRange >= maxYear) {
         setYearRange(minYear);
      }
      interval = setInterval(() => {
        setYearRange(y => {
          if (y >= maxYear) {
            setIsPlaying(false);
            return maxYear;
          }
          return Math.min(maxYear, y + 8);
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, maxYear, minYear]);

  const docsWithLoc = useMemo(() => {
    return documents.map(d => ({ ...d, loc: getLocation(d) })).filter(d => d.loc);
  }, [documents]);

  const visibleDocs = docsWithLoc.filter(d => (d.year as number) <= yearRange);

  return (
    <div className="flex flex-col h-full items-stretch relative">
      <div className="flex flex-col items-center justify-center p-4 z-10 bg-[#EFECE6]/80 backdrop-blur-sm border-b border-[#D1CEC7]">
        <h2 className="text-2xl md:text-3xl font-serif font-black mb-2 pt-2 md:pt-4 text-[#000000]">Historiography</h2>
        <div className="text-[10px] md:text-xs font-mono tracking-widest text-[#7A756D] uppercase font-bold mb-4 md:mb-6">
          Publishing Locations Across Europe
        </div>
        
        <div className="w-full max-w-2xl px-4 flex flex-col md:flex-row items-center gap-4">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 shrink-0 bg-[#A52A2A] text-white flex items-center justify-center rounded-sm hover:bg-[#1A1A1A] transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-1" />}
          </button>
          
          <div className="flex-1 flex items-center gap-4 w-full">
            <span className="font-mono text-[10px] text-[#7A756D]">{minYear}</span>
            <input 
              type="range"
              min={minYear}
              max={maxYear}
              value={yearRange}
              onChange={(e) => {
                setYearRange(Number(e.target.value));
                setIsPlaying(false);
              }}
              className="flex-1 cursor-pointer accent-[#A52A2A] h-2 bg-[#D1CEC7] rounded-full appearance-none"
            />
            <span className="font-mono text-[10px] text-[#7A756D]">{maxYear}</span>
          </div>
          <div className="text-2xl md:text-3xl font-mono font-bold text-[#A52A2A] w-20 text-center shrink-0">
            {yearRange}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full relative min-h-0 bg-[#F9F7F2]">
        <svg viewBox="0 0 800 600" className="w-full h-full preserve-3d">
          {geoData && (
            <MapFeatures geoData={geoData} />
          )}
          
          {Object.values(
            visibleDocs.reduce((acc, doc) => {
              const key = doc.loc!.name;
              if (!acc[key]) acc[key] = { ...doc.loc!, docs: [] };
              acc[key].docs.push(doc);
              return acc;
            }, {} as Record<string, { name: string, lat: number, lng: number, docs: CreedDocument[] }>)
          ).map((locGroup: any) => {
            const projection = d3.geoMercator()
               .center([8, 48])
               .scale(1600)
               .translate([400, 300]);
               
            const [x, y] = projection([locGroup.lng, locGroup.lat]) || [0, 0];
            const recentlyActive = locGroup.docs.some((d: any) => yearRange - d.year >= 0 && yearRange - d.year <= 10);
            
            return (
              <g key={locGroup.name} className="group cursor-pointer">
                <circle 
                  cx={x} 
                  cy={y} 
                  r={recentlyActive ? "10" : "6"} 
                  className={`fill-[#A52A2A] transition-all pointer-events-none ${recentlyActive ? 'opacity-90 animate-pulse' : 'opacity-70 group-hover:opacity-100'}`}
                />
                <circle 
                  cx={x} 
                  cy={y} 
                  r="3" 
                  className="fill-white pointer-events-none"
                />
                {/* Always show city name briefly */}
                <text 
                  x={x + 12} 
                  y={y + 4} 
                  className="text-[10px] items-center font-mono opacity-60 group-hover:opacity-100 transition-opacity fill-[#1A1A1A] font-bold"
                  style={{ paintOrder: 'stroke fill', stroke: '#F9F7F2', strokeWidth: 4 }}
                >
                  {locGroup.name}
                </text>
                
                {/* List documents vertically */}
                <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                  {locGroup.docs.map((doc, idx) => (
                    <text
                      key={doc.id}
                      x={x + 12}
                      y={y + 20 + (idx * 14)}
                      className="text-[9px] font-mono fill-[#A52A2A] cursor-pointer hover:underline font-bold"
                      onClick={() => onSelectDocument(doc.id)}
                      style={{ paintOrder: 'stroke fill', stroke: '#F9F7F2', strokeWidth: 4 }}
                    >
                      {doc.year}: {doc.title}
                    </text>
                  ))}
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function MapFeatures({ geoData }: { geoData: any }) {
  const projection = d3.geoMercator()
       .center([8, 48])
       .scale(1600)
       .translate([400, 300]);
       
  const pathGenerator = d3.geoPath().projection(projection);

  return (
    <g className="opacity-40">
      {geoData.features.map((feature: any, i: number) => (
        <path
          key={i}
          d={pathGenerator(feature) as string}
          fill="#D1CEC7"
          stroke="#EFECE6"
          strokeWidth={1}
        />
      ))}
    </g>
  );
}
