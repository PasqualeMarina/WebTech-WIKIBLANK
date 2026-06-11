export const GAME_DIFFICULTIES = [
  'hard',
  'medium',
  'easy',
  'very_easy',
] as const

export type GameDifficulty = (typeof GAME_DIFFICULTIES)[number]

export const DEFAULT_GAME_DIFFICULTY: GameDifficulty = 'medium'

export const gameDifficultyOptions: Array<{
  id: GameDifficulty
  label: string
  description: string
}> = [
  {
    id: 'hard',
    label: 'Hard',
    description: 'Reveals 15% of the extra words.',
  },
  {
    id: 'medium',
    label: 'Medium',
    description: 'Reveals 30% of the extra words.',
  },
  {
    id: 'easy',
    label: 'Easy',
    description: 'Reveals 50% of the extra words.',
  },
  {
    id: 'very_easy',
    label: 'Very Easy',
    description: 'Reveals 70% of the extra words.',
  },
]

export function isGameDifficulty(value: unknown): value is GameDifficulty {
  return (
    typeof value === 'string'
    && GAME_DIFFICULTIES.some((difficulty) => difficulty === value)
  )
}
