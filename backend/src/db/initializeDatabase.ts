import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { db } from './database.js';
import { syncCategoriesFromFile } from './syncCategories.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(currentDir, 'schema.sql');

type TableColumn = {
  name: string;
};

function ensureArticleColumns() {
  const columns = db.prepare<[], TableColumn>('PRAGMA table_info(articles)').all();
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has('thumbnail_url')) {
    db.exec('ALTER TABLE articles ADD COLUMN thumbnail_url TEXT');
  }
}

export function initializeDatabase() {
  const schema = readFileSync(schemaPath, 'utf8');

  db.exec(schema);
  ensureArticleColumns();
  syncCategoriesFromFile();
}
