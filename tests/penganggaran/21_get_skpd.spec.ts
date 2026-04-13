import { test, expect } from '@playwright/test';
import { error, debug, info } from '../../lib/log';
import { worker } from './worker'

test('get skpd', async ({ page }) => {
    page.on('response', async response => await worker(response));

    await page.goto('/penganggaran/anggaran/cascading?pageIndex=1&pageSize=100', {
        timeout: 300_000,
        waitUntil: "networkidle"
    });

    await page.waitForLoadState('networkidle', { timeout: 300_000 });
    // sleep
    await page.waitForTimeout(1000);

    // Expects page to...
    await expect(page.getByText('Items per page:')).toBeVisible();
});