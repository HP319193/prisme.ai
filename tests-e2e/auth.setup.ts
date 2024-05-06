import { test as setup } from '@playwright/test';
import { getAccessToken } from './getAccessToken';

const {
  TESTS_E2E_BASE_URL = '',
  TESTS_E2E_API_URL = '',
  TESTS_E2E_BASE_LOGIN = '',
  TESTS_E2E_BASE_PASSWORD = '',
} = process.env;

const authFile = 'tests-e2e/.auth/user.json';

setup('authenticate', async ({ page, request, context, baseURL }) => {
  const accessToken = await getAccessToken(
    context,
    new URL(baseURL || '').hostname
  );
  if (accessToken) {
    const me = await request.get(`${TESTS_E2E_API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (me.status() === 200) return;
  }
  await page.goto(TESTS_E2E_BASE_URL);
  await page.waitForURL((url) => {
    return url.searchParams.has('interaction');
  });
  await page.getByPlaceholder('Email').fill(TESTS_E2E_BASE_LOGIN);
  await page.getByPlaceholder('Password').fill(TESTS_E2E_BASE_PASSWORD);
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(`${baseURL}/products`);
  await page.context().storageState({ path: authFile });
});
