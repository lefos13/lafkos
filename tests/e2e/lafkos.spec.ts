/*
 * These browser checks cover the critical public journey without depending on
 * a third-party CMS or a live GPS position. Map tiles may stream separately,
 * so assertions focus on the accessible list and URL contract as well.
 */

import { expect, test } from '@playwright/test';

test('root URL redirects seamlessly to default Greek locale', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/el\/?$/);
  await expect(page.getByRole('heading', { name: 'Λαύκος', exact: true })).toBeVisible();
});

test('Greek home exposes static map teaser, explore CTA, and bilingual navigation', async ({
  page,
}) => {
  await page.goto('/el/');
  await expect(page.getByRole('heading', { name: 'Λαύκος', exact: true })).toBeVisible();
  const mapSection = page.getByRole('region', { name: 'Βρες τον δρόμο σου.' });
  await expect(mapSection).toBeVisible();
  await mapSection.scrollIntoViewIfNeeded();
  const mapCta = mapSection.getByRole('link', { name: /Άνοιγμα Διαδραστικού Χάρτη/ });
  await expect(mapCta).toBeVisible();
  await expect(mapCta).toHaveAttribute('href', '/el/map/');
  await page.locator('footer').getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL('/en/');
  await expect(page.getByRole('heading', { name: 'Lafkos', exact: true })).toBeVisible();
});

test('Greek map page exposes interactive canvas, filters, and bilingual navigation', async ({
  page,
}) => {
  await page.goto('/el/map/');
  const mapRegion = page.locator('.map-explorer');
  await expect(mapRegion).toBeVisible();
  const mapCanvas = page.locator('.map-canvas .maplibregl-canvas');
  await expect(mapCanvas).toBeVisible();
  await expect.poll(() => mapCanvas.evaluate((element) => element.clientHeight)).toBeGreaterThan(0);
  await mapRegion.getByRole('button', { name: 'Ιστορία' }).click();
  await expect(page).toHaveURL(/categories=heritage/);
  await expect(page.getByRole('link', { name: /Μουσείο Φάμπα — περισσότερα/ })).toBeVisible();
});

test('a selected map result creates a shareable place URL', async ({ page }) => {
  await page.goto('/el/map/');
  const mapRegion = page.locator('.map-explorer');
  await mapRegion.scrollIntoViewIfNeeded();
  await mapRegion
    .getByRole('complementary')
    .getByRole('button', { name: /Η πλατεία του Λαύκου/ })
    .click();
  await expect(page).toHaveURL(/place=lafkos-square/);
  await expect(page.getByRole('link', { name: 'Περισσότερα ↗' })).toHaveAttribute(
    'href',
    '/el/places/plateia-lafkou/',
  );
});

test('place pages switch to the translated slug', async ({ page }) => {
  await page.goto('/el/places/plateia-lafkou/');
  await expect(page.getByRole('heading', { name: 'Η πλατεία του Λαύκου' })).toBeVisible();
  await page.locator('footer').getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL('/en/places/lafkos-square/');
  await expect(page.getByRole('heading', { name: 'Lafkos square' })).toBeVisible();
});

test('reading-lafkos story renders beautifully in Greek and switches to English', async ({
  page,
}) => {
  await page.goto('/el/stories/reading-lafkos/');
  await expect(
    page.getByRole('heading', { name: 'Πώς διαβάζεται ένας ορεινός οικισμός' }),
  ).toBeVisible();
  await expect(page.locator('.story-hero-img')).toBeVisible();
  await expect(page.locator('.story-prose-body')).toBeVisible();
  await expect(page.locator('.story-sources-panel')).toBeVisible();
  await page.locator('footer').getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL('/en/stories/reading-lafkos/');
  await expect(page.getByRole('heading', { name: 'How to Read a Mountain Village' })).toBeVisible();
});

test('mobile map layout features minimal header, prominent canvas, and collapsible list', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/el/map/');

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

test('direct road path link frames route and shows drive route popover badge', async ({ page }) => {
  await page.goto('/el/map/?trail=lafkos-paltsi-drive');
  const mapCanvas = page.locator('.map-canvas .maplibregl-canvas');
  await expect(mapCanvas).toBeVisible();
  const popover = page.locator('.map-popover-content');
  await expect(popover).toBeVisible();
  await expect(popover.locator('.map-popover-badge')).toHaveText('Οδική διαδρομή');
  await expect(popover.locator('.map-popover-title')).toHaveText('Οδική διαδρομή Λαύκος – Πάλτση');
});

test('selecting road path updates URL and highlights drive route', async ({ page }) => {
  await page.goto('/el/map/');
  const mapRegion = page.locator('.map-explorer');
  await expect(mapRegion).toBeVisible();

  // Search for the drive route
  const searchInput = page.locator('#map-search');
  await searchInput.fill('Πάλτση');
  const driveButton = page
    .locator('.map-result-button')
    .filter({ hasText: 'Οδική διαδρομή Λαύκος – Πάλτση' });
  await expect(driveButton).toBeVisible();
  await driveButton.click();

  await expect(page).toHaveURL(/trail=lafkos-paltsi-drive/);
  const popover = page.locator('.map-popover-content');
  await expect(popover).toBeVisible();
  await expect(popover.locator('.map-popover-badge')).toHaveText('Οδική διαδρομή');
});

test('entity pages embed their YouTube video and pages without one stay iframe-free', async ({
  page,
}) => {
  await page.goto('/el/trails/lafkos-mousges-agios-spiridona/');
  const trailVideo = page.locator("iframe[src*='RH7zxUEjgjU']");
  await expect(trailVideo).toBeVisible();

  await page.goto('/el/places/plateia-lafkou/');
  const placeVideo = page.locator("iframe[src*='fV_O4f-pccE']");
  await expect(placeVideo).toBeVisible();

  // A trail without videoUrl must not render any embed at all.
  await page.goto('/el/trails/profitis-ilias-trail/');
  await expect(page.locator('iframe')).toHaveCount(0);
});
test('clicking on an overlapping place marker and route prioritizes the place over the route', async ({
  page,
}) => {
  // Frame the map on Metochi where the potistika-drive route passes directly through
  await page.goto('/el/map/?place=metochi');
  const mapRegion = page.locator('.map-explorer');
  await expect(mapRegion).toBeVisible();

  // Close initial popover
  const closeBtn = page.locator('.maplibregl-popup-close-button');
  await expect(closeBtn).toBeVisible();
  await closeBtn.click();
  await expect(closeBtn).toBeHidden();

  // Metochi marker is now right in the center of the map
  const metochiMarker = page.locator('.map-marker-btn[aria-label="Μέτοχι"]');
  await expect(metochiMarker).toBeVisible();
  await metochiMarker.click();

  // URL must remain focused on the place and NOT switch to the overlapping drive route
  await expect(page).toHaveURL(/place=metochi/);
  const popover = page.locator('.map-popover-content');
  await expect(popover).toBeVisible();
  await expect(popover.locator('.map-popover-title')).toHaveText('Μέτοχι');
  await expect(popover.locator('.map-popover-badge')).toContainText('Καθημερινή ζωή');
});
