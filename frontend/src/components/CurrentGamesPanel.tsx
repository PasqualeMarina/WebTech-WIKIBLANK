import { GameTablePanel } from './GameTablePanel'

const currentGameColumns = [
  'Article',
  'Revealed words',
  'Guesses',
  'Time',
]

export function CurrentGamesPanel() {
  return (
    <GameTablePanel
      title="Current games"
      titleId="current-games-title"
      columns={currentGameColumns}
      rows={[]}
      emptyMessage="No current games"
    />
  )
}
