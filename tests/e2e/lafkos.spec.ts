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

test('dense map markers form accessible clusters that expand on activation', async ({ page }) => {
  await page.goto('/el/map/');
  const mapCanvas = page.locator('.map-canvas .maplibregl-canvas');
  await expect(mapCanvas).toBeVisible();

  /* Cluster controls remain native buttons so keyboard and assistive-technology
   * users receive the same zoom-to-expand interaction as pointer users. */
  const clusters = page.locator('.map-cluster-btn');
  const clusterCounts = await clusters.allTextContents();
  const largestClusterIndex = clusterCounts.reduce(
    (bestIndex, count, index) =>
      Number(count) > Number(clusterCounts[bestIndex]) ? index : bestIndex,
    0,
  );
  const cluster = clusters.nth(largestClusterIndex);
  await expect(cluster).toBeVisible();
  await expect(cluster).toHaveAttribute('aria-label', /Μεγέθυνση για προβολή \d+ σημείων/);
  await expect
    .poll(() => cluster.evaluate((element) => getComputedStyle(element).transitionProperty))
    .not.toContain('transform');

  await cluster.focus();
  await cluster.press('Enter');
  await expect
    .poll(() => {
      const view = new URL(page.url()).searchParams.get('view');
      return Number(view?.split(',')[2] ?? 0);
    })
    .toBeGreaterThan(13.6);

  await expect(page.locator('.map-cluster-btn:focus, .map-marker-btn:focus')).toBeVisible();
  await page.getByRole('button', { name: 'Zoom in' }).click();
  await expect(clusters).toHaveCount(0);
  await expect(page.locator('.map-marker-btn').first()).toBeVisible();
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

test('place detail page exposes privacy-preserving bilingual share quick actions and copy feedback', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/el/places/plateia-lafkou/');

  const shareSection = page.locator('.share-actions');
  await expect(shareSection).toBeVisible();
  await expect(shareSection.locator('.share-actions-label')).toHaveText('Κοινοποίηση:');

  // Verify Facebook link
  const fbLink = shareSection.locator('.share-btn--facebook');
  await expect(fbLink).toBeVisible();
  await expect(fbLink).toHaveAttribute('target', '_blank');
  await expect(fbLink).toHaveAttribute('rel', 'noopener noreferrer');
  const fbHref = await fbLink.getAttribute('href');
  expect(fbHref).toContain('facebook.com/sharer/sharer.php');
  expect(fbHref).toContain(
    encodeURIComponent('https://lafkos-guide.vercel.app/el/places/plateia-lafkou/'),
  );

  // Verify X link
  const xLink = shareSection.locator('.share-btn--x');
  await expect(xLink).toBeVisible();
  await expect(xLink).toHaveAttribute('target', '_blank');
  await expect(xLink).toHaveAttribute('rel', 'noopener noreferrer');
  const xHref = await xLink.getAttribute('href');
  expect(xHref).toContain('x.com/intent/post');
  expect(xHref).toContain(
    encodeURIComponent('https://lafkos-guide.vercel.app/el/places/plateia-lafkou/'),
  );

  // Verify WhatsApp link
  const waLink = shareSection.locator('.share-btn--whatsapp');
  await expect(waLink).toBeVisible();
  await expect(waLink).toHaveAttribute('target', '_blank');
  await expect(waLink).toHaveAttribute('rel', 'noopener noreferrer');
  const waHref = await waLink.getAttribute('href');
  expect(waHref).toContain('wa.me');
  expect(waHref).toContain(
    encodeURIComponent('https://lafkos-guide.vercel.app/el/places/plateia-lafkou/'),
  );

  // Verify Copy Link action and live region feedback
  const copyBtn = shareSection.locator('.share-btn--copy');
  await expect(copyBtn).toBeVisible();
  await expect(copyBtn).toHaveText(/Αντιγραφή συνδέσμου/);

  await copyBtn.click();
  await expect(copyBtn).toHaveAttribute('data-copied', 'true');
  await expect(copyBtn).toHaveText(/Ο σύνδεσμος αντιγράφηκε!/);
  const statusEl = shareSection.locator('.share-status');
  await expect(statusEl).toHaveText('Ο σύνδεσμος αντιγράφηκε!');
});

test('English place detail page provides localized English share labels and copy feedback', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/en/places/lafkos-square/');

  const shareSection = page.locator('.share-actions');
  await expect(shareSection).toBeVisible();
  await expect(shareSection.locator('.share-actions-label')).toHaveText('Share:');

  const copyBtn = shareSection.locator('.share-btn--copy');
  await expect(copyBtn).toHaveText(/Copy link/);
  await copyBtn.click();
  await expect(copyBtn).toHaveText(/Link copied!/);
  const statusEl = shareSection.locator('.share-status');
  await expect(statusEl).toHaveText('Link copied!');
});
test('native web share button progressively unhides when navigator.share is available', async ({
  page,
}) => {
  // Inject a mock navigator.share before page loads
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      value: async () => {},
      configurable: true,
      writable: true,
    });
  });
  await page.goto('/el/places/plateia-lafkou/');
  const nativeBtn = page.locator('.share-btn--native');
  await expect(nativeBtn).toBeVisible();
  await expect(nativeBtn).toHaveText(/Κοινοποίηση/);
});

test('share actions layout is responsive and touch-friendly on mobile 390px viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/el/places/plateia-lafkou/');

  const shareSection = page.locator('.share-actions');
  await expect(shareSection).toBeVisible();

  // Verify touch target dimensions (height >= 44px) on all visible buttons
  const visibleButtons = shareSection.locator('.share-btn:not([hidden])');
  const count = await visibleButtons.count();
  expect(count).toBeGreaterThanOrEqual(4);
  for (let i = 0; i < count; i++) {
    const box = await visibleButtons.nth(i).boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  }

  // Verify no horizontal overflow at 390px
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(hasHorizontalScroll).toBe(false);
});

test('trail and story detail pages render share quick actions seamlessly in both locales', async ({
  page,
}) => {
  await page.goto('/el/trails/kalderimi-lafkos-milina/');
  await expect(page.locator('.share-actions')).toBeVisible();

  await page.goto('/en/trails/historic-kalderimi-lafkos-milina/');
  await expect(page.locator('.share-actions')).toBeVisible();

  await page.goto('/el/stories/reading-lafkos/');
  await expect(page.locator('.share-actions')).toBeVisible();

  await page.goto('/en/stories/reading-lafkos/');
  await expect(page.locator('.share-actions')).toBeVisible();
});

test('keyboard navigation cycles through share action controls with visible focus', async ({
  page,
}) => {
  await page.goto('/el/places/plateia-lafkou/');

  const fbLink = page.locator('.share-btn--facebook');
  await fbLink.focus();
  await expect(fbLink).toBeFocused();

  await page.keyboard.press('Tab');
  const xLink = page.locator('.share-btn--x');
  await expect(xLink).toBeFocused();

  await page.keyboard.press('Tab');
  const waLink = page.locator('.share-btn--whatsapp');
  await expect(waLink).toBeFocused();

  await page.keyboard.press('Tab');
  const copyBtn = page.locator('.share-btn--copy');
  await expect(copyBtn).toBeFocused();
});
