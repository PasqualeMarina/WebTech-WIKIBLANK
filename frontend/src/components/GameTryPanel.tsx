import { useState, type FormEvent } from 'react'
import type { GuessResponse } from '../../../shared/games'
import styles from './GameTryPanel.module.css'

type GameTryPanelProps = {
  isReadonly: boolean
  onGuessWord: (word: string) => Promise<GuessResponse>
}

export function GameTryPanel({
  isReadonly,
  onGuessWord,
}: GameTryPanelProps) {
  const [guessedWord, setGuessedWord] = useState('')
  const [wordMessage, setWordMessage] = useState<string | null>(null)
  const [isGuessingWord, setIsGuessingWord] = useState(false)

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

  if (isReadonly) {
    return (
      <div className={styles.tryPanel} aria-label="Completed game summary">
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span>Winner</span>
            <strong>Donato</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Word guesses</span>
            <strong>10</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Title guesses</span>
            <strong>2</strong>
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

        <label className={styles.field}>
          <span>Guess title</span>
          <input type="text" placeholder="Article title" />
        </label>
        <button type="button" className={styles.secondaryAction}>
          Try title
        </button>
      </div>

      <div className={styles.summaryItem}>
        <span>Current title guess</span>
        <strong>Not submitted</strong>
      </div>

      <button type="button" className={styles.abandonAction}>
        Abandon game
      </button>
    </>
  )
}
