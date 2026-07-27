import { test, expect } from '@playwright/test';
import { paginator } from '@/features/paginator';
import axios from '@/lib/api';
import { error, debug, info } from '@/lib/log';
import { worker } from './worker';

test('get all sub kegiatan from skpd', async ({ page }) => {
  test.setTimeout(86400_000); // 24 * 60 * 60 * 1000

  page.on('response', async (response) => await worker(response));

  const res = await axios
    .get('/api/anggaran/skpd?status=1')
    .then((r) => r.data);
  debug(`total data: ${res.data.length}`);

  for (const item of res.data) {
    await test.step(`get sub kegiatan from skpd ${item.nama_skpd}`, async () => {
      info(`get sub kegiatan from skpd ${item.nama_skpd}`);

      await page.goto(
        '/penganggaran/anggaran/cascading/belanja?id_skpd=' + item.id_skpd,
        {
          timeout: 300_000,
          waitUntil: 'networkidle',
        },
      );

      // Loop
      await paginator(page);

      await page.waitForLoadState('networkidle', { timeout: 300_000 });
      // sleep
      await page.waitForTimeout(1000);
      // Expects page to...
      await expect(page.getByText('Items per page:')).toBeVisible();
    });
    // mark item as done
    try {
      const xhr = await axios.put('/api/anggaran/skpd/' + item.id, {
        status_getter: false,
      });
      await expect.soft(xhr.status).toBe(200);
    } catch (e) {
      error('Worker.Error: ', 'Update Worker Status Failed! ', e);
      // don't throw error, just log it.
      // throw new Error('Worker.Error: done')
    }
  }
});
