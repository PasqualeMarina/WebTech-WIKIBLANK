import { expect, type Page, type TestInfo } from '@playwright/test'

export type TestUser = {
  username: string
  password: string
}

function createTestUser(testInfo: TestInfo): TestUser {
  return {
    username: `e2e_${testInfo.project.name}_${Date.now()}`,
    password: 'Password123!',
  }
}

export async function registerUser(
  page: Page,
  testInfo: TestInfo,
): Promise<TestUser> {
  const user = createTestUser(testInfo)

  await page.goto('/register')
  await page.getByLabel('Username').fill(user.username)
  await page.getByLabel('Password', { exact: true }).fill(user.password)
  await page.getByLabel('Confirm password').fill(user.password)
  await page
    .getByRole('button', { name: 'Register', exact: true })
    .click()

  await expect(page).toHaveURL('/login')
  await expect(page.getByLabel('Username')).toHaveValue(user.username)

  return user
}

export async function registerAndLoginUser(
  page: Page,
  testInfo: TestInfo,
): Promise<TestUser> {
  const user = await registerUser(page, testInfo)

  await page.getByLabel('Password').fill(user.password)
  await page
    .getByRole('button', { name: 'Log in', exact: true })
    .click()

  await expect(page).toHaveURL('/home')
  await expect(page.getByLabel('Signed in user')).toContainText(user.username)

  return user
}
