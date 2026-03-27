import { test as setup, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL as string;

const AUTH_PROV = process.env.AUTH_PROV as string;
const AUTH_KOTA = process.env.AUTH_KOTA as string;
const AUTH_USERNAME = process.env.AUTH_USERNAME as string;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD as string;

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  await page.goto('/dashboard-sipd', {
    timeout: 120_000,
    waitUntil: "networkidle"
  });

  if (page.url() !== `${BASE_URL}/auth/login`) {
    return;
  }

  // Perform authentication steps.

  await page.goto('/auth/login', {
    timeout: 120_000,
    waitUntil: "networkidle"
  });

  const input_prov = await page.locator("#prov-autocomplete");
  await input_prov.first().click();
  await input_prov.waitFor({ state: 'visible' });
  await input_prov.focus();
  await input_prov.fill(AUTH_PROV);

  const list_prov = await page.locator('#ngb-typeahead-0');
  await list_prov.waitFor({ state: 'visible' });
  await list_prov.getByRole('option', { name: AUTH_PROV }).first().click()

  const input_kota = await page.locator("#kabkot-autocomplete")
  await input_kota.waitFor({ state: 'visible' });
  await input_kota.focus()
  await input_kota.fill(AUTH_KOTA)

  const list_kota = await page.locator("#ngb-typeahead-1")
  await list_kota.waitFor({ state: 'visible' });
  await list_kota.getByRole('option', { name: AUTH_KOTA }).first().click()

  const input_email = await page.locator("input[name='email']")
  await input_email.waitFor({ state: 'visible' })
  await input_email.focus()
  await input_email.fill(AUTH_USERNAME)

  const input_paswd = await page.locator("input[name='password']")
  await input_paswd.waitFor({ state: 'visible' });
  await input_paswd.focus()
  await input_paswd.pressSequentially(AUTH_PASSWORD)

  await input_paswd.press('Enter')

  await page.bringToFront();

  await page.waitForURL("**/dashboard-sipd", {
    timeout: 300_000,
    waitUntil: "networkidle"
  })

  await expect.soft(
    // page.getByRole('heading', { name: 'Dashboard Analisis' })
    page.getByRole('link', { name: 'Pengumuman' })
  ).toBeVisible({
    timeout: 300_000,
  });

  // End of authentication steps.

  await page.context().storageState({ path: authFile });
});

