import { GameTablePanel } from '../components/GameTablePanel'
import { PageHeader } from '../components/PageHeader'
import styles from './CompletedGamesPage.module.css'

const completedGamesColumns = [
  'Article',
  'Winner',
  'Guesses',
  'Time',
]

export function CompletedGamesPage() {
  return (
    <section
      className={styles.completedGamesPage}
      aria-labelledby="completed-games-title"
    >
      <PageHeader title="Completed games" titleId="completed-games-title" />

      <div className={styles.completedGamesLayout}>
        <GameTablePanel
          title="Game history"
          titleId="completed-games-panel-title"
          columns={completedGamesColumns}
          emptyMessage="No completed games"
        />
      </div>
    </section>
  )
}
