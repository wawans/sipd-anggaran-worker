import { test, expect } from '@playwright/test';
import { error, debug, info } from '@/lib/log';
import axios from '@/lib/api';
import { matchUrl } from '@/lib/utils';
import { BASE_URL } from '@/config/app';
import { paginator } from '@/features/paginator';

test('get jadwal', async ({ page }) => {
  test.setTimeout(3600_000); // 60 * 60 * 1000

  page.on('response', async (response) => {
    const url = response.url(); // urlMatches();
    const base = BASE_URL;
    const path = url.replace(base, '');

    if (response.status() != 200 || path.includes('.')) return;

    let endpoint = null;

    matchUrl('**/api/master/tahapan/list_budget/**', url, base) &&
      (endpoint = '/api/master/tahap');
    matchUrl('**/api/jadwal/anggaran_jadwal/list', url, base) &&
      (endpoint = '/api/master/jadwal');

    if (endpoint) {
      try {
        const body = await response.json();
        await expect(body).toHaveProperty('data');

        // Special case data => body.data.data
        const xhr = await axios.post(endpoint, {
          data: !Array.isArray(body.data) ? body.data?.data : body.data,
        });
        await expect(xhr.status).toBe(200);
        // OR
        // await expect.soft(xhr.status).toBe(200);
      } catch (e) {
        error('Getter.Error: ' + endpoint, e);
        throw new Error('Getter.Error');
      }
    }
  });

  await page.goto('/penganggaran/jadwal', {
    timeout: 300_000,
    waitUntil: 'networkidle',
  });

  // Expects page to...
  await expect(page.getByText('Items per page:')).toBeVisible();

  while (true) {
    const nextButton = page.getByRole('button', { name: 'Next page' });
    if ((await nextButton.isVisible()) && (await nextButton.isEnabled())) {
      await nextButton.click();
      await page.waitForLoadState('networkidle', { timeout: 300_000 });
      // sleep
      await page.waitForTimeout(1000);
    } else {
      break;
    }
  }

  await page.waitForLoadState('networkidle', { timeout: 300_000 });
  // sleep
  await page.waitForTimeout(1000);
  // Expects page to...
  await expect(page.getByText('Items per page:')).toBeVisible();
});
