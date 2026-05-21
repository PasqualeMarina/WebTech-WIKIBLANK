import { CurrentGamesPanel } from './CurrentGamesPanel'
import { NewGameTile } from './NewGameTile'
import { PageHeader } from './PageHeader'
import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <section className={styles.homePage} aria-labelledby="home-title">
      <PageHeader title="Home" titleId="home-title" />

      <div className={styles.homeGrid}>
        <NewGameTile />
        <CurrentGamesPanel />
      </div>
    </section>
  )
}
