import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CurrentGamesPanel } from '../components/CurrentGamesPanel'
import { GameCategoryDialog } from '../components/GameCategoryDialog'
import { NewGameTile } from '../components/NewGameTile'
import { PageHeader } from '../components/PageHeader'
import { gameCategories } from '../constants/gameCategories'
import { useAuth } from '../context/authContext'
import styles from './HomePage.module.css'

export function HomePage() {
  const navigate = useNavigate()
  const { currentUser, isLoading } = useAuth()
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    gameCategories[0]?.id ?? '',
  )

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

  function handleStartCategoryGame(categoryId: string) {
    void categoryId
    setIsCategoryDialogOpen(false)
  }

  return (
    <section className={styles.homePage} aria-labelledby="home-title">
      <PageHeader title="Home" titleId="home-title" />

      <div className={styles.homeGrid}>
        <div className={styles.gameActions}>
          <NewGameTile
            title="NEW GAME"
            subtitle="Choose category"
            variant="category"
            onClick={handleOpenCategoryDialog}
          />
          <NewGameTile title="QUICK GAME" subtitle="Casual category" />
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
