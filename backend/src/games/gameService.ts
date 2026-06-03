import { createGameInDatabase } from "./gameRepository.js";
import { gameCategories } from "../../../shared/gameCategories.js";
import type { WikipediaGameResponse, GameData } from "./gameTypes.js";

const RANDOM_IN_CATEGORY_API_URL = 'https://randomincategory.toolforge.org/w/api.php';
const WIKIPEDIA_SITE = 'en.wikipedia.org';
const MAX_RANDOM_ARTICLE_ATTEMPTS = 5;
const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary/';

function getRandomCategory() {
    if (gameCategories.length === 0) {
        throw new Error('No game categories available');
    }

    const randomCategoryIndex = Math.floor(Math.random() * gameCategories.length);
    return gameCategories[randomCategoryIndex];
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

async function getRandomArticleUrl(category: string): Promise<string> {
    for (let attempt = 1; attempt <= MAX_RANDOM_ARTICLE_ATTEMPTS; attempt += 1) {
        const response = await fetch(buildRandomArticleRequestUrl(category), {
            redirect: 'manual',
        });

        if (response.status !== 302) {
            throw new Error(`Unexpected random article response status: ${response.status}`);
        }

        const articleUrl = response.headers.get('location');

        if (!articleUrl) {
            throw new Error('Random article response did not include a Location header');
        }

        if (isArticleUrl(articleUrl)) {
            return articleUrl;
        }
    }

    throw new Error(`Could not find an article URL in category "${category}"`);
}

export async function createGame(userId: number) {
    const randomCategory = getRandomCategory();
    const articleUrl = await getRandomArticleUrl(randomCategory.wikipediaCategory);
    const title = getArticleTitle(articleUrl);

    const articleResponse = (await fetch(`${WIKIPEDIA_API_URL}${encodeURIComponent(title)}`));
    const articleData = await articleResponse.json() as WikipediaGameResponse;
    const description = articleData.extract;
    const thumbnailUrl = articleData.thumbnail?.source ?? null;

    const gameData : GameData = {
        userId,
        categoryId: randomCategory.id,
        articleUrl,
        title,
        description,
        thumbnailUrl
    };

    return createGameInDatabase(gameData);
}
