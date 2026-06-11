export type WikipediaCategoryMembersResponse = {
    query?: {
        categorymembers?: Array<{
            pageid: number;
            ns: number;
            title: string;
        }>;
    };
};

export type WikipediaSummaryResponse = {
    type?: string;
    title?: string;
    extract?: string;
    thumbnail?: {
        source: string;
        width?: number;
        height?: number;
    };
    content_urls?: {
        desktop?: {
            page?: string;
        };
    };
};

export type InitialRevealedWord = {
    word: string;
    normalizedWord: string;
    occurrenceCount: number;
};

export type GameData = {
    userId: number;
    categoryId: string;
    articleUrl: string;
    title: string;
    description: string;
    thumbnailUrl: string | null;
    initialRevealedWords: InitialRevealedWord[];
};

export type CreatedGame = {
    id: number;
    user_id: number;
    article_id: number;
    status: 'active' | 'won';
    revealed_words_count: number;
    word_guesses_count: number;
    title_guesses_count: number;
    started_at: string;
    ended_at: string | null;
    elapsed_seconds: number;
};

export type GameDetailRow = CreatedGame & {
    article_title: string;
    article_content: string;
    category_id: number;
    category_name: string;
    user_id: number;
    username: string;
};

export type ActiveGameRow = {
    id: number;
    category_id: number;
    category_name: string;
    revealed_words_count: number;
    word_guesses_count: number;
    title_guesses_count: number;
    elapsed_seconds: number;
    started_at: string;
};

export type { LeaderboardRow } from '../../../shared/games.js';

export type RevealedWordRow = {
    normalized_word: string;
};
