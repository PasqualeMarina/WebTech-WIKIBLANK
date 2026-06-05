import { Router } from 'express';
import type { Response } from 'express';
import { GameAccessDeniedError, GameContentUnavailableError, GameNotFoundError, GameStorageError, InvalidGameCategoryError } from './gameErrors.js';
import { createGame, getGameDetail, tryTitleGuess, tryWordGuess } from './gameService.js';

export const gameRouter = Router();

function sendCreateGameError(error: unknown, res: Response) {
    if (error instanceof InvalidGameCategoryError) {
        res.status(400).json({ message: error.message });
        return;
    }

    if (error instanceof GameContentUnavailableError) {
        console.error('Error loading game content:', error);
        res.status(502).json({ message: error.message });
        return;
    }

    if (error instanceof GameStorageError) {
        console.error('Error storing game:', error);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }

    console.error('Error creating game:', error);
    res.status(500).json({ message: 'Internal server error' });
}

function getRequestedCategory(body: unknown): string | null | undefined {
    if (typeof body !== 'object' || body === null || !('category' in body)) {
        return undefined;
    }

    const category = (body as { category?: unknown }).category;

    if (category === undefined) {
        return undefined;
    }

    if (typeof category !== 'string' || category.trim() === '') {
        return null;
    }

    return category.trim();
}

function getGuessedWord(body: unknown): string | null {
    if (typeof body !== 'object' || body === null || !('guessedWord' in body)) {
        return null;
    }

    const guessedWord = (body as { guessedWord?: unknown }).guessedWord;

    if (typeof guessedWord !== 'string' || guessedWord.trim() === '') {
        return null;
    }

    return guessedWord.trim();
}

function getGuessedTitle(body: unknown): string | null {
    if (typeof body !== 'object' || body === null || !('guessedTitle' in body)) {
        return null;
    }

    const guessedTitle = (body as { guessedTitle?: unknown }).guessedTitle;

    if (typeof guessedTitle !== 'string' || guessedTitle.trim() === '') {
        return null;
    }

    return guessedTitle.trim();
}

gameRouter.post('/', async (req, res) => {
    if (req.session.userId === undefined) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const userId = req.session.userId;
    const category = getRequestedCategory(req.body);

    if (category === null) {
        res.status(400).json({ message: 'Invalid game category' });
        return;
    }

    try {
        const newGame = await createGame(userId, category);
        res.status(201).json({ game: newGame });
    } catch (error) {
        sendCreateGameError(error, res);
    }
});

gameRouter.get('/:gameId', (req, res) => {
    if (req.session.userId === undefined) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const gameId = Number(req.params.gameId);

    if (!Number.isInteger(gameId) || gameId <= 0) {
        res.status(400).json({ message: 'Invalid game id' });
        return;
    }

    try {
        const game = getGameDetail(gameId, req.session.userId);
        res.json({ game });
    } catch (error) {
        if (error instanceof GameNotFoundError || error instanceof GameAccessDeniedError) {
            res.status(404).json({ message: 'Game not found' });
            return;
        }

        console.error('Error loading game:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

gameRouter.post('/:gameId/guessWord', (req, res) => {
    if(req.session.userId === undefined) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const userId = req.session.userId;
    const gameId = Number(req.params.gameId);

    if (!Number.isInteger(gameId) || gameId <= 0) {
        res.status(400).json({ message: 'Invalid game id' });
        return;
    }

    const guessedWord = getGuessedWord(req.body);

    if (guessedWord === null) {
        res.status(400).json({ message: 'Invalid guessed word' });
        return;
    }

    try {
        res.json(tryWordGuess(gameId, userId, guessedWord));
    } catch (error) {
        if (error instanceof GameAccessDeniedError) {
            res.status(404).json({ message: 'Game not found' });
            return;
        }

        console.error('Error trying word guess:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

gameRouter.post('/:gameId/guessTitle', (req, res) => {
    if(req.session.userId === undefined) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const userId = req.session.userId;
    const gameId = Number(req.params.gameId);

    if (!Number.isInteger(gameId) || gameId <= 0) {
        res.status(400).json({ message: 'Invalid game id' });
        return;
    }

    const guessedTitle = getGuessedTitle(req.body);

    if (guessedTitle === null) {
        res.status(400).json({ message: 'Invalid guessed title' });
        return;
    }

    try {
        res.json(tryTitleGuess(gameId, userId, guessedTitle));
    } catch (error) {
        if (error instanceof GameNotFoundError || error instanceof GameAccessDeniedError) {
            res.status(404).json({ message: 'Game not found' });
            return;
        }

        console.error('Error trying title guess:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
