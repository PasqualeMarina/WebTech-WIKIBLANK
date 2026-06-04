import { Router } from 'express';
import type { Response } from 'express';
import { GameContentUnavailableError, GameStorageError, InvalidGameCategoryError } from './gameErrors.js';
import { createGame } from './gameService.js';

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

gameRouter.post('/', async (req, res) => {
    if (req.session.userId === undefined) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const userId = req.session.userId;
    const category = req.body?.category;

    if (category !== undefined && (typeof category !== 'string' || category.trim() === '')) {
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
