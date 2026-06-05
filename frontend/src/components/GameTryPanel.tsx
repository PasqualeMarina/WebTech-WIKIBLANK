import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type {
  GameStatus,
  GuessResponse,
  TitleGuessResponse,
} from '../../../shared/games'
import styles from './GameTryPanel.module.css'

type GameTryPanelProps = {
  status: GameStatus
  playerName: string
  currentTitleGuess: string | null
  endedAt: string | null
  onGuessWord: (word: string) => Promise<GuessResponse>
  onGuessTitle: (title: string) => Promise<TitleGuessResponse>
}

function formatCompletedAt(timestamp: string | null) {
  if (!timestamp) {
    return 'Not available'
  }

  const normalizedTimestamp = timestamp.includes('T')
    ? timestamp
    : `${timestamp.replace(' ', 'T')}Z`
  const date = new Date(normalizedTimestamp)

  if (Number.isNaN(date.getTime())) {
    return timestamp
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function GameTryPanel({
  status,
  playerName,
  currentTitleGuess,
  endedAt,
  onGuessWord,
  onGuessTitle,
}: GameTryPanelProps) {
  const navigate = useNavigate()
  const [guessedWord, setGuessedWord] = useState('')
  const [wordMessage, setWordMessage] = useState<string | null>(null)
  const [isGuessingWord, setIsGuessingWord] = useState(false)
  const [guessedTitle, setGuessedTitle] = useState('')
  const [titleMessage, setTitleMessage] = useState<string | null>(null)
  const [isGuessingTitle, setIsGuessingTitle] = useState(false)

  async function handleWordGuess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const word = guessedWord.trim()

    if (!word) {
      setWordMessage('Please enter a word')
      return
    }

    setIsGuessingWord(true)
    setWordMessage(null)

    try {
      const response = await onGuessWord(word)

      if (!response.correct) {
        setWordMessage('Word not found')
      } else if (response.revealedWordsCount === 0) {
        setWordMessage('Word already visible or previously revealed')
      } else {
        setWordMessage(
          `${response.revealedWordsCount} ${
            response.revealedWordsCount === 1 ? 'word' : 'words'
          } revealed`,
        )
      }

      setGuessedWord('')
    } catch (error) {
      setWordMessage(
        error instanceof Error ? error.message : 'Could not guess word',
      )
    } finally {
      setIsGuessingWord(false)
    }
  }

  async function handleTitleGuess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const title = guessedTitle.trim()

    if (!title) {
      setTitleMessage('Please enter a title')
      return
    }

    setIsGuessingTitle(true)
    setTitleMessage(null)

    try {
      const response = await onGuessTitle(title)
      setTitleMessage(response.correct ? 'Correct title' : 'Incorrect title')
      setGuessedTitle('')
    } catch (error) {
      setTitleMessage(
        error instanceof Error ? error.message : 'Could not guess title',
      )
    } finally {
      setIsGuessingTitle(false)
    }
  }

  if (status !== 'active') {
    return (
      <div className={styles.tryPanel} aria-label="Completed game summary">
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span>Winner</span>
            <strong>{playerName}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Result</span>
            <strong>Victory</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Finished</span>
            <strong>{formatCompletedAt(endedAt)}</strong>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={styles.tryPanel} aria-label="Game attempts">
        <form className={styles.guessForm} onSubmit={handleWordGuess}>
          <label className={styles.field}>
            <span>Guess word</span>
            <input
              type="text"
              placeholder="Word"
              value={guessedWord}
              onChange={(event) => {
                setGuessedWord(event.target.value)
                setWordMessage(null)
              }}
              disabled={isGuessingWord}
              aria-describedby={wordMessage ? 'word-guess-message' : undefined}
            />
          </label>
          <button
            type="submit"
            className={styles.primaryAction}
            disabled={isGuessingWord}
          >
            {isGuessingWord ? 'Revealing...' : 'Reveal word'}
          </button>
          {wordMessage ? (
            <p
              id="word-guess-message"
              className={styles.guessMessage}
              role="status"
            >
              {wordMessage}
            </p>
          ) : null}
        </form>

        <form className={styles.guessForm} onSubmit={handleTitleGuess}>
          <label className={styles.field}>
            <span>Guess title</span>
            <input
              type="text"
              placeholder="Article title"
              value={guessedTitle}
              onChange={(event) => {
                setGuessedTitle(event.target.value)
                setTitleMessage(null)
              }}
              disabled={isGuessingTitle}
              aria-describedby={titleMessage ? 'title-guess-message' : undefined}
            />
          </label>
          <button
            type="submit"
            className={styles.secondaryAction}
            disabled={isGuessingTitle}
          >
            {isGuessingTitle ? 'Trying...' : 'Try title'}
          </button>
          {titleMessage ? (
            <p
              id="title-guess-message"
              className={styles.guessMessage}
              role="status"
            >
              {titleMessage}
            </p>
          ) : null}
        </form>
      </div>

      <div className={styles.summaryItem}>
        <span>Current title guess</span>
        <strong>{currentTitleGuess ?? 'Not submitted'}</strong>
      </div>

      <button
        type="button"
        className={styles.abandonAction}
        onClick={() => navigate('/home')}
      >
        Abandon game
      </button>
    </>
  )
}
