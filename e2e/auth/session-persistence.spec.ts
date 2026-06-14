import { expect, test } from '@playwright/test'
import { registerAndLoginUser } from '../helpers/auth'

test('login persists after reloading the page', async ({ page }, testInfo) => {
  const user = await registerAndLoginUser(page, testInfo)

  await page.reload()

  await expect(page).toHaveURL('/home')

  const signedInUser = page.getByLabel('Signed in user')

  await expect(signedInUser).toContainText(user.username)
  await expect(
    signedInUser.getByRole('button', { name: 'Log out' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Log in' })).not.toBeVisible()
  await expect(page.getByRole('link', { name: 'Register' })).not.toBeVisible()
})
