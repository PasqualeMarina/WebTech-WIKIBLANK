import { useEffect } from 'react'
import type { GameCategory } from '../../../shared/gameCategories'
import {
  gameDifficultyOptions,
  type GameDifficulty,
} from '../../../shared/gameDifficulties'
import styles from './GameCategoryDialog.module.css'

type GameCategoryDialogProps = {
  categories: GameCategory[]
  selectedCategoryId: string
  selectedDifficulty: GameDifficulty
  isCreatingGame: boolean
  onSelectCategory: (categoryId: string) => void
  onSelectDifficulty: (difficulty: GameDifficulty) => void
  onClose: () => void
  onStartGame: (categoryId: string, difficulty: GameDifficulty) => void
}

export function GameCategoryDialog({
  categories,
  selectedCategoryId,
  selectedDifficulty,
  isCreatingGame,
  onSelectCategory,
  onSelectDifficulty,
  onClose,
  onStartGame,
}: GameCategoryDialogProps) {
  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  )

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-dialog-title"
      >
        <div className={styles.heading}>
          <div>
            <p>New game</p>
            <h2 id="category-dialog-title">Choose category</h2>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close category picker"
          >
            x
          </button>
        </div>

        <div className={styles.categoryGrid}>
          {categories.map((category) => {
            const isSelected = category.id === selectedCategoryId

            return (
              <button
                key={category.id}
                type="button"
                className={[
                  styles.categoryButton,
                  isSelected ? styles.selected : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelectCategory(category.id)}
                aria-pressed={isSelected}
              >
                {category.label}
              </button>
            )
          })}
        </div>

        <section
          className={styles.difficultySection}
          aria-labelledby="difficulty-title"
        >
          <div className={styles.sectionHeading}>
            <h3 id="difficulty-title">Choose difficulty</h3>
            <p>Common words are always visible.</p>
          </div>

          <div className={styles.difficultyGrid}>
            {gameDifficultyOptions.map((difficulty) => {
              const isSelected = difficulty.id === selectedDifficulty

              return (
                <button
                  key={difficulty.id}
                  type="button"
                  className={[
                    styles.difficultyButton,
                    isSelected ? styles.selectedDifficulty : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onSelectDifficulty(difficulty.id)}
                  aria-pressed={isSelected}
                >
                  <strong>{difficulty.label}</strong>
                  <span>{difficulty.description}</span>
                </button>
              )
            })}
          </div>
        </section>

        <div className={styles.footer}>
          <span className={styles.selection}>
            {selectedCategory ? selectedCategory.label : 'No category selected'}
            {' · '}
            {
              gameDifficultyOptions.find(
                (difficulty) => difficulty.id === selectedDifficulty,
              )?.label
            }
          </span>
          <button
            type="button"
            className={styles.startButton}
            onClick={() =>
              onStartGame(selectedCategoryId, selectedDifficulty)
            }
            disabled={!selectedCategory || isCreatingGame}
          >
            {isCreatingGame ? 'Starting game...' : 'Start game'}
          </button>
        </div>
      </section>
    </div>
  )
}
