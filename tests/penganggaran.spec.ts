import { test, expect, } from '@playwright/test';
import { log } from '../lib/log';
import axios from '../lib/api';

test('skpd', async ({ page }) => {
    // page.on('response', response => log({ response }));
    const responsePromise = page.waitForResponse('**/api/renja/sub_bl/list_skpd');

    await page.goto('/penganggaran/anggaran/cascading', {
        timeout: 300_000,
        waitUntil: "networkidle"
    });

    const response = await responsePromise;

    // Expects page to...
    await expect(page.getByText('Items per page:')).toBeVisible();

    if (response.ok()) {
        const body = await response.json();

        console.log('body >>', body)
    }
});

test('skpd_kegiatan', async ({ page }) => {
    // page.on('response', response => log({ response }));

    await page.goto('/penganggaran/anggaran/cascading/belanja?id_skpd=' + 1690, {
        timeout: 300_000,
        waitUntil: "networkidle"
    });

    // Expects page to...
    await expect(page.getByText('Items per page:')).toBeVisible();

    const pageSize = await page.locator('.mat-paginator-page-size-select').first();
    await pageSize.waitFor({ state: 'visible' });
    await pageSize.click();

    const pageSizeOption = await page.locator('mat-option', { hasText: '100' });
    await pageSizeOption.waitFor({ state: 'visible' });
    await pageSizeOption.click();

    while (true) {
        const nextButton = page.getByRole('button', { name: 'Next page' });
        if (await nextButton.isVisible() && await nextButton.isEnabled()) {
            await nextButton.click();
            // sleep
            await page.waitForTimeout(1000);
        }
        else {
            break;
        }
    }

    await page.waitForLoadState('networkidle', { timeout: 300_000 });
    // Expects page to...
    await expect(page.getByText('Items per page:')).toBeVisible();
});

test('skpd_sub_kegiatan', async ({ page }) => {
    // page.on('response', response => log({ response }));

    await page.goto('/penganggaran/anggaran/cascading/rincian/sub-kegiatan/' + 227349, {
        timeout: 300_000,
        waitUntil: "networkidle"
    });

    // Expects page to...
    await expect(page.getByText('Items per page:')).toBeVisible();

    const pageSize = await page.locator('.mat-paginator-page-size-select').first();
    await pageSize.waitFor({ state: 'visible' });
    await pageSize.click();

    const pageSizeOption = await page.locator('mat-option', { hasText: '2147483647' });
    await pageSizeOption.waitFor({ state: 'visible' });
    await pageSizeOption.click();

    while (true) {
        const nextButton = page.getByRole('button', { name: 'Next page' });
        if (await nextButton.isVisible() && await nextButton.isEnabled()) {
            await nextButton.click();
            // sleep
            // await page.waitForTimeout(1000);
            await page.waitForLoadState('networkidle', { timeout: 300_000 });
            // Expects page to...
            await expect(page.getByText('Items per page:')).toBeVisible();
        }
        else {
            break;
        }
    }

    await page.waitForLoadState('networkidle', { timeout: 300_000 });
    // Expects page to...
    await expect(page.getByText('Items per page:')).toBeVisible();
});
