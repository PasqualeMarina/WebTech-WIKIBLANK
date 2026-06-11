PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  label TEXT NOT NULL,
  wikipedia_category TEXT NOT NULL UNIQUE COLLATE NOCASE
);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT,
  thumbnail_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  article_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'won')),
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

CREATE TABLE IF NOT EXISTS game_revealed_words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  word TEXT NOT NULL,
  normalized_word TEXT NOT NULL,
  revealed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  UNIQUE (game_id, normalized_word)
);

CREATE INDEX IF NOT EXISTS idx_articles_category_id
  ON articles (category_id);

CREATE INDEX IF NOT EXISTS idx_games_user_status
  ON games (user_id, status);

CREATE INDEX IF NOT EXISTS idx_games_status_elapsed
  ON games (status, elapsed_seconds);

CREATE INDEX IF NOT EXISTS idx_game_revealed_words_game_id
  ON game_revealed_words (game_id);
