import fs from 'fs/promises';
import path from 'path';

const CREEDS_URL = 'https://raw.githubusercontent.com/NonlinearFruit/Creeds.json/master/creeds/';
const TARGET_DIR = path.resolve(process.cwd(), 'public');

const TARGETS = [
  { idPrefix: 'hc', file: 'heidelberg_catechism.json', title: 'Heidelberg Catechism', year: 1563, hasProofs: true, originalLanguage: 'german' },
  { idPrefix: 'bcf', file: 'belgic_confession_of_faith.json', title: 'Belgic Confession', year: 1561, hasProofs: false, originalLanguage: 'french' },
  { idPrefix: 'cod', file: 'canons_of_dort.json', title: 'Canons of Dort', year: 1619, hasProofs: false, originalLanguage: 'latin' },
  { idPrefix: 'lbc', file: 'london_baptist_1689.json', title: '1689 Second London Baptist Confession', year: 1689, hasProofs: false, originalLanguage: 'english' },
  { idPrefix: 'savoy', file: 'savoy_declaration.json', title: 'Savoy Declaration', year: 1658, hasProofs: false, originalLanguage: 'english' },
];

async function main() {
  console.log('Fetching existing data.json...');
  let existingData = { documents: [] };
  try {
    const raw = await fs.readFile(path.join(TARGET_DIR, 'data.json'), 'utf8');
    existingData = JSON.parse(raw);
  } catch (e) {
    console.log('Warning: No existing data.json found, will start fresh if needed.');
  }

  const existingIds = new Set(existingData.documents.map(d => d.id));
  const newDocs = [];

  for (const target of TARGETS) {
    console.log(`Fetching ${target.title}...`);
    const res = await fetch(`${CREEDS_URL}${target.file}`);
    const json = await res.json();
    
    // Parse the data based on its structure
    if (json.Data) {
      json.Data.forEach((item, index) => {
        // Heidelberg Catechism structure
        if (item.Number && item.Answer) {
          const docId = `${target.idPrefix}-${item.Number}`;
          if (!existingIds.has(docId)) {
            newDocs.push({
              id: docId,
              title: `${target.title} - Q.${item.Number}`,
              content: `Q: ${item.Question}\nA: ${item.Answer}`,
              content_original: `(Original ${target.originalLanguage} text unavailable in API)`,
              language_original: target.originalLanguage.toLowerCase(),
              year: target.year,
              proofs: target.hasProofs && item.Proofs ? item.Proofs.map(p => ({ verseId: p.Id, display: p.Id })) : [],
              connections: [],
              history_link: null
            });
          }
        }
        // Canons of Dort or London Baptist / Savoy (Chapter -> Sections structure)
        else if (item.Chapter && item.Sections) {
          item.Sections.forEach(sec => {
            const docId = `${target.idPrefix}-${item.Chapter}-${sec.Section}`;
            if (!existingIds.has(docId)) {
              newDocs.push({
                id: docId,
                title: `${target.title} - Ch. ${item.Chapter}, Sec. ${sec.Section}`,
                content: sec.Content,
                content_original: `(Original ${target.originalLanguage} text unavailable in API)`,
                language_original: target.originalLanguage.toLowerCase(),
                year: target.year,
                proofs: [],
                 connections: [],
                history_link: null
              });
            }
          });
        }
        // Belgic Confession (Article -> Content)
        else if (item.Article && item.Content) {
           const docId = `${target.idPrefix}-${item.Article}`;
           if (!existingIds.has(docId)) {
              newDocs.push({
                id: docId,
                title: `${target.title} - Art. ${item.Article}`,
                content: item.Content,
                content_original: `(Original ${target.originalLanguage} text unavailable in API)`,
                language_original: target.originalLanguage.toLowerCase(),
                year: target.year,
                proofs: [],
                 connections: [],
                history_link: null
              });
           }
        }
      });
    }
  }

  // Interlink documents
  // Let's add basic cross-references: 
  // WCF heavily influenced 1689 and Savoy, Belgic to Dort, etc.
  for (const doc of newDocs) {
     if (doc.id.startsWith('lbc-') || doc.id.startsWith('savoy-')) {
         const wcfId = doc.id.replace('lbc-', 'wcf-').replace('savoy-', 'wcf-');
         if (existingIds.has(wcfId)) {
             doc.history_link = wcfId;
         }
     }
  }
  
  const combined = [...existingData.documents, ...newDocs];
  await fs.writeFile(path.join(TARGET_DIR, 'data.json'), JSON.stringify({ documents: combined }, null, 2));
  console.log(`Ingested ${newDocs.length} new fragments into the Data Lake!`);

  // We should also output this as seed data for standard app mapping if needed, 
  // but public/data.json is the core fetch.
  // We'll update src/data/seed.ts directly to inject these newly mapped records as part of SEED_DATA to support client load immediately
  const seedFile = path.resolve(process.cwd(), 'src/data/seed.ts');
  const seedCode = await fs.readFile(seedFile, 'utf8');
  if (!seedCode.includes('hc-1')) {
     const injection = `\nexport const EXPANDED_DATA: CreedDocument[] = ${JSON.stringify(newDocs, null, 2)};`;
     // We will patch SEED_DATA below WCF_DATA
  }
}

main().catch(console.error);
