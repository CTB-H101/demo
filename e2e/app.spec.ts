import { expect, test } from '@playwright/test'

test.describe('Campus Food Truck Swarm', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Campus Food Truck Swarm' })).toBeVisible()
  })

  test('loads initial trucks and shows recommendation panel', async ({ page }) => {
    await expect(page.getByTestId('truck-count')).toContainText('Active trucks: 4')
    await expect(page.getByTestId('top-recommendation-name')).toBeVisible()
  })

  test('updates crowd when joining a queue', async ({ page }) => {
    await page.getByTestId('focus-button-ft1').click()

    const crowdValue = page.getByTestId('crowd-value-ft1')
    await expect(crowdValue).toContainText('Crowd level: 4.0')

    await page.getByTestId('join-button-ft1').click()
    await expect(crowdValue).toContainText('Crowd level: 5.0')
  })

  test('keeps local changes after refresh', async ({ page }) => {
    await page.getByTestId('focus-button-ft1').click()
    await page.getByTestId('join-button-ft1').click()

    await page.reload()
    await page.getByTestId('focus-button-ft1').click()
    await expect(page.getByTestId('crowd-value-ft1')).toContainText('Crowd level: 5.0')
  })

  test('supports admin create/update/delete with persistence', async ({ page }) => {
    await page.getByRole('link', { name: 'Admin' }).click()
    await expect(page.getByRole('heading', { name: 'Add Food Truck' })).toBeVisible()

    const addCard = page.locator('.admin-card', {
      has: page.getByRole('heading', { name: 'Add Food Truck' }),
    })

    await addCard.getByLabel('Name', { exact: true }).fill('Late Night Noodles')
    await addCard.getByLabel('Latitude').fill('42.3740')
    await addCard.getByLabel('Longitude').fill('-71.1150')
    await addCard.getByLabel('Inventory').fill('7')
    await addCard.getByLabel('Crowd').fill('3')
    await addCard.getByRole('button', { name: 'Add truck' }).click()

    await expect(page.getByRole('table')).toContainText('Late Night Noodles')

    const newRow = page.locator('tbody tr', { hasText: 'Late Night Noodles' })
    page.once('dialog', (dialog) => dialog.accept())
    await newRow.getByRole('button', { name: 'Delete' }).click()
    await expect(page.getByRole('table')).not.toContainText('Late Night Noodles')
  })

  test('falls back when geolocation is unavailable', async ({ page }) => {
    await expect(page.getByTestId('location-source')).toContainText('fallback')
  })
})
