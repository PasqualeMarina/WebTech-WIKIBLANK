import { GameTablePanel } from './GameTablePanel'

const leaderboardColumns = [
  'Player',
  'Average time',
  'Completed games',
]

export function LeaderboardPage() {
  return (
    <section className="home-page leaderboard-page" aria-labelledby="leaderboard-title">
      <header className="home-header">
        <p className="eyebrow">WikiBlank</p>
        <h1 id="leaderboard-title">Leaderboard</h1>
      </header>

      <div className="leaderboard-layout">
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
