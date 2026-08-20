/*
 * These browser checks cover the critical public journey without depending on
 * a third-party CMS or a live GPS position. Map tiles may stream separately,
 * so assertions focus on the accessible list and URL contract as well.
 */

import { expect, test } from '@playwright/test';

test('Greek home exposes the map, filters, and bilingual navigation', async ({ page }) => {
  await page.goto('/el/');
  await expect(page.getByRole('heading', { name: 'Λαύκος' })).toBeVisible();
  const mapRegion = page.getByRole('region', { name: 'Εξερεύνησε τον Λαύκο' });
  await expect(mapRegion).toBeVisible();
  await mapRegion.scrollIntoViewIfNeeded();
  const mapCanvas = page.locator('.map-canvas .maplibregl-canvas');
  await expect(mapCanvas).toBeVisible();
  await expect.poll(() => mapCanvas.evaluate((element) => element.clientHeight)).toBeGreaterThan(0);
  await mapRegion.getByRole('button', { name: 'Ιστορία' }).click();
  await expect(page).toHaveURL(/categories=heritage/);
  await expect(page.getByRole('link', { name: /Μουσείο Φάμπα — περισσότερα/ })).toBeVisible();
  await page.locator('footer').getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL('/en/');
  await expect(page.getByRole('heading', { name: 'Lafkos', exact: true })).toBeVisible();
});

test('a selected map result creates a shareable place URL', async ({ page }) => {
  await page.goto('/el/');
  const mapRegion = page.getByRole('region', { name: 'Εξερεύνησε τον Λαύκο' });
  await mapRegion.scrollIntoViewIfNeeded();
  await mapRegion.getByRole('complementary').getByRole('button', { name: /Η πλατεία του Λαύκου/ }).click();
  await expect(page).toHaveURL(/place=lafkos-square/);
  await expect(page.getByRole('link', { name: 'Άνοιξε τη σελίδα' })).toHaveAttribute('href', '/el/places/plateia-lafkou');
});

test('place pages switch to the translated slug', async ({ page }) => {
  await page.goto('/el/places/plateia-lafkou');
  await expect(page.getByRole('heading', { name: 'Η πλατεία του Λαύκου' })).toBeVisible();
  await page.locator('footer').getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL('/en/places/lafkos-square');
  await expect(page.getByRole('heading', { name: 'Lafkos square' })).toBeVisible();
});
