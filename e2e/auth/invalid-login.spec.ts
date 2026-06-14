import { expect, test } from '@playwright/test'
import { registerUser } from '../helpers/auth'

test('registered user cannot log in with a wrong password', async ({
  page,
}, testInfo) => {
  const user = await registerUser(page, testInfo)

  await page.getByLabel('Password').fill('WrongPassword123!')
  await page
    .getByRole('button', { name: 'Log in', exact: true })
    .click()

  await expect(page).toHaveURL('/login')
  await expect(page.getByRole('alert')).toHaveText(
    'Invalid username or password',
  )
  await expect(page.getByLabel('Signed in user')).not.toBeVisible()
})
