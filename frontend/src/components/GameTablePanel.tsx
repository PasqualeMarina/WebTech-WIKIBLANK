import styles from './GameTablePanel.module.css'

type GameTablePanelProps = {
  title: string
  titleId: string
  columns: string[]
  emptyMessage: string
}

export function GameTablePanel({
  title,
  titleId,
  columns,
  emptyMessage,
}: GameTablePanelProps) {
  return (
    <section className={styles.gamePanel} aria-labelledby={titleId}>
      <div className={styles.panelHeading}>
        <h2 id={titleId}>{title}</h2>
      </div>

      <div className={styles.gamesTableWrap}>
        <table className={styles.gamesTable}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length} className={styles.emptyTableCell}>
                <div className={styles.emptyGameState}>
                  <span>{emptyMessage}</span>
                  <div className={styles.emptyGameLines} aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
