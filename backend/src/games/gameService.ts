import { createGameInDatabase, findActiveArticleTitlesByUserId, findActiveGamesByUserId, findCompletedGameDetails, findGameDetailById, findLeaderboard, findRevealedWordsByGameId, hasActiveGameAccess, recordTitleGuess, recordWordGuess } from "./gameRepository.js";
import { gameCategories } from "../../../shared/gameCategories.js";
import { ActiveArticleConflictError, GameAccessDeniedError, GameContentUnavailableError, GameNotFoundError, GameStorageError, InvalidGameCategoryError, InvalidGameDifficultyError } from "./gameErrors.js";
import type { WikipediaCategoryMembersResponse, WikipediaSummaryResponse, GameData, GameDetailRow, InitialRevealedWord, LeaderboardRow } from "./gameTypes.js";
import type { ArticleParagraph } from "../../../shared/articles.js";
import type { ActiveGameSummary, GameDetail, GuessResponse, TitleGuessResponse } from "../../../shared/games.js";
import { DEFAULT_GAME_DIFFICULTY, isGameDifficulty } from "../../../shared/gameDifficulties.js";
import type { GameDifficulty } from "../../../shared/gameDifficulties.js";
import { commonWords } from "./commonWords.js";

const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';
const WIKIPEDIA_REST_API_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
const MAX_CATEGORY_MEMBERS = 500;
const MAX_SUITABLE_ARTICLE_ATTEMPTS = 20;
const MAX_WIKIPEDIA_REQUEST_ATTEMPTS = 3;
const MAX_RETRY_DELAY_MS = 30_000;
const EXTERNAL_REQUEST_TIMEOUT_MS = 10_000;
const MIN_ARTICLE_WORDS = 30;
const MAX_ARTICLE_WORDS = 200;
const MAX_ARTICLE_CONTENT_BYTES = 15_000;
const EXTERNAL_REQUEST_HEADERS = {
    'User-Agent': 'WikiBlank/1.0 (educational web application)',
};

const DIFFICULTY_REVEAL_PERCENTAGES: Record<GameDifficulty, number> = {
    hard: 0.15,
    medium: 0.3,
    easy: 0.5,
    very_easy: 0.7,
};

function normalizeWord(word: string): string {
    return word.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
}

function getDifficulty(difficulty: string | undefined): GameDifficulty {
    if (difficulty === undefined) {
        return DEFAULT_GAME_DIFFICULTY;
    }

    if (!isGameDifficulty(difficulty)) {
        throw new InvalidGameDifficultyError(difficulty);
    }

    return difficulty;
}

function getTitleWordLengths(title: string): number[] {
    return title
        .trim()
        .split(/\s+/)
        .map((word) => word.match(/[\p{L}\p{N}]/gu)?.length ?? 0)
        .filter((wordLength) => wordLength > 0);
}

function getProtectedTitleWords(title: string): Set<string> {
    const protectedWords = new Set<string>();
    const normalizedTitle = normalizeWord(title);

    if (normalizedTitle.length > 0) {
        protectedWords.add(normalizedTitle);
    }

    for (const titlePart of title.match(/[\p{L}\p{N}]+/gu) ?? []) {
        const normalizedTitlePart = normalizeWord(titlePart);

        if (normalizedTitlePart.length > 0) {
            protectedWords.add(normalizedTitlePart);
        }
    }

    for (const titleWord of title.split(/\s+/)) {
        const normalizedTitleWord = normalizeWord(titleWord);

        if (normalizedTitleWord.length > 0) {
            protectedWords.add(normalizedTitleWord);
        }
    }

    return protectedWords;
}

function shuffle<T>(values: T[]): T[] {
    const shuffledValues = [...values];

    for (let index = shuffledValues.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffledValues[index], shuffledValues[randomIndex]] = [
            shuffledValues[randomIndex],
            shuffledValues[index],
        ];
    }

    return shuffledValues;
}

