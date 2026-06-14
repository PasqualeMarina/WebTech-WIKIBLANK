import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const execFileAsync = promisify(execFile)
const createGameScriptPath = fileURLToPath(
  new URL('../../backend/scripts/e2e/create-test-game.js', import.meta.url),
)

export type TestGame = {
  gameId: number
  title: string
  content: string
  category: string
  correctWord: string
  correctWordOccurrences: number
  incorrectWord: string
}

function isTestGame(value: unknown): value is TestGame {
  return (
    typeof value === 'object'
    && value !== null
    && 'gameId' in value
    && typeof value.gameId === 'number'
    && 'title' in value
    && typeof value.title === 'string'
    && 'content' in value
    && typeof value.content === 'string'
    && 'category' in value
    && typeof value.category === 'string'
    && 'correctWord' in value
    && typeof value.correctWord === 'string'
    && 'correctWordOccurrences' in value
    && typeof value.correctWordOccurrences === 'number'
    && 'incorrectWord' in value
    && typeof value.incorrectWord === 'string'
  )
}

export async function createTestGame(username: string): Promise<TestGame> {
  const { stdout } = await execFileAsync(process.execPath, [
    createGameScriptPath,
    username,
  ])
  const game = JSON.parse(stdout) as unknown

  if (!isTestGame(game)) {
    throw new Error('The E2E game fixture returned invalid data')
  }

  return game
}
