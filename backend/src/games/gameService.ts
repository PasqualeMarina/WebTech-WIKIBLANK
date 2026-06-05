import { createGameInDatabase, findGameDetailById, findRevealedWordsByGameId, hasActiveGameAccess, recordTitleGuess, recordWordGuess } from "./gameRepository.js";
import { gameCategories } from "../../../shared/gameCategories.js";
import { GameAccessDeniedError, GameContentUnavailableError, GameNotFoundError, GameStorageError, InvalidGameCategoryError } from "./gameErrors.js";
import type { WikipediaGameResponse, GameData } from "./gameTypes.js";
import type { ArticleParagraph } from "../../../shared/articles.js";
import type { GameDetail, GuessResponse, TitleGuessResponse } from "../../../shared/games.js";
import { commonWords } from "./commonWords.js";

const RANDOM_IN_CATEGORY_API_URL = 'https://randomincategory.toolforge.org/w/api.php';
const WIKIPEDIA_SITE = 'en.wikipedia.org';
const MAX_RANDOM_ARTICLE_ATTEMPTS = 30;
const MAX_SUITABLE_ARTICLE_ATTEMPTS = 10;
const MAX_WIKIPEDIA_REQUEST_ATTEMPTS = 3;
const MAX_RETRY_DELAY_MS = 30_000;
const MIN_ARTICLE_SIZE_BYTES = 1_000;
const MAX_ARTICLE_SIZE_BYTES = 30_000;
const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';
const EXTERNAL_REQUEST_HEADERS = {
    'User-Agent': 'WikiBlank/1.0 (educational web application)',
};

