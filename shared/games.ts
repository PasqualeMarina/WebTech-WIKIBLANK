import type { Article } from './articles.js'
import type { GameDifficulty } from './gameDifficulties.js'
import type { AuthUser } from './users.js'

export const GAME_STATUSES = ['active', 'won'] as const

export type GameStatus = (typeof GAME_STATUSES)[number]

export type GameDetail = {
  id: number
  status: GameStatus
  article: Article
  player: AuthUser
  revealedWordsCount: number
  wordGuessesCount: number
  titleGuessesCount: number
  elapsedSeconds: number
  startedAt: string
  endedAt: string | null
}

export type StartGameRequest = {
  category?: string
  difficulty?: GameDifficulty
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
  username: string
  gamesWon: number
  totalGamesPlayed: number
  winPercentage: number
  averageWinTimeSeconds: number | null
}

export type ActiveGameSummary = {
  id: number
  category: Article['category']
  revealedWordsCount: number
  guessesCount: number
  elapsedSeconds: number
  startedAt: string
}

export type GameResponse = {
  game: GameDetail
}

export type ActiveGamesResponse = {
  games: ActiveGameSummary[]
}

export type CompletedGamesResponse = {
  games: GameDetail[]
}

export type LeaderboardResponse = {
  players: LeaderboardRow[]
}
