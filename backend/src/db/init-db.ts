import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { db, databasePath } from './database.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(currentDir, 'schema.sql');
const schema = readFileSync(schemaPath, 'utf8');

db.exec(schema);

console.log(`Database inizializzato: ${databasePath}`);
