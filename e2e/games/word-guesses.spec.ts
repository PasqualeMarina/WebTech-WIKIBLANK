import { expect, type Locator, test } from '@playwright/test'
import { registerAndLoginUser } from '../helpers/auth'
import { createTestGame } from '../helpers/games'

function getStatValue(progress: Locator, label: string) {
  return progress.getByText(label, { exact: true }).locator('..').locator('strong')
}

test('authenticated user can try words in an active game', async ({
  page,
}, testInfo) => {
  const user = await registerAndLoginUser(page, testInfo)
  const game = await createTestGame(user.username)

  await page.goto(`/games/${game.gameId}`)

  const progress = page.getByRole('region', { name: 'Progress' })
  const wordInput = page.getByLabel('Guess word')
  const revealWordButton = page.getByRole('button', { name: 'Reveal word' })
  const wordGuesses = getStatValue(progress, 'Word guesses')
  const revealedWords = getStatValue(progress, 'Revealed words')

  await expect(wordGuesses).toHaveText('0')
  await expect(revealedWords).toHaveText('0')

  await revealWordButton.click()

  await expect(page.getByRole('status')).toHaveText('Please enter a word')
  await expect(wordGuesses).toHaveText('0')

  await wordInput.fill(game.incorrectWord)
  await revealWordButton.click()

  await expect(page.getByRole('status')).toHaveText('Word not found')
  await expect(wordGuesses).toHaveText('1')
  await expect(revealedWords).toHaveText('0')

  await wordInput.fill(game.correctWord)
  await revealWordButton.click()

  await expect(page.getByRole('status')).toHaveText(
    `${game.correctWordOccurrences} words revealed`,
  )
  await expect(wordGuesses).toHaveText('2')
  await expect(revealedWords).toHaveText(
    String(game.correctWordOccurrences),
  )
  await expect(
    page.getByText(game.correctWord, { exact: false }),
  ).toHaveCount(game.correctWordOccurrences)

  await wordInput.fill(game.correctWord)
  await revealWordButton.click()

  await expect(page.getByRole('status')).toHaveText(
    'Word already visible or previously revealed',
  )
  await expect(wordGuesses).toHaveText('3')
  await expect(revealedWords).toHaveText(
    String(game.correctWordOccurrences),
  )
})
