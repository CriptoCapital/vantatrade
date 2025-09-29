// scripts/generate-env.js
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const APP_NAME = process.env.APP_NAME || 'VantaTrade';

const contents = `// generated at build
window.__env__ = {
  SUPABASE_URL: "${SUPABASE_URL}",
  SUPABASE_ANON_KEY: "${SUPABASE_ANON_KEY}",
  APP_NAME: "${APP_NAME}"
};
`;

fs.writeFileSync(path.join(outDir, 'env.js'), contents, 'utf8');
console.log('✅ env.js written');