function getInitialRevealedWords(
    content: string,
    title: string,
    difficulty: GameDifficulty,
): InitialRevealedWord[] {
    const protectedTitleWords = getProtectedTitleWords(title);
    const candidates = new Map<string, InitialRevealedWord>();

    for (const word of content.split(/\s+/)) {
        const normalizedWord = normalizeWord(word);

        if (
            normalizedWord.length === 0
            || commonWords.has(normalizedWord)
            || protectedTitleWords.has(normalizedWord)
        ) {
            continue;
        }

        const existingCandidate = candidates.get(normalizedWord);

        if (existingCandidate) {
            existingCandidate.occurrenceCount += 1;
            continue;
        }

        candidates.set(normalizedWord, {
            word,
            normalizedWord,
            occurrenceCount: 1,
        });
    }

    const revealCount = Math.round(
        candidates.size * DIFFICULTY_REVEAL_PERCENTAGES[difficulty],
    );

    return shuffle([...candidates.values()]).slice(0, revealCount);
}

function getRandomCategory() {
    if (gameCategories.length === 0) {
        throw new GameStorageError('No game categories available');
    }

    const randomCategoryIndex = Math.floor(Math.random() * gameCategories.length);
    return gameCategories[randomCategoryIndex];
}

function getCategory(categoryId: string) {
    const category = gameCategories.find((gameCategory) => gameCategory.id === categoryId);

    if (!category) {
        throw new InvalidGameCategoryError(categoryId);
    }

    return category;
}

function buildCategoryMembersRequestUrl(category: string): string {
    const url = new URL(WIKIPEDIA_API_URL);

    url.search = new URLSearchParams({
        action: 'query',
        list: 'categorymembers',
        cmtitle: `Category:${category}`,
        cmlimit: String(MAX_CATEGORY_MEMBERS),
        cmnamespace: '0',
        format: 'json',
        origin: '*',
    }).toString();

    return url.toString();
}

function buildArticleSummaryRequestUrl(title: string): string {
    return `${WIKIPEDIA_REST_API_URL}${encodeURIComponent(title)}`;
}

function isArticleLengthAllowed(content: string): boolean {
    const wordCount = content.match(/[\p{L}\p{N}]+/gu)?.length ?? 0;

    return (
        wordCount >= MIN_ARTICLE_WORDS
        && wordCount <= MAX_ARTICLE_WORDS
        && Buffer.byteLength(content, 'utf8') <= MAX_ARTICLE_CONTENT_BYTES
    );
}

function wait(delayMs: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, delayMs);
    });
}

function getRetryDelayMs(response: Response, attempt: number): number {
    const retryAfterSeconds = Number(response.headers.get('retry-after'));

    if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
        return retryAfterSeconds * 1000;
    }

    return attempt * 1000;
}

async function getWikipediaResponse(url: string): Promise<Response> {
    for (let attempt = 1; attempt <= MAX_WIKIPEDIA_REQUEST_ATTEMPTS; attempt += 1) {
        let response: Response;

        try {
            response = await fetch(url, {
                headers: EXTERNAL_REQUEST_HEADERS,
                signal: AbortSignal.timeout(EXTERNAL_REQUEST_TIMEOUT_MS),
            });
        } catch {
            throw new GameContentUnavailableError('Could not reach Wikipedia article service');
        }

        if (response.status !== 429 || attempt === MAX_WIKIPEDIA_REQUEST_ATTEMPTS) {
            return response;
        }

        const retryDelayMs = getRetryDelayMs(response, attempt);

        if (retryDelayMs > MAX_RETRY_DELAY_MS) {
            return response;
        }

        await wait(retryDelayMs);
    }

    throw new GameContentUnavailableError('Could not reach Wikipedia article service');
}

function normalizeArticleTitle(title: string): string {
    return title.trim().toLocaleLowerCase('en-US');
}

