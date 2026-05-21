import { CurrentGamesPanel } from '../components/CurrentGamesPanel'
import { NewGameTile } from '../components/NewGameTile'
import { PageHeader } from '../components/PageHeader'
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
