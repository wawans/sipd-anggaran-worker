import { test, expect } from '@playwright/test';
import { TAHUN } from '@/config/app';
import { paginator } from '@/features/paginator';
import axios from '@/lib/api';
import { error, debug, info } from '@/lib/log';
import { worker } from './worker';

test('get all rinci from each sub kegiatan', async ({ page }) => {
  test.setTimeout(86400_000); // 24 * 60 * 60 * 1000

  page.on('response', async (response) => await worker(response));

  const res = await axios
    .get('/api/anggaran/belanja/sub?status=1&tahun=' + TAHUN)
    .then((r) => r.data);
  debug(`total data: ${res.data.length}`);

  for (const item of res.data) {
    await test.step(`get rinci from [${item.nama_sub_skpd}]: ${item.nama_sub_giat}`, async () => {
      info(`get rinci from [${item.nama_sub_skpd}]: ${item.nama_sub_giat}`);

      await page.goto(
        '/penganggaran/anggaran/cascading/rincian/sub-kegiatan/' +
          item.id_sub_bl,
        {
          timeout: 300_000,
          waitUntil: 'networkidle',
        },
      );

      // Loop
      await paginator(page, '2147483647');

      await page.waitForLoadState('networkidle', { timeout: 300_000 });
      // sleep
      await page.waitForTimeout(1000);
      // Expects page to...
      await expect(page.getByText('Items per page:')).toBeVisible();
    });
    // mark item as done
    try {
      const xhr = await axios.put('/api/anggaran/belanja/sub/' + item.id, {
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
