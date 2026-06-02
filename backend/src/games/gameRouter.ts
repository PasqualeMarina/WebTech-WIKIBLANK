import { router } from 'express';
import { createGame } from './gameService.js';

export const gameRouter = router();

gameRouter.post('/create', async (req, res) => {
    if (req.session.userId === undefined) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const userId = req.session.userId;
    //todo implement logic to get game data from external wikipedia api

    try {
        const newGame = await createGame(userId);
        res.status(201).json(newGame);
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
