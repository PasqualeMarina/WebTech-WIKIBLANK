import { Router } from 'express';
import type { Response } from 'express';
import { GameAccessDeniedError, GameContentUnavailableError, GameNotFoundError, GameStorageError, InvalidGameCategoryError } from './gameErrors.js';
import { createGame, getGameDetail } from './gameService.js';

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
