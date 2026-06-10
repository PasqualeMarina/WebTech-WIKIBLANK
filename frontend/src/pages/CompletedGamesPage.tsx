import { useEffect, useState } from 'react'
import { getApiErrorMessage } from '../api/client'
import { getCompletedGames } from '../api/games'
import { GameTablePanel } from '../components/GameTablePanel'
import { PageHeader } from '../components/PageHeader'
import type { GameDetail } from '../../../shared/games'
import styles from './CompletedGamesPage.module.css'

const completedGamesColumns = [
  'Article title',
  'Category',
  'Username',
  'Word guesses',
  'Title guesses',
  'Elapsed time',
]

function formatElapsedTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function CompletedGamesPage() {
  const [games, setGames] = useState<GameDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    getCompletedGames()
      .then((response) => {
        if (isMounted) {
          setGames(response.games)
          setErrorMessage(null)
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(
            getApiErrorMessage(error, 'Could not load completed games'),
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

  const rows = games.map((game) => ({
    id: game.id,
    to: `/games/${game.id}`,
    cells: [
      game.article.title ?? 'Unknown article',
      game.article.category.name,
      game.player.username,
      game.wordGuessesCount,
      game.titleGuessesCount,
      formatElapsedTime(game.elapsedSeconds),
    ],
  }))

  return (
    <section
      className={styles.completedGamesPage}
      aria-labelledby="completed-games-title"
    >
      <PageHeader title="Completed games" titleId="completed-games-title" />

      <div className={styles.completedGamesLayout}>
        {isLoading ? (
          <p className={styles.stateMessage}>Loading completed games...</p>
        ) : null}

        {errorMessage ? (
          <p className={styles.errorMessage} role="alert">
            {errorMessage}
          </p>
        ) : null}

        {!isLoading && !errorMessage ? (
          <GameTablePanel
            title="Game history"
            titleId="completed-games-panel-title"
            columns={completedGamesColumns}
            rows={rows}
            emptyMessage="No completed games"
          />
        ) : null}
      </div>
    </section>
  )
}
