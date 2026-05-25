import type { Article } from './article'
import type { User } from './user'

export type GameStatus = 'active' | 'won' | 'abandoned'

export type GameDetail = {
  id: number
  status: GameStatus
  article: Article
  player: User
  currentTitleGuess: string | null
  revealedWordsCount: number
  wordGuessesCount: number
  titleGuessesCount: number
  elapsedSeconds: number
  startedAt: string
  endedAt: string | null
}

export type StartGameRequest = {
  categoryId?: number
}

export type WordGuessRequest = {
  word: string
}

export type TitleGuessRequest = {
  title: string
}

export type GuessResponse = {
  game: GameDetail
  correct: boolean
  revealedWordsCount: number
}

export type LeaderboardRow = {
  userId: number
  username: string
  completedGames: number
  averageTimeSeconds: number
}
