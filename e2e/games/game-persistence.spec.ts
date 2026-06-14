import { expect, type Locator, test } from '@playwright/test'
import { registerAndLoginUser } from '../helpers/auth'
import { createTestGame } from '../helpers/games'

function getStatValue(progress: Locator, label: string) {
  return progress.getByText(label, { exact: true }).locator('..').locator('strong')
}

test('authenticated user can resume a game after reloading the home page', async ({
  page,
}, testInfo) => {
  const user = await registerAndLoginUser(page, testInfo)
  const game = await createTestGame(user.username)

  await page.goto(`/games/${game.gameId}`)

  const progress = page.getByRole('region', { name: 'Progress' })
  const wordGuesses = getStatValue(progress, 'Word guesses')
  const revealedWords = getStatValue(progress, 'Revealed words')

  await page.getByLabel('Guess word').fill(game.correctWord)
  await page.getByRole('button', { name: 'Reveal word' }).click()

  await expect(page.getByRole('status')).toHaveText(
    `${game.correctWordOccurrences} words revealed`,
  )
  await expect(wordGuesses).toHaveText('1')
  await expect(revealedWords).toHaveText(
    String(game.correctWordOccurrences),
  )

  await page.goBack()
  await expect(page).toHaveURL('/home')

  await page.reload()

  const signedInUser = page.getByLabel('Signed in user')

  await expect(signedInUser).toContainText(user.username)
  await expect(
    signedInUser.getByRole('button', { name: 'Log out' }),
  ).toBeVisible()

  const currentGames = page.getByRole('region', { name: 'Current games' })
  const gameRow = currentGames
    .getByRole('link')
    .filter({ hasText: game.category })

  await expect(gameRow).toHaveCount(1)

  const cells = gameRow.getByRole('cell')

  await expect(cells.nth(0)).toHaveText(game.category)
  await expect(cells.nth(2)).toHaveText(
    String(game.correctWordOccurrences),
  )
  await expect(cells.nth(3)).toHaveText('1')

  await gameRow.click()

  await expect(page).toHaveURL(`/games/${game.gameId}`)
  await expect(getStatValue(progress, 'Word guesses')).toHaveText('1')
  await expect(getStatValue(progress, 'Revealed words')).toHaveText(
    String(game.correctWordOccurrences),
  )
  await expect(
    page.getByText(game.correctWord, { exact: false }),
  ).toHaveCount(game.correctWordOccurrences)
})
