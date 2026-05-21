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
    <section className="game-panel" aria-labelledby={titleId}>
      <div className="panel-heading">
        <h2 id={titleId}>{title}</h2>
      </div>

      <div className="games-table-wrap">
        <table className="games-table">
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
              <td colSpan={columns.length} className="empty-table-cell">
                <div className="empty-game-state">
                  <span>{emptyMessage}</span>
                  <div className="empty-game-lines" aria-hidden="true">
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
