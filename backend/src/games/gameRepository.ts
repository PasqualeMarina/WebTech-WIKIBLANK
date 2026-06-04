import { db } from '../db/database.js';
import { GameStorageError } from './gameErrors.js';
import type { CreatedGame, GameData } from './gameTypes.js';

type CategoryRow = {
    id: number;
};

type ArticleRow = {
    id: number;
};

const findCategoryBySlugStatement = db.prepare<[string], CategoryRow>(`
    SELECT id
    FROM categories
    WHERE slug = ?
`);

const findArticleBySourceUrlStatement = db.prepare<[string], ArticleRow>(`
    SELECT id
    FROM articles
    WHERE source_url = ?
`);

const createArticleStatement = db.prepare<{
    categoryId: number;
    title: string;
    content: string;
    sourceUrl: string;
    thumbnailUrl: string | null;
}, ArticleRow>(`
    INSERT INTO articles (category_id, title, content, source_url, thumbnail_url)
    VALUES (@categoryId, @title, @content, @sourceUrl, @thumbnailUrl)
    RETURNING id
`);

const updateArticleStatement = db.prepare<{
    id: number;
    categoryId: number;
    title: string;
    content: string;
    thumbnailUrl: string | null;
}>(`
    UPDATE articles
    SET category_id = @categoryId,
        title = @title,
        content = @content,
        thumbnail_url = @thumbnailUrl
    WHERE id = @id
`);

const createGameStatement = db.prepare<{
    userId: number;
    articleId: number;
}, CreatedGame>(`
    INSERT INTO games (user_id, article_id)
    VALUES (@userId, @articleId)
    RETURNING
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
`);

const createGameTransaction = db.transaction((gameData: GameData): CreatedGame => {
    const category = findCategoryBySlugStatement.get(gameData.categoryId);

    if (!category) {
        throw new GameStorageError(`Category "${gameData.categoryId}" not found in database`);
    }

    const existingArticle = findArticleBySourceUrlStatement.get(gameData.articleUrl);
    let articleId = existingArticle?.id;

    if (articleId) {
        updateArticleStatement.run({
            id: articleId,
            categoryId: category.id,
            title: gameData.title,
            content: gameData.description,
            thumbnailUrl: gameData.thumbnailUrl,
        });
    } else {
        articleId = createArticleStatement.get({
            categoryId: category.id,
            title: gameData.title,
            content: gameData.description,
            sourceUrl: gameData.articleUrl,
            thumbnailUrl: gameData.thumbnailUrl,
        })?.id;
    }

    if (!articleId) {
        throw new GameStorageError('Failed to create article');
    }

    const game = createGameStatement.get({
        userId: gameData.userId,
        articleId,
    });

    if (!game) {
        throw new GameStorageError('Failed to create game');
    }

    return game;
});

export function createGameInDatabase(gameData: GameData): CreatedGame {
    return createGameTransaction(gameData);
}
