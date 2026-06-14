import { expect, test } from '@playwright/test'

test('guest user can navigate through the main pages', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveURL('/home')
  await expect(page).toHaveTitle(/WikiBlank/)

  await expect(
    page.getByRole('complementary', { name: 'Main navigation' }),
  ).toBeVisible()
  await expect(
    page.getByRole('img', { name: 'WikiBlankLogo' }),
  ).toBeVisible()

  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Leaderboard' })).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Completed Games' }),
  ).toBeVisible()

  await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible()

  await expect(
    page.getByRole('heading', { name: 'Home', level: 1 }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: /NEW GAME/i }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: /QUICK GAME/i }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Current games' }),
  ).toBeVisible()
  await expect(
    page.getByText('Log in to see your current games'),
  ).toBeVisible()

  await page.getByRole('link', { name: 'Leaderboard' }).click()

  await expect(page).toHaveURL('/leaderboard')
  await expect(
    page.getByRole('heading', { name: 'Leaderboard', level: 1 }),
  ).toBeVisible()

  await page.getByRole('link', { name: 'Completed Games' }).click()

  await expect(page).toHaveURL('/completed-games')
  await expect(
    page.getByRole('heading', { name: 'Completed games', level: 1 }),
  ).toBeVisible()

  await page.getByRole('link', { name: 'Home' }).click()

  await expect(page).toHaveURL('/home')
  await expect(
    page.getByRole('heading', { name: 'Home', level: 1 }),
  ).toBeVisible()
})
