import { expect, test } from '@playwright/test'

test('user can register and log in', async ({ page }, testInfo) => {
  const username = `e2e_${testInfo.project.name}_${Date.now()}`
  const password = 'Password123!'

  await page.goto('/home')
  await page.getByRole('link', { name: 'Register' }).click()

  await expect(page).toHaveURL('/register')
  await expect(
    page.getByRole('heading', { name: 'Register', level: 1 }),
  ).toBeVisible()

  const usernameInput = page.getByLabel('Username')
  const passwordInput = page.getByLabel('Password', { exact: true })
  const confirmPasswordInput = page.getByLabel('Confirm password')
  const registerButton = page.getByRole('button', {
    name: 'Register',
    exact: true,
  })

  await usernameInput.fill('ab')
  await passwordInput.fill(password)
  await confirmPasswordInput.fill(password)
  await registerButton.click()

  await expect(page.getByRole('alert')).toHaveText(
    'Username must be at least 3 characters long',
  )

  await usernameInput.fill(username)
  await passwordInput.fill('short')
  await confirmPasswordInput.fill('short')
  await registerButton.click()

  await expect(page.getByRole('alert')).toHaveText(
    'Password must be at least 8 characters long',
  )

  await passwordInput.fill(password)
  await confirmPasswordInput.fill('DifferentPassword123!')
  await registerButton.click()

  await expect(page.getByRole('alert')).toHaveText('Passwords do not match')

  await confirmPasswordInput.fill(password)
  await registerButton.click()

  await expect(page).toHaveURL('/login')
  await expect(
    page.getByRole('heading', { name: 'Log in', level: 1 }),
  ).toBeVisible()
  await expect(page.getByLabel('Username')).toHaveValue(username)

  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Log in', exact: true }).click()

  await expect(page).toHaveURL('/home')

  const signedInUser = page.getByLabel('Signed in user')

  await expect(signedInUser).toContainText(username)
  await expect(
    signedInUser.getByRole('button', { name: 'Log out' }),
  ).toBeVisible()
})
