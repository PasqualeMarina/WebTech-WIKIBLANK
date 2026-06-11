import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { getGame, guessTitle, guessWord } from '../api/games'
import { GameTryPanel } from '../components/GameTryPanel'
import { PageHeader } from '../components/PageHeader'
import type { GameDetail } from '../../../shared/games'
import styles from './GamePage.module.css'

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
  const hiddenWordsCount =
    game?.article.paragraphs.reduce(
      (total, paragraph) =>
        total + paragraph.filter((word) => !word.revealed).length,
      0,
    ) ?? 0

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
            <div className={styles.panelMeta}>
              <span className={styles.categoryBadge}>
                {game.article.category.name}
              </span>
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

            <div className={styles.titleBlock}>
              <p className={styles.titleLabel}>
                {game.status === 'won' ? 'Article title' : 'Hidden article title'}
              </p>
              <h2 id="article-title">
                {game.article.title ?? (
                  <span
                    className={styles.hiddenTitle}
                    aria-label={`Hidden title with ${game.article.titleWordLengths.length} ${
                      game.article.titleWordLengths.length === 1
                        ? 'word'
                        : 'words'
                    }: ${game.article.titleWordLengths.join(', ')} characters`}
                  >
                    {game.article.titleWordLengths.map((wordLength, wordIndex) => (
                      <span
                        key={`${wordLength}-${wordIndex}`}
                        className={styles.hiddenTitleWord}
                        aria-hidden="true"
                      >
                        {Array.from({ length: wordLength }, (_, letterIndex) => (
                          <span
                            key={letterIndex}
                            className={styles.hiddenTitleLetter}
                          />
                        ))}
                      </span>
                    ))}
                  </span>
                )}
              </h2>
            </div>
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
          <header className={styles.sidePanelHeading}>
            <p>Game controls</p>
            <h2>
              {game.status === 'won' ? 'Game summary' : 'Solve the article'}
            </h2>
          </header>

          <section
            className={styles.progressPanel}
            aria-labelledby="game-progress-title"
          >
            <h3 id="game-progress-title">Progress</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span>Hidden words remaining</span>
                <strong>{hiddenWordsCount}</strong>
              </div>
              <div className={styles.statCard}>
                <span>Revealed words</span>
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
          </section>

          <GameTryPanel
            status={game.status}
            playerName={game.player.username}
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
