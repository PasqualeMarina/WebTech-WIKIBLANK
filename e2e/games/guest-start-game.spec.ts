import { expect, test } from '@playwright/test'

test('guest is redirected to login when starting a game', async ({ page }) => {
  const loginMessage = 'Log in to start a new game.'
  const isStartGameLoginUrl = (url: URL) =>
    url.pathname === '/login'
    && url.searchParams.get('reason') === 'start-game'
    && url.searchParams.get('redirect') === '/home'

  await page.goto('/home')

  await page.getByRole('button', { name: /NEW GAME/i }).click()

  await expect(page).toHaveURL(isStartGameLoginUrl)
  await expect(
    page.getByRole('heading', { name: 'Log in', level: 1 }),
  ).toBeVisible()
  await expect(page.getByRole('alert')).toHaveText(loginMessage)

  await page.getByRole('link', { name: 'Continue as guest' }).click()

  await expect(page).toHaveURL('/home')

  await page.getByRole('button', { name: /QUICK GAME/i }).click()

  await expect(page).toHaveURL(isStartGameLoginUrl)
  await expect(
    page.getByRole('heading', { name: 'Log in', level: 1 }),
  ).toBeVisible()
  await expect(page.getByRole('alert')).toHaveText(loginMessage)
})
