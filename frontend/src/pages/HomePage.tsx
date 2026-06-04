import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CurrentGamesPanel } from '../components/CurrentGamesPanel'
import { GameCategoryDialog } from '../components/GameCategoryDialog'
import { NewGameTile } from '../components/NewGameTile'
import { PageHeader } from '../components/PageHeader'
import { gameCategories } from '../../../shared/gameCategories'
import { getApiErrorMessage } from '../api/client'
import { createGame } from '../api/games'
import { useAuth } from '../context/authContext'
import styles from './HomePage.module.css'

export function HomePage() {
  const navigate = useNavigate()
  const { currentUser, isLoading } = useAuth()
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    gameCategories[0]?.id ?? '',
  )
  const [isCreatingGame, setIsCreatingGame] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function handleOpenCategoryDialog() {
    if (isLoading) {
      return
    }

    if (!currentUser) {
      navigate('/login?reason=start-game&redirect=/home')
      return
    }

    setIsCategoryDialogOpen(true)
  }

  async function handleStartQuickGame() {
    if (isLoading || isCreatingGame) {
      return
    }

    if (!currentUser) {
      navigate('/login?reason=start-game&redirect=/home')
      return
    }

    setIsCreatingGame(true)
    setErrorMessage(null)

    try {
      const response = await createGame()
      navigate(`/games/${response.game.id}`)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Could not start game'))
    } finally {
      setIsCreatingGame(false)
    }
  }

  async function handleStartCategoryGame(categoryId: string) {
    if (isCreatingGame) {
      return
    }

    setIsCreatingGame(true)
    setErrorMessage(null)

    try {
      const response = await createGame({ category: categoryId })
      setIsCategoryDialogOpen(false)
      navigate(`/games/${response.game.id}`)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Could not start game'))
    } finally {
      setIsCreatingGame(false)
    }
  }

  return (
    <section className={styles.homePage} aria-labelledby="home-title">
      <PageHeader title="Home" titleId="home-title" />

      {errorMessage ? (
        <p className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className={styles.homeGrid}>
        <div className={styles.gameActions}>
          <NewGameTile
            title="NEW GAME"
            subtitle="Choose category"
            variant="category"
            onClick={handleOpenCategoryDialog}
          />
          <NewGameTile
            title="QUICK GAME"
            subtitle="Casual category"
            onClick={handleStartQuickGame}
          />
        </div>
        <CurrentGamesPanel />
      </div>

      {isCategoryDialogOpen ? (
        <GameCategoryDialog
          categories={gameCategories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          onClose={() => setIsCategoryDialogOpen(false)}
          onStartGame={handleStartCategoryGame}
        />
      ) : null}
    </section>
  )
}
