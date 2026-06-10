import { useRef, useState } from 'react'
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
  const isCreationLocked = useRef(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    gameCategories[0]?.id ?? '',
  )
  const [creationType, setCreationType] = useState<
    'quick' | 'category' | null
  >(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isCreatingGame = creationType !== null

  function handleOpenCategoryDialog() {
    if (isLoading || isCreationLocked.current) {
      return
    }

    if (!currentUser) {
      navigate('/login?reason=start-game&redirect=/home')
      return
    }

    setIsCategoryDialogOpen(true)
  }

  async function handleStartQuickGame() {
    if (isLoading || isCreationLocked.current) {
      return
    }

    if (!currentUser) {
      navigate('/login?reason=start-game&redirect=/home')
      return
    }

    isCreationLocked.current = true
    setCreationType('quick')
    setErrorMessage(null)

    try {
      const response = await createGame()
      navigate(`/games/${response.game.id}`)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Could not start game'))
    } finally {
      isCreationLocked.current = false
      setCreationType(null)
    }
  }

  async function handleStartCategoryGame(categoryId: string) {
    if (isCreationLocked.current) {
      return
    }

    isCreationLocked.current = true
    setCreationType('category')
    setErrorMessage(null)

    try {
      const response = await createGame({ category: categoryId })
      setIsCategoryDialogOpen(false)
      navigate(`/games/${response.game.id}`)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Could not start game'))
    } finally {
      isCreationLocked.current = false
      setCreationType(null)
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
            disabled={isLoading || isCreatingGame}
            isLoading={creationType === 'category'}
            onClick={handleOpenCategoryDialog}
          />
          <NewGameTile
            title="QUICK GAME"
            subtitle={
              creationType === 'quick'
                ? 'Starting game...'
                : 'Casual category'
            }
            disabled={isLoading || isCreatingGame}
            isLoading={creationType === 'quick'}
            onClick={handleStartQuickGame}
          />
        </div>
        <CurrentGamesPanel />
      </div>

      {isCategoryDialogOpen ? (
        <GameCategoryDialog
          categories={gameCategories}
          selectedCategoryId={selectedCategoryId}
          isCreatingGame={isCreatingGame}
          onSelectCategory={setSelectedCategoryId}
          onClose={() => setIsCategoryDialogOpen(false)}
          onStartGame={handleStartCategoryGame}
        />
      ) : null}
    </section>
  )
}
