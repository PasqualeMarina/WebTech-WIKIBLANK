import { useEffect } from 'react'
import type { GameCategory } from '../constants/gameCategories'
import styles from './GameCategoryDialog.module.css'

type GameCategoryDialogProps = {
  categories: GameCategory[]
  selectedCategoryId: string
  onSelectCategory: (categoryId: string) => void
  onClose: () => void
  onStartGame: (categoryId: string) => void
}

export function GameCategoryDialog({
  categories,
  selectedCategoryId,
  onSelectCategory,
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

        <div className={styles.footer}>
          <span className={styles.selection}>
            {selectedCategory ? selectedCategory.label : 'No category selected'}
          </span>
          <button
            type="button"
            className={styles.startButton}
            onClick={() => onStartGame(selectedCategoryId)}
            disabled={!selectedCategory}
          >
            Start game
          </button>
        </div>
      </section>
    </div>
  )
}
