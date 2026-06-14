import Database from 'better-sqlite3'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const backendDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const databasePath = resolve(backendDir, 'data', 'wikblank.e2e.sqlite')
const username = process.argv[2]

if (!username) {
  throw new Error('A username is required to create an E2E game')
}

const fixture = {
  title: 'Solar System',
  content:
    'Planets travel through space and orbit distant stars. Some planets have moons, while other worlds contain rings and rocky surfaces.',
  categorySlug: 'natural_features',
  correctWord: 'planets',
  incorrectWord: 'banana',
}

const db = new Database(databasePath)
db.pragma('foreign_keys = ON')

try {
  const createGame = db.transaction(() => {
    const user = db
      .prepare('SELECT id FROM users WHERE username = ? COLLATE NOCASE')
      .get(username)

    if (!user) {
      throw new Error(`E2E user "${username}" was not found`)
    }

    const category = db
      .prepare('SELECT id, label FROM categories WHERE slug = ?')
      .get(fixture.categorySlug)

    if (!category) {
      throw new Error(`E2E category "${fixture.categorySlug}" was not found`)
    }

    const article = db
      .prepare(`
        INSERT INTO articles (
          category_id,
          title,
          content,
          source_url,
          thumbnail_url
        )
        VALUES (?, ?, ?, ?, NULL)
        RETURNING id
      `)
      .get(
        category.id,
        fixture.title,
        fixture.content,
        `https://example.test/articles/${encodeURIComponent(username)}/${Date.now()}`,
      )

    const game = db
      .prepare(`
        INSERT INTO games (user_id, article_id)
        VALUES (?, ?)
        RETURNING id
      `)
      .get(user.id, article.id)

    return {
      gameId: game.id,
      title: fixture.title,
      content: fixture.content,
      category: category.label,
      correctWord: fixture.correctWord,
      correctWordOccurrences: 2,
      incorrectWord: fixture.incorrectWord,
    }
  })

  process.stdout.write(JSON.stringify(createGame()))
} finally {
  db.close()
}
