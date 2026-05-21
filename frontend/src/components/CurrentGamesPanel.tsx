export function CurrentGamesPanel() {
  return (
    <section className="current-games" aria-labelledby="current-games-title">
      <div className="panel-heading">
        <h2 id="current-games-title">Partite in corso</h2>
      </div>

      <div className="games-table-wrap">
        <table className="games-table">
          <thead>
            <tr>
              <th scope="col">Articolo</th>
              <th scope="col">Parole rivelate</th>
              <th scope="col">Tentativi</th>
              <th scope="col">Tempo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="empty-table-cell">
                <div className="empty-game-state">
                  <span>Nessuna partita in corso</span>
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
