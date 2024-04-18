import { test, expect } from '@playwright/test';

test('Navigation in ProductLayout pages', async ({ page }) => {
  const baseURL = 'https://test-product-layout.pages.staging.prisme.ai';
  await page.goto(baseURL);
  await expect(page.locator('.product-layout-sidebar')).not.toHaveClass(
    'product-layout-sidebar--open'
  );
  await page.getByText('TTest product').click();
  await expect(page.locator('.product-layout-sidebar')).toHaveClass(
    /product-layout-sidebar--open/
  );
  await expect(page.getByText('Test product')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Home Home' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Settings Settings' })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Home', exact: true })
  ).toBeVisible();
  await expect(page.getByText('Hello World')).toBeVisible();
  await page.getByRole('button', { name: 'Settings Settings' }).click();
  await page.waitForURL(`${baseURL}/en/settings`);
  await expect(
    page.getByRole('button', { name: 'Simple settings' })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Advanced settings' })
  ).toBeVisible();
  await expect(page.getByText('Hello World')).toBeVisible();
  await page
    .locator('div')
    .filter({ hasText: /^TTest product$/ })
    .getByRole('link')
    .click();
  await page.waitForURL(`${baseURL}/en`);
});
