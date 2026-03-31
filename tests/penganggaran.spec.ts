import { test, expect, } from '@playwright/test';
import { log, debug, info } from '../lib/log';
import axios from '../lib/api';

test('get skpd', async ({ page }) => {
    // page.on('response', response => log({ response }));
    const responsePromise = page.waitForResponse('**/api/renja/sub_bl/list_skpd');

    await page.goto('/penganggaran/anggaran/cascading?pageIndex=1&pageSize=100', {
        timeout: 300_000,
        waitUntil: "networkidle"
    });

    const response = await responsePromise;
    await expect(response.ok()).toBeTruthy()

    if (response.ok()) {
        const body = await response.json();
        await expect(body).toHaveProperty('data');

        try {
            const xhr = await axios.post('/api/getter/anggaran/skpd', { data: body.data });
            await expect(xhr.status).toBe(200);
        }
        catch (e) {
            debug('Getter.Error', e)
            throw new Error('Getter.Error')
        }
    }

    // Expects page to...
    await expect(page.getByText('Items per page:')).toBeVisible();
});

test('get all sub kegiatan from skpd', async ({ page }) => {
    test.setTimeout(360000000); // 60 * 60 * 1000

    const res = await axios.get('/api/getter/anggaran/skpd').then(r => r.data);

    for (const item of res.data) {
        debug(`get sub kegiatan from skpd ${item.nama_skpd}`)
        const responsePromise = page.waitForResponse('**/api/renja/sub_bl/list_belanja_by_tahun_daerah_unit');

        await page.goto('/penganggaran/anggaran/cascading/belanja?id_skpd=' + item.id_skpd, {
            timeout: 300_000,
            waitUntil: "networkidle"
        });

        const response = await responsePromise;
        await expect(response.ok()).toBeTruthy()

        if (response.ok()) {
            const body = await response.json();
            await expect(body).toHaveProperty('data');

            try {
                const xhr = await axios.post('/api/getter/anggaran/belanja/sub', { data: body.data });
                await expect(xhr.status).toBe(200);
            }
            catch (e) {
                debug('Getter.Error', e)
                throw new Error('Getter.Error')
            }
        }

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
        // sleep
        await page.waitForTimeout(1000);
        // Expects page to...
        await expect(page.getByText('Items per page:')).toBeVisible();
    }
});

test('get all rinci from each sub kegiatan', async ({ page }) => {
    test.setTimeout(86400_000); // 24 * 60 * 60 * 1000

    page.on('response', async (response) => {
        const url = response.url(); // urlMatches();
        const path = url.replace('https://sipd-ri.kemendagri.go.id', '');

        if (response.status() != 200 || path.includes('.')) return;

        let endpoint = null;

        switch (path) {
            case '/api/renja/dana_sub_bl/get_by_id_sub_bl':
                endpoint = '/api/getter/anggaran/belanja/sub/dana';
                break;
            case '/api/renja/rinci_sub_bl/get_by_id_sub_bl':
                endpoint = '/api/getter/anggaran/belanja/sub/rinci';
                break;
            case '/api/renja/subs_sub_bl/find_by_id_list':
                endpoint = '/api/getter/anggaran/belanja/sub/sub';
                break;
            case '/api/renja/ket_sub_bl/find_by_id_list':
                endpoint = '/api/getter/anggaran/belanja/sub/ket';
                break;
            case '/api/renja/sub_bl/list_belanja_by_tahun_daerah_unit':
                endpoint = '/api/getter/anggaran/belanja/sub';
                break;
            case '/api/renja/sub_bl/list_skpd':
                endpoint = '/api/getter/anggaran/skpd';
                break;
            default:
                break;
        }
        if (endpoint) {
            try {
                const body = await response.json();
                const xhr = await axios.post(endpoint, { data: body.data });
                await expect(xhr.status).toBe(200);
                // OR
                // await expect.soft(xhr.status).toBe(200);
            }
            catch (e) {
                debug('Getter.Error: ' + endpoint, e)
                throw new Error('Getter.Error')
            }
        }
    });

    const res = await axios.get('/api/getter/anggaran/belanja/sub').then(r => r.data);

    for (const item of res.data) {
        await test.step(`get rinci from [${item.nama_sub_skpd}]: ${item.nama_sub_giat}`, async () => {
            info(`get rinci from [${item.nama_sub_skpd}]: ${item.nama_sub_giat}`)

            await page.goto('/penganggaran/anggaran/cascading/rincian/sub-kegiatan/' + item.id_sub_bl, {
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
            // sleep
            await page.waitForTimeout(1000);
            // Expects page to...
            await expect(page.getByText('Items per page:')).toBeVisible();
        })
    }
});
