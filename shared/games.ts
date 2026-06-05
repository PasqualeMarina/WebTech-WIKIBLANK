import type { Article } from './articles.js'
import type { AuthUser } from './users.js'

export const GAME_STATUSES = ['active', 'won'] as const

export type GameStatus = (typeof GAME_STATUSES)[number]

export type GameDetail = {
  id: number
  status: GameStatus
  article: Article
  player: AuthUser
  currentTitleGuess: string | null
  revealedWordsCount: number
  wordGuessesCount: number
  titleGuessesCount: number
  elapsedSeconds: number
  startedAt: string
  endedAt: string | null
}

export type StartGameRequest = {
  category?: string
}

export type WordGuessRequest = {
  guessedWord: string
}

export type TitleGuessRequest = {
  guessedTitle: string
}

export type GuessResponse = {
  game: GameDetail
  correct: boolean
  revealedWordsCount: number
}

export type TitleGuessResponse = {
  game: GameDetail
  correct: boolean
}

export type LeaderboardRow = {
  userId: number
  username: string
  completedGames: number
  averageTimeSeconds: number
}

export type GameResponse = {
  game: GameDetail
}
