import { useEffect, useState } from 'react'
import { getApiErrorMessage } from '../api/client'
import { getActiveGames } from '../api/games'
import { useAuth } from '../context/authContext'
import type { ActiveGameSummary } from '../../../shared/games'
import { formatDuration } from '../utils/formatDuration'
import { GameTablePanel } from './GameTablePanel'

const currentGameColumns = [
  'Category',
  'Started',
  'Revealed words',
  'Guesses',
  'Time',
]

function formatStartedAt(startedAt: string) {
  const normalizedStartedAt = startedAt.includes('T')
    ? startedAt
    : `${startedAt.replace(' ', 'T')}Z`

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(normalizedStartedAt))
}

type ActiveGamesLoadState = {
  userId: number
  games: ActiveGameSummary[]
  errorMessage: string | null
}

export function CurrentGamesPanel() {
  const { currentUser, isLoading: isAuthLoading } = useAuth()
  const currentUserId = currentUser?.id
  const [loadState, setLoadState] = useState<ActiveGamesLoadState | null>(null)

  useEffect(() => {
    if (isAuthLoading || currentUserId === undefined) {
      return
    }

    let isMounted = true

    getActiveGames()
      .then((response) => {
        if (isMounted) {
          setLoadState({
            userId: currentUserId,
            games: response.games,
            errorMessage: null,
          })
        }
      })
      .catch((error) => {
        if (isMounted) {
          setLoadState({
            userId: currentUserId,
            games: [],
            errorMessage: getApiErrorMessage(
              error,
              'Could not load current games',
            ),
          })
        }
      })

    return () => {
      isMounted = false
    }
  }, [currentUserId, isAuthLoading])

  const currentLoadState =
    currentUserId !== undefined && loadState?.userId === currentUserId
      ? loadState
      : null
  const games = currentLoadState?.games ?? []

  const rows = games.map((game) => ({
    id: game.id,
    to: `/games/${game.id}`,
    cells: [
      game.category.name,
      formatStartedAt(game.startedAt),
      game.revealedWordsCount,
      game.guessesCount,
      formatDuration(game.elapsedSeconds),
    ],
  }))

  let emptyMessage = 'No current games'

  if (!isAuthLoading && !currentUser) {
    emptyMessage = 'Log in to see your current games'
  } else if (isAuthLoading || currentLoadState === null) {
    emptyMessage = 'Loading current games...'
  } else if (currentLoadState.errorMessage) {
    emptyMessage = currentLoadState.errorMessage
  }

  return (
    <GameTablePanel
      title="Current games"
      titleId="current-games-title"
      columns={currentGameColumns}
      rows={rows}
      emptyMessage={emptyMessage}
    />
  )
}
