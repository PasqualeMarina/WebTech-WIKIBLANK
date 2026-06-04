import { createGameInDatabase, findGameDetailById, findRevealedWordsByGameId } from "./gameRepository.js";
import { gameCategories } from "../../../shared/gameCategories.js";
import { GameAccessDeniedError, GameContentUnavailableError, GameNotFoundError, GameStorageError, InvalidGameCategoryError } from "./gameErrors.js";
import type { WikipediaGameResponse, GameData } from "./gameTypes.js";
import type { ArticleParagraph } from "../../../shared/articles.js";
import type { GameDetail } from "../../../shared/games.js";

const RANDOM_IN_CATEGORY_API_URL = 'https://randomincategory.toolforge.org/w/api.php';
const WIKIPEDIA_SITE = 'en.wikipedia.org';
const MAX_RANDOM_ARTICLE_ATTEMPTS = 5;
const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary/';

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

    return (titleParam ?? decodeURIComponent(titlePath)).replaceAll('_', ' ');
}

function buildArticleParagraphs(content: string, revealedWords: Set<string>): ArticleParagraph[] {
    return content
        .split(/\n+/)
        .map((paragraph) => paragraph.trim())
        .filter((paragraph) => paragraph.length > 0)
        .map((paragraph) =>
            paragraph.split(/\s+/).map((word) => {
                const normalizedWord = normalizeWord(word);

                return {
                    text: word,
                    revealed: normalizedWord.length === 0 || revealedWords.has(normalizedWord),
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
    const articleUrl = await getRandomArticleUrl(category.wikipediaCategory);
    const title = getArticleTitle(articleUrl);

    let articleResponse: Response;

    try {
        articleResponse = await fetch(`${WIKIPEDIA_API_URL}${encodeURIComponent(title)}`);
    } catch {
        throw new GameContentUnavailableError('Could not reach Wikipedia summary service');
    }
    
    if (!articleResponse.ok) {
        throw new GameContentUnavailableError(`Wikipedia summary request failed: ${articleResponse.status}`);
    }
    
    let articleData: WikipediaGameResponse;

    try {
        articleData = await articleResponse.json() as WikipediaGameResponse;
    } catch {
        throw new GameContentUnavailableError('Wikipedia summary response was not valid JSON');
    }

    const description = articleData.extract;

    if (!description) {
        throw new GameContentUnavailableError('Wikipedia summary did not include article content');
    }

    const thumbnailUrl = articleData.thumbnail?.source ?? null;

    const gameData : GameData = {
        userId,
        categoryId: category.id,
        articleUrl,
        title,
        description,
        thumbnailUrl
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

export function getGameDetail(gameId: number, userId: number): GameDetail {
    const game = findGameDetailById(gameId);

    if (!game) {
        throw new GameNotFoundError();
    }

    if (game.status !== 'active' || game.user_id !== userId) {
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
            title: null,
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
