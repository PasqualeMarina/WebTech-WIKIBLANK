import { CurrentGamesPanel } from './CurrentGamesPanel'
import { NewGameTile } from './NewGameTile'

export function HomePage() {
  return (
    <section className="home-page" aria-labelledby="home-title">
      <header className="home-header">
        <p className="eyebrow">WikiBlank</p>
        <h1 id="home-title">Home</h1>
      </header>

      <div className="home-grid">
        <NewGameTile />
        <CurrentGamesPanel />
      </div>
    </section>
  )
}
