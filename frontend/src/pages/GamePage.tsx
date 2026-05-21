import { useParams } from 'react-router-dom'
import { GameTryPanel } from '../components/GameTryPanel'
import { PageHeader } from '../components/PageHeader'
import styles from './GamePage.module.css'

type GameViewMode = 'active' | 'readonly'

const articleParagraphs = [
  'The city became an important cultural center after its first public library opened near the main square.',
  'Its early growth was shaped by trade routes, local schools, and a series of civic buildings that still define the historic district.',
]

export function GamePage() {
  const { gameId } = useParams()
  const viewMode: GameViewMode =
    gameId === 'completed-preview' ? 'readonly' : 'active'
  const isReadonly = viewMode === 'readonly'

  return (
    <section className={styles.gamePage} aria-labelledby="game-title">
      <PageHeader
        title={isReadonly ? 'Completed game' : 'Current game'}
        titleId="game-title"
      />

      <div className={styles.gameLayout}>
        <article className={styles.articlePanel} aria-labelledby="article-title">
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.panelEyebrow}>History</p>
              <h2 id="article-title">
                {isReadonly ? 'Florence' : 'Hidden article'}
              </h2>
            </div>
            <span
              className={[
                styles.statusBadge,
                isReadonly ? styles.completedStatus : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isReadonly ? 'Completed' : 'Active'}
            </span>
          </div>

          <div className={styles.articleBody}>
            {articleParagraphs.map((paragraph) => (
              <p key={paragraph}>
                {paragraph.split(' ').map((word, index) => {
                  const shouldHide = !isReadonly && index % 4 === 1

                  return shouldHide ? (
                    <span
                      key={`${word}-${index}`}
                      className={styles.hiddenWord}
                      aria-label="Hidden word"
                    ></span>
                  ) : (
                    <span key={`${word}-${index}`}>{word} </span>
                  )
                })}
              </p>
            ))}
          </div>
        </article>

        <aside className={styles.sidePanel} aria-label="Game controls">
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span>Time</span>
              <strong>{isReadonly ? '08:42' : '03:18'}</strong>
            </div>
            <div className={styles.statCard}>
              <span>Revealed Words</span>
              <strong>{isReadonly ? '34' : '11'}</strong>
            </div>
          </div>

          <GameTryPanel isReadonly={isReadonly} />
        </aside>
      </div>
    </section>
  )
}
