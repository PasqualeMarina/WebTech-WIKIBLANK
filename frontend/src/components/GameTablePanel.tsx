import type { Key, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './GameTablePanel.module.css'

export type GameTableRow = {
  id: Key
  cells: ReactNode[]
  to?: string
}

export type GameTableColumn =
  | string
  | {
      label: string
      onSort: () => void
      sortDirection?: 'ascending' | 'descending'
      sortLabel: string
    }

type GameTablePanelProps = {
  title: string
  titleId: string
  columns: GameTableColumn[]
  rows: GameTableRow[]
  emptyMessage: string
}

export function GameTablePanel({
  title,
  titleId,
  columns,
  rows,
  emptyMessage,
}: GameTablePanelProps) {
  const navigate = useNavigate()

  return (
    <section className={styles.gamePanel} aria-labelledby={titleId}>
      <div className={styles.panelHeading}>
        <h2 id={titleId}>{title}</h2>
      </div>

      <div className={styles.gamesTableWrap}>
        <table className={styles.gamesTable}>
          <thead>
            <tr>
              {columns.map((column) => {
                const label = typeof column === 'string' ? column : column.label

                return (
                  <th
                    key={label}
                    scope="col"
                    aria-sort={
                      typeof column === 'string'
                        ? undefined
                        : (column.sortDirection ?? 'none')
                    }
                  >
                    {typeof column === 'string' ? (
                      column
                    ) : (
                      <button
                        type="button"
                        className={styles.sortButton}
                        data-direction={column.sortDirection}
                        aria-label={column.sortLabel}
                        onClick={column.onSort}
                      >
                        {column.label}
                      </button>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={row.to ? styles.clickableRow : undefined}
                  role={row.to ? 'link' : undefined}
                  tabIndex={row.to ? 0 : undefined}
                  onClick={() => {
                    if (row.to) {
                      navigate(row.to)
                    }
                  }}
                  onKeyDown={(event) => {
                    if (
                      row.to &&
                      (event.key === 'Enter' || event.key === ' ')
                    ) {
                      event.preventDefault()
                      navigate(row.to)
                    }
                  }}
                >
                  {row.cells.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))
            ) : (
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
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
