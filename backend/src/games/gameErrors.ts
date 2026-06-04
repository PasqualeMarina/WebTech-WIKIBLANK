export class InvalidGameCategoryError extends Error {
    constructor(categoryId: string) {
        super(`Invalid game category: ${categoryId}`);
        this.name = 'InvalidGameCategoryError';
        Object.setPrototypeOf(this, InvalidGameCategoryError.prototype);
    }
}

export class GameContentUnavailableError extends Error {
    constructor(message = 'Could not load game content') {
        super(message);
        this.name = 'GameContentUnavailableError';
        Object.setPrototypeOf(this, GameContentUnavailableError.prototype);
    }
}

export class GameStorageError extends Error {
    constructor(message = 'Could not create game') {
        super(message);
        this.name = 'GameStorageError';
        Object.setPrototypeOf(this, GameStorageError.prototype);
    }
}

export class GameNotFoundError extends Error {
    constructor() {
        super('Game not found');
        this.name = 'GameNotFoundError';
        Object.setPrototypeOf(this, GameNotFoundError.prototype);
    }
}

export class GameAccessDeniedError extends Error {
    constructor() {
        super('Game not found');
        this.name = 'GameAccessDeniedError';
        Object.setPrototypeOf(this, GameAccessDeniedError.prototype);
    }
}
