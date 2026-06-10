import { useEffect, useState } from 'react'
import { getApiErrorMessage } from '../api/client'
import { getLeaderboard } from '../api/games'
import { GameTablePanel } from '../components/GameTablePanel'
import type { GameTableColumn } from '../components/GameTablePanel'
import { PageHeader } from '../components/PageHeader'
import type { LeaderboardRow } from '../../../shared/games'
import styles from './LeaderboardPage.module.css'

type SortDirection = 'ascending' | 'descending'
type SortKey =
  | 'username'
  | 'gamesWon'
  | 'totalGamesPlayed'
  | 'winPercentage'
  | 'averageWinTimeSeconds'

type SortState = {
  key: SortKey
  direction: SortDirection
}

const defaultSortDirections: Record<SortKey, SortDirection> = {
  username: 'ascending',
  gamesWon: 'descending',
  totalGamesPlayed: 'descending',
  winPercentage: 'descending',
  averageWinTimeSeconds: 'ascending',
}

function formatAverageTime(totalSeconds: number | null) {
  if (totalSeconds === null) {
    return 'N/A'
  }

  const roundedSeconds = Math.round(totalSeconds)
  const minutes = Math.floor(roundedSeconds / 60)
  const seconds = roundedSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function LeaderboardPage() {
  const [players, setPlayers] = useState<LeaderboardRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [sortState, setSortState] = useState<SortState>({
    key: 'gamesWon',
    direction: 'descending',
  })

  useEffect(() => {
    let isMounted = true

    getLeaderboard()
      .then((response) => {
        if (isMounted) {
          setPlayers(response.players)
          setErrorMessage(null)
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(
            getApiErrorMessage(error, 'Could not load the leaderboard'),
          )
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  function sortBy(key: SortKey) {
    setSortState((currentSort) => {
      if (currentSort.key !== key) {
        return { key, direction: defaultSortDirections[key] }
      }

      return {
        key,
        direction:
          currentSort.direction === 'ascending' ? 'descending' : 'ascending',
      }
    })
  }

  function getSortDirection(key: SortKey) {
    return sortState.key === key ? sortState.direction : undefined
  }

  function getSortLabel(key: SortKey, label: string) {
    const currentDirection = getSortDirection(key)
    const nextDirection =
      currentDirection === 'ascending'
        ? 'descending'
        : currentDirection === 'descending'
          ? 'ascending'
          : defaultSortDirections[key]

    return `Sort ${label.toLowerCase()} in ${nextDirection} order`
  }

  const displayedPlayers = [...players].sort((firstPlayer, secondPlayer) => {
    if (sortState.key === 'username') {
      const comparison = firstPlayer.username.localeCompare(
        secondPlayer.username,
        undefined,
        { sensitivity: 'base' },
      )

      return sortState.direction === 'ascending' ? comparison : -comparison
    }

    const firstValue = firstPlayer[sortState.key]
    const secondValue = secondPlayer[sortState.key]

    if (firstValue === null) {
      return secondValue === null ? 0 : 1
    }

    if (secondValue === null) {
      return -1
    }

    const difference = firstValue - secondValue

    return sortState.direction === 'ascending' ? difference : -difference
  })

  const leaderboardColumns: GameTableColumn[] = [
    {
      label: 'Player',
      sortDirection: getSortDirection('username'),
      sortLabel: getSortLabel('username', 'Player'),
      onSort: () => sortBy('username'),
    },
    {
      label: 'Games won',
      sortDirection: getSortDirection('gamesWon'),
      sortLabel: getSortLabel('gamesWon', 'Games won'),
      onSort: () => sortBy('gamesWon'),
    },
    {
      label: 'Total games',
      sortDirection: getSortDirection('totalGamesPlayed'),
      sortLabel: getSortLabel('totalGamesPlayed', 'Total games'),
      onSort: () => sortBy('totalGamesPlayed'),
    },
    {
      label: 'Win percentage',
      sortDirection: getSortDirection('winPercentage'),
      sortLabel: getSortLabel('winPercentage', 'Win percentage'),
      onSort: () => sortBy('winPercentage'),
    },
    {
      label: 'Average win time',
      sortDirection: getSortDirection('averageWinTimeSeconds'),
      sortLabel: getSortLabel('averageWinTimeSeconds', 'Average win time'),
      onSort: () => sortBy('averageWinTimeSeconds'),
    },
  ]

  const rows = displayedPlayers.map((player) => ({
    id: player.username,
    cells: [
      player.username,
      player.gamesWon,
      player.totalGamesPlayed,
      `${player.winPercentage.toFixed(1)}%`,
      formatAverageTime(player.averageWinTimeSeconds),
    ],
  }))

  return (
    <section className={styles.leaderboardPage} aria-labelledby="leaderboard-title">
      <PageHeader title="Leaderboard" titleId="leaderboard-title" />

      <div className={styles.leaderboardLayout}>
        {isLoading ? (
          <p className={styles.stateMessage}>Loading leaderboard...</p>
        ) : null}

        {errorMessage ? (
          <p className={styles.errorMessage} role="alert">
            {errorMessage}
          </p>
        ) : null}

        {!isLoading && !errorMessage ? (
          <GameTablePanel
            title="Players"
            titleId="leaderboard-panel-title"
            columns={leaderboardColumns}
            rows={rows}
            emptyMessage="No players in the leaderboard"
          />
        ) : null}
      </div>
    </section>
  )
}
