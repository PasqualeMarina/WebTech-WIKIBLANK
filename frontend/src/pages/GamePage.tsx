import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { getGame, guessTitle, guessWord } from '../api/games'
import { GameTryPanel } from '../components/GameTryPanel'
import { PageHeader } from '../components/PageHeader'
import type { GameDetail } from '../../../shared/games'
import styles from './GamePage.module.css'

function formatElapsedTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function getStatusLabel(status: GameDetail['status']) {
  if (status === 'won') {
    return 'Won'
  }

  return 'Active'
}

export function GamePage() {
  const { gameId } = useParams()
  const [game, setGame] = useState<GameDetail | null>(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(gameId))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const visibleErrorMessage = gameId ? errorMessage : 'Game not found'

  useEffect(() => {
    let isMounted = true

    if (!gameId) {
      return
    }

    getGame(gameId)
      .then((response) => {
        if (isMounted) {
          setGame(response.game)
          setErrorMessage(null)
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(getApiErrorMessage(error, 'Could not load game'))
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
  }, [gameId])

  async function handleGuessWord(word: string) {
    if (!gameId) {
      throw new Error('Game not found')
    }

    try {
      const response = await guessWord(gameId, word)
      setGame(response.game)
      return response
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not guess word'), {
        cause: error,
      })
    }
  }

  async function handleGuessTitle(title: string) {
    if (!gameId) {
      throw new Error('Game not found')
    }

    try {
      const response = await guessTitle(gameId, title)
      setGame(response.game)
      return response
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not guess title'), {
        cause: error,
      })
    }
  }

  return (
    <section className={styles.gamePage} aria-labelledby="game-title">
      <PageHeader
        title={game?.status === 'won' ? 'Game won' : 'Current game'}
        titleId="game-title"
      />

      {isLoading ? (
        <p className={styles.stateMessage}>Loading game...</p>
      ) : null}

      {visibleErrorMessage ? (
        <p className={styles.errorMessage} role="alert">
          {visibleErrorMessage}
        </p>
      ) : null}

      {!isLoading && !visibleErrorMessage && game ? (
      <div className={styles.gameLayout}>
        <article className={styles.articlePanel} aria-labelledby="article-title">
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.panelEyebrow}>{game.article.category.name}</p>
              <h2 id="article-title">
                {game.article.title ?? 'Hidden article'}
              </h2>
            </div>
            <span
              className={[
                styles.statusBadge,
                game.status === 'won' ? styles.wonStatus : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {getStatusLabel(game.status)}
            </span>
          </div>

          <div className={styles.articleBody}>
            {game.article.paragraphs.map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex}>
                {paragraph.map((word, wordIndex) =>
                  word.revealed ? (
                    <span key={`${word.text}-${wordIndex}`}>{word.text} </span>
                  ) : (
                    <span
                      key={`hidden-${paragraphIndex}-${wordIndex}`}
                      className={styles.hiddenWord}
                      aria-label={`Hidden word with ${word.length} characters`}
                    >
                      {Array.from({ length: word.length }, (_, letterIndex) => (
                        <span
                          key={letterIndex}
                          className={styles.hiddenLetter}
                          aria-hidden="true"
                        />
                      ))}
                    </span>
                  ),
                )}
              </p>
            ))}
          </div>
        </article>

        <aside className={styles.sidePanel} aria-label="Game controls">
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span>Time</span>
              <strong>{formatElapsedTime(game.elapsedSeconds)}</strong>
            </div>
            <div className={styles.statCard}>
              <span>Revealed Words</span>
              <strong>{game.revealedWordsCount}</strong>
            </div>
            <div className={styles.statCard}>
              <span>Word guesses</span>
              <strong>{game.wordGuessesCount}</strong>
            </div>
            <div className={styles.statCard}>
              <span>Title guesses</span>
              <strong>{game.titleGuessesCount}</strong>
            </div>
          </div>

          <GameTryPanel
            status={game.status}
            playerName={game.player.username}
            currentTitleGuess={game.currentTitleGuess}
            endedAt={game.endedAt}
            onGuessWord={handleGuessWord}
            onGuessTitle={handleGuessTitle}
          />
        </aside>
      </div>
      ) : null}
    </section>
  )
}
