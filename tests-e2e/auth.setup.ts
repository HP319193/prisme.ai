import { test as setup } from '@playwright/test';

const {
  TESTS_E2E_BASE_URL = '',
  TESTS_E2E_BASE_LOGIN = '',
  TESTS_E2E_BASE_PASSWORD = '',
} = process.env;

const authFile = 'tests-e2e/.auth/user.json';

setup('authenticate', async ({ page, request, context, baseURL }) => {
  const localStorage = (await context.storageState()).origins.reduce<
    Record<string, any>[] | null
  >((prev, { localStorage }) => (localStorage ? localStorage : prev), null);

  const accessToken =
    localStorage && localStorage.find(({ name }) => name === 'access-token');

  if (accessToken?.value) {
    const me = await request.get('https://api.staging.prisme.ai/v2/me', {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    });
    if (me.status() === 200) return;
  }
  await page.goto(TESTS_E2E_BASE_URL);
  await page.waitForTimeout(200);
  await page.getByPlaceholder('Email').fill(TESTS_E2E_BASE_LOGIN);
  await page.getByPlaceholder('Password').fill(TESTS_E2E_BASE_PASSWORD);
  await page.waitForTimeout(200);
  await page.getByPlaceholder('Email').press('Enter');
  await page.waitForURL(`${baseURL}/products`);
  await page.context().storageState({ path: authFile });
});
