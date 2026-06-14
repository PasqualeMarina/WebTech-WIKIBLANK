import { expect, type Locator, test } from '@playwright/test'
import { registerAndLoginUser } from '../helpers/auth'
import { createTestGame } from '../helpers/games'

function getStatValue(progress: Locator, label: string) {
  return progress.getByText(label, { exact: true }).locator('..').locator('strong')
}

test('authenticated user can guess the title and win', async ({
  page,
}, testInfo) => {
  const user = await registerAndLoginUser(page, testInfo)
  const game = await createTestGame(user.username)

  await page.goto(`/games/${game.gameId}`)

  const progress = page.getByRole('region', { name: 'Progress' })
  const titleInput = page.getByLabel('Guess title')
  const tryTitleButton = page.getByRole('button', { name: 'Try title' })
  const titleGuesses = getStatValue(progress, 'Title guesses')

  await expect(titleGuesses).toHaveText('0')

  await tryTitleButton.click()

  await expect(page.getByRole('status')).toHaveText('Please enter a title')
  await expect(titleGuesses).toHaveText('0')

  await titleInput.fill('Wrong article title')
  await tryTitleButton.click()

  await expect(page.getByRole('status')).toHaveText('Incorrect title')
  await expect(titleGuesses).toHaveText('1')
  await expect(
    page.getByRole('heading', { name: 'Current game', level: 1 }),
  ).toBeVisible()

  await titleInput.fill(game.title)
  await tryTitleButton.click()

  await expect(
    page.getByRole('heading', { name: 'Game won', level: 1 }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: game.title, level: 2 }),
  ).toBeVisible()
  await expect(page.getByText('Won', { exact: true })).toBeVisible()
  await expect(titleGuesses).toHaveText('2')

  const summary = page.getByLabel('Completed game summary')

  await expect(summary).toContainText(user.username)
  await expect(summary).toContainText('Victory')
  await expect(page.getByLabel('Game attempts')).not.toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Abandon game' }),
  ).not.toBeVisible()
})
