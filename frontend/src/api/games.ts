import { apiClient } from './client'
import type {
  GameResponse,
  GuessResponse,
  StartGameRequest,
  TitleGuessResponse,
  CompletedGamesResponse,
  LeaderboardResponse,
  ActiveGamesResponse,
} from '../../../shared/games'

export async function createGame(
  data: StartGameRequest = {},
): Promise<GameResponse> {
  const response = await apiClient.post<GameResponse>('/games', data)
  return response.data
}

export async function getGame(gameId: string | number): Promise<GameResponse> {
  const response = await apiClient.get<GameResponse>(`/games/${gameId}`)
  return response.data
}

export async function guessWord(
  gameId: string | number,
  guessedWord: string,
): Promise<GuessResponse> {
  const response = await apiClient.post<GuessResponse>(`/games/${gameId}/guessWord`, { guessedWord })
  return response.data
}

export async function guessTitle(
  gameId: string | number,
  guessedTitle: string,
): Promise<TitleGuessResponse> {
  const response = await apiClient.post<TitleGuessResponse>(
    `/games/${gameId}/guessTitle`,
    { guessedTitle },
  )
  return response.data
}

export async function getCompletedGames(): Promise<CompletedGamesResponse> {
  const response = await apiClient.get<CompletedGamesResponse>(
    '/games/completedGames',
  )

  return response.data
}

export async function getActiveGames(): Promise<ActiveGamesResponse> {
  const response = await apiClient.get<ActiveGamesResponse>(
    '/games/activeGames',
  )

  return response.data
}

export async function getLeaderboard(): Promise<LeaderboardResponse> {
  const response = await apiClient.get<LeaderboardResponse>(
    '/games/leaderboard',
  )

  return response.data
}
