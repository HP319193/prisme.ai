import { test, expect } from '@playwright/test';
import { getAccessToken } from '../getAccessToken';

const { TESTS_E2E_API_URL = '' } = process.env;

let actionsOnEnd: Function[] = [];
let workspaceId = '';

test.beforeEach(async ({ context, request }) => {
  actionsOnEnd = [];
  const token = await getAccessToken(context);
  const resp = await request.post(`${TESTS_E2E_API_URL}/workspaces`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      name: 'name tests on automations',
      description: 'description tests on automations',
    },
  });
  expect(resp.status()).toBe(200);
  workspaceId = (await resp.json())?.id;
  actionsOnEnd.push(async ({ request }) => {
    try {
      await request.delete(`${TESTS_E2E_API_URL}/workspaces/${workspaceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {}
  });
});
test.afterEach(async ({ request }) => {
  await Promise.all(actionsOnEnd.map((fn) => fn({ request })));
  actionsOnEnd = [];
});

test('create a new Automation', async ({ page, request, context, baseURL }) => {
  await page.goto(`${baseURL}/workspaces/${workspaceId}`);

  await page.getByRole('button', { name: 'Automations Automations' }).click();
  await page
    .locator('div')
    .filter({ hasText: /^AutomationsAutomations$/ })
    .getByRole('button')
    .nth(2)
    .click();
  await page
    .getByTestId('schema-form-field-values.name')
    .fill('new automation');
  await page.getByTestId('schema-form-field-values.name').press('Tab');
  await page
    .getByTestId('schema-form-field-values.slug')
    .fill('new automation');
  await page.getByTestId('schema-form-field-values.slug').press('Enter');

  await page.waitForURL((url) => {
    return !!url.pathname.match(
      `workspaces/${workspaceId}/automations/new%20automation`
    );
  });
});
