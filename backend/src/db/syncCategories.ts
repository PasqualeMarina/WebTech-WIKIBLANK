import { gameCategories } from '../../../shared/gameCategories.js';
import { db } from './database.js';

type CategoryColumn = {
  name: string;
};

function ensureCategoryColumns() {
  const columns = db.prepare<[], CategoryColumn>('PRAGMA table_info(categories)').all();
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has('slug')) {
    db.exec('ALTER TABLE categories ADD COLUMN slug TEXT');
  }

  if (!columnNames.has('label')) {
    db.exec('ALTER TABLE categories ADD COLUMN label TEXT');
  }

  if (!columnNames.has('wikipedia_category')) {
    db.exec('ALTER TABLE categories ADD COLUMN wikipedia_category TEXT');
  }

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug
      ON categories (slug COLLATE NOCASE);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_wikipedia_category
      ON categories (wikipedia_category COLLATE NOCASE);
  `);
}

const syncCategory = db.transaction(() => {
  ensureCategoryColumns();

  const updateCategory = db.prepare<{
    slug: string;
    name: string;
    label: string;
    wikipediaCategory: string;
  }>(`
    UPDATE categories
    SET slug = @slug,
        name = @name,
        label = @label,
        wikipedia_category = @wikipediaCategory
    WHERE slug = @slug
       OR name = @name
       OR wikipedia_category = @wikipediaCategory
  `);

  const insertCategory = db.prepare<{
    slug: string;
    name: string;
    label: string;
    wikipediaCategory: string;
  }>(`
    INSERT INTO categories (slug, name, label, wikipedia_category)
    VALUES (@slug, @name, @label, @wikipediaCategory)
  `);

  for (const category of gameCategories) {
    const data = {
      slug: category.id,
      name: category.label,
      label: category.label,
      wikipediaCategory: category.wikipediaCategory,
    };

    const result = updateCategory.run(data);

    if (result.changes === 0) {
      insertCategory.run(data);
    }
  }
});

export function syncCategoriesFromFile() {
  syncCategory();
}
