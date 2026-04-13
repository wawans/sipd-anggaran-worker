import { Page, expect } from '@playwright/test';

// '2147483647'
// '1000'
// '500'
// '100'
// '50'
// '20'
// '10'

export async function paginator(page: Page, size: string = '100') {
    // Expects page to...
    await expect(page.getByText('Items per page:')).toBeVisible();

    const pageSize = await page.locator('.mat-paginator-page-size-select').first();
    await pageSize.waitFor({ state: 'visible' });
    await pageSize.click();

    const pageSizeOption = await page.locator('mat-option', { hasText: size }).first();
    await pageSizeOption.waitFor({ state: 'visible' });
    await pageSizeOption.click();

    while (true) {
        const nextButton = page.getByRole('button', { name: 'Next page' });
        if (await nextButton.isVisible() && await nextButton.isEnabled()) {
            await nextButton.click();
            await page.waitForLoadState('networkidle', { timeout: 300_000 });
            // sleep
            await page.waitForTimeout(1000);
        }
        else {
            break;
        }
    }
}