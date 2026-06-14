import { expect, test } from '@playwright/test'
import { registerAndLoginUser } from '../helpers/auth'

test('authenticated user can log out', async ({ page }, testInfo) => {
  const user = await registerAndLoginUser(page, testInfo)
  const signedInUser = page.getByLabel('Signed in user')

  await expect(signedInUser).toContainText(user.username)
  await signedInUser.getByRole('button', { name: 'Log out' }).click()

  await expect(page).toHaveURL('/home')
  await expect(page.getByLabel('Signed in user')).not.toBeVisible()
  await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible()

  await page.reload()

  await expect(page).toHaveURL('/home')
  await expect(page.getByLabel('Signed in user')).not.toBeVisible()
  await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible()
})
