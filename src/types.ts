export interface CreedProof {
  verseId: string;
  display: string;
}

export interface CreedDocument {
  id: string;
  title: string;
  content: string;
  content_original?: string; // Phase 1: Original Language text (Latin, German, Dutch, etc)
  language_original?: 'latin' | 'greek' | 'german' | 'dutch' | 'french' | 'english';
  year: number | string;
  proofs: CreedProof[];
  connections: string[]; // Related topics (Cross-Reference Engine)
  history_link: string | null; // Older creed it evolved from (Chain of Custody)
}

export interface VerseIndexEntry {
  verse: string;
  referencedBy: string[];
}

