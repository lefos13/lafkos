/*
 * These browser checks cover the critical public journey without depending on
 * a third-party CMS or a live GPS position. Map tiles may stream separately,
 * so assertions focus on the accessible list and URL contract as well.
 */

import { expect, test } from '@playwright/test';

test('Greek home exposes the map, filters, and bilingual navigation', async ({ page }) => {
  await page.goto('/el/');
  await expect(page.getByRole('heading', { name: 'Λαύκος', exact: true })).toBeVisible();
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
  await mapRegion
    .getByRole('complementary')
    .getByRole('button', { name: /Η πλατεία του Λαύκου/ })
    .click();
  await expect(page).toHaveURL(/place=lafkos-square/);
  await expect(page.getByRole('link', { name: 'Περισσότερα ↗' })).toHaveAttribute(
    'href',
    '/el/places/plateia-lafkou',
  );
});

test('place pages switch to the translated slug', async ({ page }) => {
  await page.goto('/el/places/plateia-lafkou');
  await expect(page.getByRole('heading', { name: 'Η πλατεία του Λαύκου' })).toBeVisible();
  await page.locator('footer').getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL('/en/places/lafkos-square');
  await expect(page.getByRole('heading', { name: 'Lafkos square' })).toBeVisible();
});

test('reading-lafkos story renders beautifully in Greek and switches to English', async ({
  page,
}) => {
  await page.goto('/el/stories/reading-lafkos');
  await expect(
    page.getByRole('heading', { name: 'Πώς διαβάζεται ένας ορεινός οικισμός' }),
  ).toBeVisible();
  await expect(page.locator('.story-hero-img')).toBeVisible();
  await expect(page.locator('.story-prose-body')).toBeVisible();
  await expect(page.locator('.story-sources-panel')).toBeVisible();
  await page.locator('footer').getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL('/en/stories/reading-lafkos');
  await expect(page.getByRole('heading', { name: 'How to Read a Mountain Village' })).toBeVisible();
});

test('mobile map layout features minimal header, prominent canvas, and collapsible list', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/el/map');

  // Verify minimal header and mobile language link
  const header = page.locator('.site-header');
  await expect(header).toBeVisible();
  const mobileLang = page.locator('.mobile-lang-link');
  await expect(mobileLang).toBeVisible();
  await expect(mobileLang).toHaveText('EN');

  // Verify prominent map canvas
  const mapCanvas = page.locator('.map-canvas .maplibregl-canvas');
  await expect(mapCanvas).toBeVisible();
  await expect.poll(() => mapCanvas.evaluate((el) => el.clientHeight)).toBeGreaterThan(300);

  // Verify compact action buttons
  const locateBtn = page.locator('.location-button');
  const fullscreenBtn = page.locator('.fullscreen-button');
  await expect(locateBtn).toBeVisible();
  await expect(fullscreenBtn).toBeVisible();

  // Verify collapsible places list
  const listToggle = page.locator('.list-toggle-button');
  await expect(listToggle).toBeVisible();
  const resultList = page.locator('.map-result-list');
  await expect(resultList).toBeVisible();

  // Collapse list
  await listToggle.click();
  await expect(resultList).toBeHidden();

  // Expand list again
  await listToggle.click();
  await expect(resultList).toBeVisible();
});
