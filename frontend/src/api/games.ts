import { apiClient } from './client'
import type { GameResponse, GuessResponse, StartGameRequest } from '../../../shared/games'

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