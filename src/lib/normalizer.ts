/**
 * Normalizes common Bible book abbreviations to their full names.
 * Example: 'Rom. 3:23' becomes 'Romans 3:23'
 */

const BOOK_MAP: Record<string, string> = {
  'Gen.': 'Genesis',
  'Ex.': 'Exodus',
  'Exod.': 'Exodus',
  'Lev.': 'Leviticus',
  'Num.': 'Numbers',
  'Deut.': 'Deuteronomy',
  'Josh.': 'Joshua',
  'Judg.': 'Judges',
  'Ruth': 'Ruth',
  '1 Sam.': '1 Samuel',
  '2 Sam.': '2 Samuel',
  '1 Kings': '1 Kings',
  '2 Kings': '2 Kings',
  '1 Chron.': '1 Chronicles',
  '2 Chron.': '2 Chronicles',
  'Ezra': 'Ezra',
  'Neh.': 'Nehemiah',
  'Esth.': 'Esther',
  'Job': 'Job',
  'Ps.': 'Psalms',
  'Psa.': 'Psalms',
  'Prov.': 'Proverbs',
  'Eccles.': 'Ecclesiastes',
  'Song': 'Song of Solomon',
  'Isa.': 'Isaiah',
  'Jer.': 'Jeremiah',
  'Lam.': 'Lamentations',
  'Ezek.': 'Ezekiel',
  'Dan.': 'Daniel',
  'Hos.': 'Hosea',
  'Joel': 'Joel',
  'Amos': 'Amos',
  'Obad.': 'Obadiah',
  'Jonah': 'Jonah',
  'Mic.': 'Micah',
  'Nah.': 'Nahum',
  'Hab.': 'Habakkuk',
  'Zeph.': 'Zephaniah',
  'Hag.': 'Haggai',
  'Zech.': 'Zechariah',
  'Mal.': 'Malachi',
  'Matt.': 'Matthew',
  'Mk.': 'Mark',
  'Lk.': 'Luke',
  'Jn.': 'John',
  'Acts': 'Acts',
  'Rom.': 'Romans',
  '1 Cor.': '1 Corinthians',
  '2 Cor.': '2 Corinthians',
  'Gal.': 'Galatians',
  'Eph.': 'Ephesians',
  'Phil.': 'Philippians',
  'Col.': 'Colossians',
  '1 Thess.': '1 Thessalonians',
  '2 Thess.': '2 Thessalonians',
  '1 Tim.': '1 Timothy',
  '2 Tim.': '2 Timothy',
  'Tit.': 'Titus',
  'Philem.': 'Philemon',
  'Heb.': 'Hebrews',
  'Jas.': 'James',
  '1 Pet.': '1 Peter',
  '2 Pet.': '2 Peter',
  '1 Jn.': '1 John',
  '2 Jn.': '2 John',
  '3 Jn.': '3 John',
  'Jude': 'Jude',
  'Rev.': 'Revelation'
};

export function normalizeVerse(verseText: string): string {
  // Try to find if any abbreviation exists at the start of the string
  for (const [abbr, full] of Object.entries(BOOK_MAP)) {
    if (verseText.startsWith(abbr)) {
      return verseText.replace(abbr, full).replace(/\s+/g, ' ').trim();
    }
  }
  return verseText;
}

export function generateNormalizedProofs(rawVerses: string[]) {
  return rawVerses.map(v => {
    const normal = normalizeVerse(v);
    return {
      verseId: normal,
      display: normal
    };
  });
}
