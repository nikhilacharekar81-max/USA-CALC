import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'db.json');

if (fs.existsSync(dbPath)) {
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  if (Array.isArray(dbData.calculators)) {
    let clearedCount = 0;
    dbData.calculators = dbData.calculators.map((calc) => {
      clearedCount++;
      const { content, contentSections, faqs, examples, ...cleanCalc } = calc;
      return {
        ...cleanCalc,
        content: {},
        contentSections: [],
        faqs: [],
        examples: [],
      };
    });

    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf-8');
    console.log(`✅ Successfully cleared text content from all ${clearedCount} calculators in data/db.json!`);
  } else {
    console.log('No calculators array found in data/db.json');
  }
} else {
  console.log('data/db.json file not found');
}
