import { expect, test } from '@playwright/test'
import { registerAndLoginUser } from '../helpers/auth'
import { createTestGame } from '../helpers/games'

test('won game appears in history and leaderboard', async ({
  page,
}, testInfo) => {
  const user = await registerAndLoginUser(page, testInfo)
  const game = await createTestGame(user.username)

  await page.goto(`/games/${game.gameId}`)
  await page.getByLabel('Guess title').fill(game.title)
  await page.getByRole('button', { name: 'Try title' }).click()

  await expect(
    page.getByRole('heading', { name: 'Game won', level: 1 }),
  ).toBeVisible()

  await page.getByRole('link', { name: 'Completed Games' }).click()

  await expect(page).toHaveURL('/completed-games')

  const completedGameRow = page.getByRole('link', {
    name: new RegExp(game.title),
  })
  const completedGameCells = completedGameRow.getByRole('cell')

  await expect(completedGameCells.nth(0)).toHaveText(game.title)
  await expect(completedGameCells.nth(1)).toHaveText(game.category)
  await expect(completedGameCells.nth(2)).toHaveText(user.username)
  await expect(completedGameCells.nth(3)).toHaveText('0')
  await expect(completedGameCells.nth(4)).toHaveText('1')

  await page.getByRole('link', { name: 'Leaderboard' }).click()

  await expect(page).toHaveURL('/leaderboard')

  const leaderboardRow = page.getByRole('row').filter({
    hasText: user.username,
  })
  const leaderboardCells = leaderboardRow.getByRole('cell')

  await expect(leaderboardCells.nth(0)).toHaveText(user.username)
  await expect(leaderboardCells.nth(1)).toHaveText('1')
  await expect(leaderboardCells.nth(2)).toHaveText('1')
  await expect(leaderboardCells.nth(3)).toHaveText('100.0%')
})
