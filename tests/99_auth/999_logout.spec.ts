import { test, expect } from '@playwright/test';
import { error, debug, info } from '@/lib/log';
import axios from '@/lib/api';
import { matchUrl } from '@/lib/utils';
import { BASE_URL, AUTH_FILE } from '@/config/app';
import { paginator } from '@/features/paginator';

test('logout account', async ({ page }) => {
  test.setTimeout(3600_000); // 60 * 60 * 1000

  await page.goto('/dashboard-sipd', {
    timeout: 120_000,
    waitUntil: 'networkidle',
  });

  const profile = await page.locator('#kt_header_user_menu_toggle');
  await profile.waitFor({ state: 'visible' });
  await profile.first().click();

  const signout = await profile
    .locator('.menu-link', { hasText: 'Sign Out' })
    .first();
  await signout.waitFor({ state: 'visible' });
  await signout.click();

  await page.waitForURL('**/auth/login', {
    waitUntil: 'load',
    timeout: 300_000,
  });

  await page.waitForLoadState('networkidle', { timeout: 300_000 });
  // sleep
  await page.waitForTimeout(1000);

  // Clear all cookies for the current context
  await page.context().clearCookies();

  // Clear local storage and session storage
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // Reload the page to confirm you are logged out
  await page.reload();
  // Expects page to...
  await expect(page).toHaveURL(/.*login/);

  await page.context().storageState({ path: AUTH_FILE });
});