function takeRandomTitle(titles: string[]): string {
    const randomIndex = Math.floor(Math.random() * titles.length);
    const [title] = titles.splice(randomIndex, 1);

    return title;
}

function buildArticleParagraphs(content: string, revealedWords: Set<string>): ArticleParagraph[] {
    return content
        .split(/\n+/)
        .map((paragraph) => paragraph.trim())
        .filter((paragraph) => paragraph.length > 0)
        .map((paragraph) =>
            paragraph.split(/\s+/).map((word) => {
                const normalizedWord = normalizeWord(word);
                const revealed = normalizedWord.length === 0 || revealedWords.has(normalizedWord) || commonWords.has(normalizedWord);

                if (revealed) {
                    return {
                        text: word,
                        revealed: true,
                    };
                }

                return {
                    length: Array.from(word).length,
                    revealed: false,
                };
            }),
        );
}

async function getCategoryArticleTitles(category: string): Promise<string[]> {
    const response = await getWikipediaResponse(buildCategoryMembersRequestUrl(category));

    if (!response.ok) {
        throw new GameContentUnavailableError(
            `Wikipedia category request failed: ${response.status}`,
        );
    }

    let categoryData: WikipediaCategoryMembersResponse;

    try {
        categoryData = await response.json() as WikipediaCategoryMembersResponse;
    } catch {
        throw new GameContentUnavailableError('Wikipedia category response was not valid JSON');
    }

    const titles = categoryData.query?.categorymembers?.map((article) => article.title) ?? [];

    if (titles.length === 0) {
        throw new GameContentUnavailableError(`No articles found in category "${category}"`);
    }

    return titles;
}

export async function createGame(
    userId: number,
    categoryId?: string,
    requestedDifficulty?: string,
) {
    const category = categoryId ? getCategory(categoryId) : getRandomCategory();
    const difficulty = getDifficulty(requestedDifficulty);
    const activeArticleTitles = new Set(
        findActiveArticleTitlesByUserId(userId).map(normalizeArticleTitle),
    );
    const availableArticleTitles = (await getCategoryArticleTitles(category.wikipediaCategory))
        .filter((title) => !activeArticleTitles.has(normalizeArticleTitle(title)));

    for (
        let attempt = 1;
        attempt <= MAX_SUITABLE_ARTICLE_ATTEMPTS && availableArticleTitles.length > 0;
        attempt += 1
    ) {
        const selectedTitle = takeRandomTitle(availableArticleTitles);
        const articleResponse = await getWikipediaResponse(
            buildArticleSummaryRequestUrl(selectedTitle),
        );

        if (!articleResponse.ok) {
            if (articleResponse.status === 404) {
                continue;
            }

            throw new GameContentUnavailableError(
                `Wikipedia article request failed: ${articleResponse.status}`,
            );
        }

        let articleData: WikipediaSummaryResponse;

        try {
            articleData = await articleResponse.json() as WikipediaSummaryResponse;
        } catch {
            throw new GameContentUnavailableError('Wikipedia article response was not valid JSON');
        }

        const title = articleData.title?.trim();
        const description = articleData.extract?.trim();
        const articleUrl = articleData.content_urls?.desktop?.page;

        if (
            articleData.type !== 'standard' ||
            !title ||
            !description ||
            !articleUrl ||
            !isArticleLengthAllowed(description)
        ) {
            continue;
        }

        const gameData : GameData = {
            userId,
            categoryId: category.id,
            articleUrl,
            title,
            description,
            thumbnailUrl: articleData.thumbnail?.source ?? null,
            initialRevealedWords: getInitialRevealedWords(
                description,
                title,
                difficulty,
            ),
        };

        try {
            return createGameInDatabase(gameData);
        } catch (error) {
            if (error instanceof ActiveArticleConflictError) {
                continue;
            }

            if (error instanceof GameStorageError) {
                throw error;
            }

            throw new GameStorageError();
        }
    }

    throw new GameContentUnavailableError(
        `Could not find an available article between ${MIN_ARTICLE_WORDS} and ${MAX_ARTICLE_WORDS} words`,
    );
}

