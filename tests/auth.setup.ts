import { test as setup, expect } from '@playwright/test';
import {
  BASE_URL,
  TAHUN,
  AUTH_PROV,
  AUTH_KOTA,
  AUTH_USERNAME,
  AUTH_PASSWORD,
  AUTH_FILE,
} from '@/config/app';

setup('authenticate', async ({ page }) => {
  await page.goto('/dashboard-sipd', {
    timeout: 120_000,
    waitUntil: 'networkidle',
  });

  if (page.url() !== `${BASE_URL}/auth/login`) {
    return;
  }

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
  // OR
  // await page.getByRole('button', { name: 'Login' }).click();

  await page.bringToFront();

  // Captcha
  const modal = await page.getByRole('dialog');
  await modal.waitFor({ state: 'visible' });

  const robot = await modal.getByText('Apakah kamu robot ?');
  await robot.waitFor({ state: 'visible' });

  const canvas = await modal.locator('#captcahCanvas');
  await canvas.waitFor({ state: 'visible' });

  const input_captcha = await modal.getByRole('textbox');
  await input_captcha.waitFor({ state: 'visible' });
  await input_captcha.focus(); // .click();
  // await input_captcha.pressSequentially(AUTH_PASSWORD);
  // await input_captcha.fill(AUTH_PASSWORD);
  // await modal.getByRole('button', { name: 'Check' }).click();

  // Tahun
  await page.waitForURL('**/tahun/list', {
    timeout: 300_000,
    waitUntil: 'networkidle',
  });

  const input_tahun = await page.getByRole('combobox');
  input_tahun.waitFor({ state: 'visible', timeout: 300_000 });
  input_tahun.selectOption(TAHUN);

  const btn_login = await page.getByRole('button', { name: 'Masuk' });
  btn_login.waitFor({ state: 'visible' });
  btn_login.click();

  await page.waitForURL('**/dashboard-sipd', {
    timeout: 300_000,
    waitUntil: 'networkidle',
  });

  await expect
    .soft(
      // page.getByRole('heading', { name: 'Dashboard Analisis' })
      page.getByRole('link', { name: 'Pengumuman' }),
    )
    .toBeVisible({
      timeout: 300_000,
    });

  // End of authentication steps.

  await page.context().storageState({ path: AUTH_FILE });
});