function normalizeWord(word: string): string {
    return word.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
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

function buildRandomArticleRequestUrl(category: string): string {
    const url = new URL(RANDOM_IN_CATEGORY_API_URL);

    url.searchParams.set('site', WIKIPEDIA_SITE);
    url.searchParams.set('category', category);

    return url.toString();
}

function isArticleUrl(articleUrl: string): boolean {
    const parsedArticleUrl = new URL(articleUrl);
    const title = parsedArticleUrl.searchParams.get('title');
    const articlePath = title ?? decodeURIComponent(parsedArticleUrl.pathname);

    return !articlePath.includes(':');
}

function getArticleTitle(articleUrl: string): string {
    const parsedArticleUrl = new URL(articleUrl);
    const titleParam = parsedArticleUrl.searchParams.get('title');
    const titlePath = parsedArticleUrl.pathname.startsWith('/wiki/')
        ? parsedArticleUrl.pathname.slice('/wiki/'.length)
        : parsedArticleUrl.pathname.slice(1);
    const title = (titleParam ?? decodeURIComponent(titlePath)).replaceAll('_', ' ');

    if (!/[ÃÂ]/.test(title)) {
        return title;
    }

    const repairedTitle = Buffer.from(title, 'latin1').toString('utf8');
    return repairedTitle.includes('\uFFFD') ? title : repairedTitle;
}

function buildArticleRequestUrl(title: string): string {
    const url = new URL(WIKIPEDIA_API_URL);

    url.search = new URLSearchParams({
        action: 'query',
        prop: 'extracts|pageimages|info',
        titles: title,
        exintro: '1',
        explaintext: '1',
        piprop: 'thumbnail',
        pithumbsize: '600',
        redirects: '1',
        format: 'json',
        formatversion: '2',
    }).toString();

    return url.toString();
}

function isArticleSizeAllowed(articleSize: number | undefined): boolean {
    return (
        articleSize !== undefined &&
        articleSize >= MIN_ARTICLE_SIZE_BYTES &&
        articleSize <= MAX_ARTICLE_SIZE_BYTES
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

async function getWikipediaArticle(title: string): Promise<Response> {
    for (let attempt = 1; attempt <= MAX_WIKIPEDIA_REQUEST_ATTEMPTS; attempt += 1) {
        let response: Response;

        try {
            response = await fetch(buildArticleRequestUrl(title), {
                headers: EXTERNAL_REQUEST_HEADERS,
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

async function getRandomArticleUrl(category: string): Promise<string> {
    for (let attempt = 1; attempt <= MAX_RANDOM_ARTICLE_ATTEMPTS; attempt += 1) {
        let response: Response;

        try {
            response = await fetch(buildRandomArticleRequestUrl(category), {
                redirect: 'manual',
                headers: EXTERNAL_REQUEST_HEADERS,
            });
        } catch {
            throw new GameContentUnavailableError('Could not reach random article service');
        }

        if (response.status !== 302) {
            throw new GameContentUnavailableError(`Unexpected random article response status: ${response.status}`);
        }

        const articleUrl = response.headers.get('location');

        if (!articleUrl) {
            throw new GameContentUnavailableError('Random article response did not include a Location header');
        }

        if (isArticleUrl(articleUrl)) {
            return articleUrl;
        }
    }

    throw new GameContentUnavailableError(`Could not find an article URL in category "${category}"`);
}

export async function createGame(userId: number, categoryId?: string) {
    const category = categoryId ? getCategory(categoryId) : getRandomCategory();

    for (let attempt = 1; attempt <= MAX_SUITABLE_ARTICLE_ATTEMPTS; attempt += 1) {
        const articleUrl = await getRandomArticleUrl(category.wikipediaCategory);
        const title = getArticleTitle(articleUrl);
        const articleResponse = await getWikipediaArticle(title);

        if (!articleResponse.ok) {
            throw new GameContentUnavailableError(`Wikipedia article request failed: ${articleResponse.status}`);
        }

        let articleData: WikipediaGameResponse;

        try {
            articleData = await articleResponse.json() as WikipediaGameResponse;
        } catch {
            throw new GameContentUnavailableError('Wikipedia article response was not valid JSON');
        }

        const articlePage = articleData.query?.pages?.[0];
        const description = articlePage?.extract?.trim();

        if (
            !articlePage ||
            articlePage.missing ||
            !description ||
            !isArticleSizeAllowed(articlePage.length)
        ) {
            continue;
        }

        const gameData : GameData = {
            userId,
            categoryId: category.id,
            articleUrl,
            title: articlePage.title,
            description,
            thumbnailUrl: articlePage.thumbnail?.source ?? null
        };

        try {
            return createGameInDatabase(gameData);
        } catch (error) {
            if (error instanceof GameStorageError) {
                throw error;
            }

            throw new GameStorageError();
        }
    }

    throw new GameContentUnavailableError(
        `Could not find an article between ${MIN_ARTICLE_SIZE_BYTES} and ${MAX_ARTICLE_SIZE_BYTES} bytes`,
    );
}

export function getGameDetail(gameId: number, userId: number): GameDetail {
    const game = findGameDetailById(gameId);

    if (!game) {
        throw new GameNotFoundError();
    }

    if (game.user_id !== userId) {
        throw new GameAccessDeniedError();
    }

    const revealedWords = new Set(
        findRevealedWordsByGameId(gameId).map((word) => word.normalized_word),
    );


    return {
        id: game.id,
        status: game.status,
        article: {
            id: game.article_id,
            title: game.status === 'won' ? game.article_title : null,
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
        currentTitleGuess: game.current_title_guess,
        revealedWordsCount: game.revealed_words_count,
        wordGuessesCount: game.word_guesses_count,
        titleGuessesCount: game.title_guesses_count,
        elapsedSeconds: game.elapsed_seconds,
        startedAt: game.started_at,
        endedAt: game.ended_at,
    };
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

    const updatedGame = getGameDetail(gameId, userId);

    return {
        game: updatedGame,
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
    recordTitleGuess(gameId, userId, guessedTitle.trim(), correct);

    return {
        game: getGameDetail(gameId, userId),
        correct,
    };
}
