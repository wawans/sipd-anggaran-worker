import { test, expect } from '@playwright/test';

test('goto pengumuman', async ({ page }) => {
  await page.goto('/dashboard/pusat', {
    timeout: 120_000,
    waitUntil: 'networkidle',
  });

  // Expect a title "to contain" a substring.
  // await expect(page).toHaveTitle(/Playwright/);

  // Click the get started link.
  // await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading "Pengumuman".
  await expect(
    page.locator('#kt_content_container').getByText('Pengumuman'),
  ).toBeVisible();

  await page.goto('', {
    timeout: 120_000,
    waitUntil: 'networkidle',
  });

  page.close();
});
