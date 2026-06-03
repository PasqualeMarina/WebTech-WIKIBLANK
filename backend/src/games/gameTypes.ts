export type WikipediaGameResponse = {
    title: string;
    extract: string;
    thumbnail?: {
        source: string;
        width?: number;
        height?: number;
    };
};

export type GameData = {
    userId: number;
    categoryId: string;
    articleUrl: string;
    title: string;
    description: string;
    thumbnailUrl: string | null;
};

export type CreatedGame = {
    id: number;
    user_id: number;
    article_id: number;
    status: 'active' | 'won' | 'abandoned';
    current_title_guess: string | null;
    revealed_words_count: number;
    word_guesses_count: number;
    title_guesses_count: number;
    started_at: string;
    ended_at: string | null;
    elapsed_seconds: number;
};
