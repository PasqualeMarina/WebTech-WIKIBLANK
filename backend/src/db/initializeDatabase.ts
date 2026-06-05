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

type TableDefinition = {
  sql: string | null;
};

function ensureArticleColumns() {
  const columns = db.prepare<[], TableColumn>('PRAGMA table_info(articles)').all();
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has('thumbnail_url')) {
    db.exec('ALTER TABLE articles ADD COLUMN thumbnail_url TEXT');
  }
}

function ensureGameStatuses() {
  const gamesTable = db.prepare<[], TableDefinition>(`
    SELECT sql
    FROM sqlite_master
    WHERE type = 'table' AND name = 'games'
  `).get();

  if (!gamesTable?.sql?.includes("'abandoned'")) {
    return;
  }

  db.pragma('foreign_keys = OFF');

  try {
    db.transaction(() => {
      db.exec(`
        CREATE TABLE games_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          article_id INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'active'
            CHECK (status IN ('active', 'won')),
          current_title_guess TEXT,
          revealed_words_count INTEGER NOT NULL DEFAULT 0
            CHECK (revealed_words_count >= 0),
          word_guesses_count INTEGER NOT NULL DEFAULT 0
            CHECK (word_guesses_count >= 0),
          title_guesses_count INTEGER NOT NULL DEFAULT 0
            CHECK (title_guesses_count >= 0),
          started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          ended_at TEXT,
          elapsed_seconds INTEGER NOT NULL DEFAULT 0
            CHECK (elapsed_seconds >= 0),
          FOREIGN KEY (user_id) REFERENCES users (id)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
          FOREIGN KEY (article_id) REFERENCES articles (id)
            ON UPDATE CASCADE
            ON DELETE RESTRICT
        );

        INSERT INTO games_new (
          id,
          user_id,
          article_id,
          status,
          current_title_guess,
          revealed_words_count,
          word_guesses_count,
          title_guesses_count,
          started_at,
          ended_at,
          elapsed_seconds
        )
        SELECT
          id,
          user_id,
          article_id,
          CASE WHEN status = 'won' THEN 'won' ELSE 'active' END,
          current_title_guess,
          revealed_words_count,
          word_guesses_count,
          title_guesses_count,
          started_at,
          CASE WHEN status = 'won' THEN ended_at ELSE NULL END,
          CASE WHEN status = 'won' THEN elapsed_seconds ELSE 0 END
        FROM games;

        DROP TABLE games;
        ALTER TABLE games_new RENAME TO games;

        CREATE INDEX idx_games_user_status
          ON games (user_id, status);

        CREATE INDEX idx_games_status_elapsed
          ON games (status, elapsed_seconds);
      `);
    })();
  } finally {
    db.pragma('foreign_keys = ON');
  }
}

export function initializeDatabase() {
  const schema = readFileSync(schemaPath, 'utf8');

  db.exec(schema);
  ensureArticleColumns();
  ensureGameStatuses();
  syncCategoriesFromFile();
}