function buildGameDetail(game: GameDetailRow): GameDetail {
    const revealedWords = new Set(
        findRevealedWordsByGameId(game.id).map((word) => word.normalized_word),
    );

    return {
        id: game.id,
        status: game.status,
        article: {
            id: game.article_id,
            title: game.status === 'won' ? game.article_title : null,
            titleWordLengths: getTitleWordLengths(game.article_title),
            category: {
                id: game.category_id,
                name: game.category_name,
            },
            paragraphs: buildArticleParagraphs(game.article_content, revealedWords),
        },
        player: {
            id: game.user_id,
            username: game.username,
        },
        revealedWordsCount: game.revealed_words_count,
        wordGuessesCount: game.word_guesses_count,
        titleGuessesCount: game.title_guesses_count,
        elapsedSeconds: game.elapsed_seconds,
        startedAt: game.started_at,
        endedAt: game.ended_at,
    };
}

export function getGameDetail(gameId: number, userId?: number): GameDetail {
    const game = findGameDetailById(gameId);

    if (!game) {
        throw new GameNotFoundError();
    }

    if (game.status !== 'won' && game.user_id !== userId) {
        throw new GameAccessDeniedError();
    }

    return buildGameDetail(game);
}

export function getCompletedGames(): GameDetail[] {
    return findCompletedGameDetails().map(buildGameDetail);
}

export function getActiveGames(userId: number): ActiveGameSummary[] {
    return findActiveGamesByUserId(userId).map((game) => ({
        id: game.id,
        category: {
            id: game.category_id,
            name: game.category_name,
        },
        revealedWordsCount: game.revealed_words_count,
        guessesCount: game.word_guesses_count + game.title_guesses_count,
        elapsedSeconds: game.elapsed_seconds,
        startedAt: game.started_at,
    }));
}

export function getLeaderboard(): LeaderboardRow[] {
    return findLeaderboard();
}

export function assertActiveGameAccess(gameId: number, userId: number): void {
    if (!hasActiveGameAccess(gameId, userId)) {
        throw new GameAccessDeniedError();
    }
}

export function tryWordGuess(gameId: number, userId: number, guessedWord: string): GuessResponse {
    const normalizedGuess = normalizeWord(guessedWord);

    if (normalizedGuess.length === 0) {
        throw new GameAccessDeniedError();
    }

    assertActiveGameAccess(gameId, userId);

    const game = findGameDetailById(gameId);

    if (!game) {
        throw new GameNotFoundError();
    }

    let occurrenceCount = 0;

    for (const word of game.article_content.split(/\s+/)) {
        if (normalizeWord(word) === normalizedGuess) {
            occurrenceCount += 1;
        }
    }

    const correct = occurrenceCount > 0;
    const revealCount = correct && !commonWords.has(normalizedGuess) ? occurrenceCount : 0;

    const revealedWordsCount = recordWordGuess(
        gameId,
        userId,
        guessedWord.trim(),
        normalizedGuess,
        revealCount,
    );

    return {
        game: getGameDetail(gameId, userId),
        correct,
        revealedWordsCount,
    };
}

export function tryTitleGuess(gameId: number, userId: number, guessedTitle: string): TitleGuessResponse {
    const normalizedGuess = normalizeWord(guessedTitle);

    if (normalizedGuess.length === 0) {
        throw new GameAccessDeniedError();
    }

    assertActiveGameAccess(gameId, userId);

    const game = findGameDetailById(gameId);

    if (!game) {
        throw new GameNotFoundError();
    }

    const correct = normalizedGuess === normalizeWord(game.article_title);
    recordTitleGuess(gameId, userId, correct);

    return {
        game: getGameDetail(gameId, userId),
        correct,
    };
}
