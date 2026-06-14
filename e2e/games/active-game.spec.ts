import { expect, test } from '@playwright/test'
import { registerAndLoginUser } from '../helpers/auth'
import { createTestGame } from '../helpers/games'

test('authenticated user can view an active game', async ({ page }, testInfo) => {
  const user = await registerAndLoginUser(page, testInfo)
  const game = await createTestGame(user.username)

  await page.goto(`/games/${game.gameId}`)

  await expect(page).toHaveURL(`/games/${game.gameId}`)
  await expect(
    page.getByRole('heading', { name: 'Current game', level: 1 }),
  ).toBeVisible()
  await expect(page.getByText(game.category, { exact: true })).toBeVisible()
  await expect(page.getByText('Active', { exact: true })).toBeVisible()
  await expect(page.getByText('Hidden article title')).toBeVisible()
  await expect(
    page.getByLabel('Hidden title with 2 words: 5, 6 characters'),
  ).toBeVisible()

  await expect(page.getByLabel('Game controls')).toBeVisible()
  await expect(page.getByLabel('Game attempts')).toBeVisible()
  await expect(page.getByLabel('Guess word')).toBeVisible()
  await expect(page.getByLabel('Guess title')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Reveal word' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Try title' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Abandon game' }),
  ).toBeVisible()

  const progress = page.getByRole('region', { name: 'Progress' })

  await expect(progress).toContainText('Hidden words remaining')
  await expect(progress).toContainText('Revealed words')
  await expect(progress).toContainText('Word guesses')
  await expect(progress).toContainText('Title guesses')
})
