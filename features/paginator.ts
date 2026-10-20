import { Page, expect } from '@playwright/test';

export const PAGE_SIZE_ALL = '2147483647';
export const PAGE_SIZE_1000 = '1000';
export const PAGE_SIZE_500 = '500';
export const PAGE_SIZE_100 = '100';
export const PAGE_SIZE_50 = '50';
export const PAGE_SIZE_20 = '20';
export const PAGE_SIZE_10 = '10';

export const PAGE_SIZE_EN = 'Items per page:';
export const PAGE_SIZE_ID = 'Data per halaman:';

export const PAGE_NEXT_EN = 'Next page';
export const PAGE_NEXT_ID = 'Halaman berikutnya';

export const PAGE_LANG: 'en' | 'id' = 'en'

export async function paginator(page: Page, size: string = '100', locale: typeof PAGE_LANG = 'en') {
  // Expects page to...
  await expect(page.getByText(locale === 'id' ? PAGE_SIZE_ID : PAGE_SIZE_EN)).toBeVisible({ timeout: 100_000 });

  const pageSize = await page
    .locator('.mat-paginator-page-size-select')
    .first();
  await pageSize.waitFor({ state: 'visible' });
  await pageSize.click();

  const pageSizeOption = await page
    .locator('mat-option', { hasText: size })
    .first();
  await pageSizeOption.waitFor({ state: 'visible' });
  await pageSizeOption.click();

  while (true) {
    const nextButton = page.getByRole('button', { name: locale === 'id' ? PAGE_NEXT_ID : PAGE_NEXT_EN });
    if ((await nextButton.isVisible()) && (await nextButton.isEnabled())) {
      await nextButton.click();
      await page.waitForLoadState('networkidle', { timeout: 300_000 });
      // sleep
      await page.waitForTimeout(1000);
    } else {
      break;
    }
  }
}
