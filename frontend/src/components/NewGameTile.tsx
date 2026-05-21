import styles from './NewGameTile.module.css'

export function NewGameTile() {
  return (
    <button type="button" className={styles.newGameTile}>
      <span>NEW GAME</span>
    </button>
  )
}
