import styles from './GameTryPanel.module.css'

type GameTryPanelProps = {
  isReadonly: boolean
}

export function GameTryPanel({ isReadonly }: GameTryPanelProps) {
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
        <label className={styles.field}>
          <span>Guess word</span>
          <input type="text" placeholder="Word" />
        </label>
        <button type="button" className={styles.primaryAction}>
          Reveal word
        </button>

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
