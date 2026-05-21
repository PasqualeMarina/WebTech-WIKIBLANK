import { GameTablePanel } from './GameTablePanel'
import { PageHeader } from './PageHeader'
import styles from './LeaderboardPage.module.css'

const leaderboardColumns = [
  'Player',
  'Average time',
  'Completed games',
]

export function LeaderboardPage() {
  return (
    <section className={styles.leaderboardPage} aria-labelledby="leaderboard-title">
      <PageHeader title="Leaderboard" titleId="leaderboard-title" />

      <div className={styles.leaderboardLayout}>
        <GameTablePanel
          title="Top players"
          titleId="leaderboard-panel-title"
          columns={leaderboardColumns}
          emptyMessage="No players in the leaderboard"
        />
      </div>
    </section>
  )
}
