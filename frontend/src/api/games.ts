import { apiClient } from './client'
import type { GameResponse, StartGameRequest } from '../../../shared/games'

export async function createGame(
  data: StartGameRequest = {},
): Promise<GameResponse> {
  const response = await apiClient.post<GameResponse>('/games', data)
  return response.data
}
