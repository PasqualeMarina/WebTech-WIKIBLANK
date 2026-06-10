import { db } from '../db/database.js';
import { GameStorageError } from './gameErrors.js';
import type { ActiveGameRow, CreatedGame, GameData, GameDetailRow, LeaderboardRow, RevealedWordRow } from './gameTypes.js';

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

const findGameDetailByIdStatement = db.prepare<[number], GameDetailRow>(`
    SELECT
        games.id,
        games.user_id,
        games.article_id,
        games.status,
        games.current_title_guess,
        games.revealed_words_count,
        games.word_guesses_count,
        games.title_guesses_count,
        games.started_at,
        games.ended_at,
        games.elapsed_seconds,
        articles.title AS article_title,
        articles.content AS article_content,
        categories.id AS category_id,
        categories.label AS category_name,
        users.username
    FROM games
    JOIN articles ON articles.id = games.article_id
    JOIN categories ON categories.id = articles.category_id
    JOIN users ON users.id = games.user_id
    WHERE games.id = ?
`);

const findCompletedGameDetailsStatement = db.prepare<[], GameDetailRow>(`
    SELECT
        games.id,
        games.user_id,
        games.article_id,
        games.status,
        games.current_title_guess,
        games.revealed_words_count,
        games.word_guesses_count,
        games.title_guesses_count,
        games.started_at,
        games.ended_at,
        games.elapsed_seconds,
        articles.title AS article_title,
        articles.content AS article_content,
        categories.id AS category_id,
        categories.label AS category_name,
        users.username
    FROM games
    JOIN articles ON articles.id = games.article_id
    JOIN categories ON categories.id = articles.category_id
    JOIN users ON users.id = games.user_id
    WHERE games.status = 'won'
    ORDER BY games.ended_at DESC
`);

const findLeaderboardStatement = db.prepare<[], LeaderboardRow>(`
    SELECT
        users.username,
        COUNT(CASE WHEN games.status = 'won' THEN 1 END) AS gamesWon,
        COUNT(games.id) AS totalGamesPlayed,
        CASE
            WHEN COUNT(games.id) = 0 THEN 0
            ELSE 100.0 * COUNT(CASE WHEN games.status = 'won' THEN 1 END) / COUNT(games.id)
        END AS winPercentage,
        AVG(CASE WHEN games.status = 'won' THEN games.elapsed_seconds END) AS averageWinTimeSeconds
    FROM users
    LEFT JOIN games ON games.user_id = users.id
    GROUP BY users.id, users.username
`);

const findActiveGamesByUserIdStatement = db.prepare<[number], ActiveGameRow>(`
    SELECT
        games.id,
        categories.id AS category_id,
        categories.label AS category_name,
        games.revealed_words_count,
        games.word_guesses_count,
        games.title_guesses_count,
        MAX(
            0,
            CAST(strftime('%s', CURRENT_TIMESTAMP) - strftime('%s', games.started_at) AS INTEGER)
        ) AS elapsed_seconds,
        games.started_at
    FROM games
    JOIN articles ON articles.id = games.article_id
    JOIN categories ON categories.id = articles.category_id
    WHERE games.user_id = ?
      AND games.status = 'active'
    ORDER BY games.started_at DESC
`);

const findRevealedWordsByGameIdStatement = db.prepare<[number], RevealedWordRow>(`
    SELECT normalized_word
    FROM game_revealed_words
    WHERE game_id = ?
`);

const findActiveGameForUserStatement = db.prepare<[number, number], { id: number }>(`
    SELECT id
    FROM games
    WHERE id = ?
      AND user_id = ?
      AND status = 'active'
`);

const incrementWordGuessesStatement = db.prepare<[number, number]>(`
    UPDATE games
    SET word_guesses_count = word_guesses_count + 1
    WHERE id = ?
      AND user_id = ?
      AND status = 'active'
`);

const insertRevealedWordStatement = db.prepare<{
    gameId: number;
    userId: number;
    word: string;
    normalizedWord: string;
}>(`
    INSERT OR IGNORE INTO game_revealed_words (game_id, word, normalized_word)
    SELECT @gameId, @word, @normalizedWord
    WHERE EXISTS (
        SELECT 1
        FROM games
        WHERE id = @gameId
          AND user_id = @userId
          AND status = 'active'
    )
`);

