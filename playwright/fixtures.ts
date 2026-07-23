import { test as baseTest, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const AUTH_PROV = process.env.AUTH_PROV as string;
const AUTH_KOTA = process.env.AUTH_KOTA as string;
const AUTH_USERNAME = process.env.AUTH_USERNAME as string;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD as string;

export * from '@playwright/test';
export const test = baseTest.extend<{}, { workerStorageState: string }>({
  // Use the same storage state for all tests in this worker.
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  // Authenticate once per worker with a worker-scoped fixture.
  workerStorageState: [
    async ({ browser }, use) => {
      // Use parallelIndex as a unique identifier for each worker.
      const id = test.info().parallelIndex;
      const fileName = path.resolve(
        test.info().project.outputDir,
        `.auth/${id}.json`,
      );

      if (fs.existsSync(fileName)) {
        // Reuse existing authentication state if any.
        await use(fileName);
        return;
      }

      // Important: make sure we authenticate in a clean environment by unsetting storage state.
      const page = await browser.newPage({ storageState: undefined });

      // Acquire a unique account, for example create a new one.
      // Alternatively, you can have a list of precreated accounts for testing.
      // Make sure that accounts are unique, so that multiple team members
      // can run tests at the same time without interference.
      // const account = await acquireAccount(id);

      // Perform authentication steps.

      await page.goto('/auth/login', {
        timeout: 120_000,
        waitUntil: 'networkidle',
      });

      const input_prov = await page.locator('#prov-autocomplete');
      await input_prov.first().click();
      await input_prov.waitFor({ state: 'visible' });
      await input_prov.focus();
      await input_prov.fill(AUTH_PROV);

      const list_prov = await page.locator('#ngb-typeahead-0');
      await list_prov.waitFor({ state: 'visible' });
      await list_prov.getByRole('option', { name: AUTH_PROV }).first().click();

      const input_kota = await page.locator('#kabkot-autocomplete');
      await input_kota.waitFor({ state: 'visible' });
      await input_kota.focus();
      await input_kota.fill(AUTH_KOTA);

      const list_kota = await page.locator('#ngb-typeahead-1');
      await list_kota.waitFor({ state: 'visible' });
      await list_kota.getByRole('option', { name: AUTH_KOTA }).first().click();

      const input_email = await page.locator("input[name='email']");
      await input_email.waitFor({ state: 'visible' });
      await input_email.focus();
      await input_email.fill(AUTH_USERNAME);

      const input_paswd = await page.locator("input[name='password']");
      await input_paswd.waitFor({ state: 'visible' });
      await input_paswd.focus();
      await input_paswd.pressSequentially(AUTH_PASSWORD);

      await input_paswd.press('Enter');

      await page.bringToFront();

      await page.waitForURL('**/dashboard-sipd', {
        timeout: 300_000,
        waitUntil: 'networkidle',
      });

      await expect(
        page.getByRole('heading', { name: 'Dashboard Analisis' }),
      ).toBeVisible();

      // End of authentication steps.

      await page.context().storageState({ path: fileName });
      await page.close();
      await use(fileName);
    },
    { scope: 'worker' },
  ],
});