const incrementRevealedWordsStatement = db.prepare<[number, number, number]>(`
    UPDATE games
    SET revealed_words_count = revealed_words_count + ?
    WHERE id = ?
      AND user_id = ?
      AND status = 'active'
`);

const recordTitleGuessStatement = db.prepare<{
    gameId: number;
    userId: number;
    guessedTitle: string;
    correct: number;
}>(`
    UPDATE games
    SET current_title_guess = @guessedTitle,
        title_guesses_count = title_guesses_count + 1,
        status = CASE WHEN @correct = 1 THEN 'won' ELSE status END,
        ended_at = CASE WHEN @correct = 1 THEN CURRENT_TIMESTAMP ELSE ended_at END,
        elapsed_seconds = CASE
            WHEN @correct = 1
            THEN CAST(strftime('%s', CURRENT_TIMESTAMP) - strftime('%s', started_at) AS INTEGER)
            ELSE elapsed_seconds
        END
    WHERE id = @gameId
      AND user_id = @userId
      AND status = 'active'
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

export function findGameDetailById(gameId: number): GameDetailRow | null {
    return findGameDetailByIdStatement.get(gameId) ?? null;
}

export function findCompletedGameDetails(): GameDetailRow[] {
    return findCompletedGameDetailsStatement.all();
}

export function findLeaderboard(): LeaderboardRow[] {
    return findLeaderboardStatement.all();
}

export function findActiveGamesByUserId(userId: number): ActiveGameRow[] {
    return findActiveGamesByUserIdStatement.all(userId);
}

export function findRevealedWordsByGameId(gameId: number): RevealedWordRow[] {
    return findRevealedWordsByGameIdStatement.all(gameId);
}

export function hasActiveGameAccess(gameId: number, userId: number): boolean {
    return findActiveGameForUserStatement.get(gameId, userId) !== undefined;
}

export function recordTitleGuess(
    gameId: number,
    userId: number,
    guessedTitle: string,
    correct: boolean,
): void {
    const result = recordTitleGuessStatement.run({
        gameId,
        userId,
        guessedTitle,
        correct: correct ? 1 : 0,
    });

    if (result.changes === 0) {
        throw new GameStorageError('Failed to record title guess');
    }
}

function insertRevealedWord(
    gameId: number,
    userId: number,
    word: string,
    normalizedWord: string,
    occurrenceCount: number,
): number {
    if (occurrenceCount === 0) {
        return 0;
    }

    const inserted = insertRevealedWordStatement.run({
        gameId,
        userId,
        word,
        normalizedWord,
    });

    if (inserted.changes > 0) {
        const incremented = incrementRevealedWordsStatement.run(
            occurrenceCount,
            gameId,
            userId,
        );

        if (incremented.changes === 0) {
            throw new GameStorageError('Failed to update revealed word count');
        }

        return occurrenceCount;
    }

    return 0;
}

const recordWordGuessTransaction = db.transaction((
    gameId: number,
    userId: number,
    word: string,
    normalizedWord: string,
    occurrenceCount: number,
): number => {
    if (incrementWordGuessesStatement.run(gameId, userId).changes === 0) {
        throw new GameStorageError('Failed to update word guess count');
    }

    return insertRevealedWord(gameId, userId, word, normalizedWord, occurrenceCount);
});

export function recordWordGuess(
    gameId: number,
    userId: number,
    word: string,
    normalizedWord: string,
    occurrenceCount: number,
): number {
    return recordWordGuessTransaction(gameId, userId, word, normalizedWord, occurrenceCount);
}

const recordRevealedWordTransaction = db.transaction(insertRevealedWord);

export function recordRevealedWord(
    gameId: number,
    userId: number,
    word: string,
    normalizedWord: string,
    occurrenceCount: number,
): number {
    return recordRevealedWordTransaction(
        gameId,
        userId,
        word,
        normalizedWord,
        occurrenceCount,
    );
}
