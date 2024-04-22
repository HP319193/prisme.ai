import { test, expect } from '@playwright/test';
import path from 'path';
import { getAccessToken } from '../getAccessToken';

const { TESTS_E2E_API_URL = '' } = process.env;

let actionsOnEnd: Function[] = [];

test.beforeEach(() => {
  actionsOnEnd = [];
});
test.afterEach(async ({ request }) => {
  await Promise.all(actionsOnEnd.map((fn) => fn({ request })));
  actionsOnEnd = [];
});

test('display arguments in CustomCode.run instruction', async ({
  page,
  request,
  context,
  baseURL,
}) => {
  const token = await getAccessToken(context);
  const resp = await request.post(`${TESTS_E2E_API_URL}/workspaces`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      name: 'name display arguments in CustomCode.run instruction ',
      description:
        'description display arguments in CustomCode.run instruction',
    },
  });
  expect(resp.status()).toBe(200);
  const id = (await resp.json())?.id;
  actionsOnEnd.push(async ({ request }) => {
    try {
      await request.delete(`${TESTS_E2E_API_URL}/workspaces/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {}
  });
  await page.goto(`${baseURL}/workspaces/${id}`);

  await page.getByRole('button', { name: 'Apps Apps' }).click();
  await page
    .locator('div')
    .filter({ hasText: /^AppsApps$/ })
    .getByRole('button')
    .nth(2)
    .click();
  await page.getByRole('heading', { name: 'Custom Code', exact: true }).click();
  await page.getByRole('button', { name: 'code See code' }).click();
  await page.getByRole('textbox').selectText();
  await page.getByRole('textbox').fill(`slug: Custom Code
config:
  functions:
    doSomething:
      code: ''
      language: nodejs
      parameters:
        foo:
          type: string
`);
  await expect(
    await page.getByRole('button', { name: 'Save' })
  ).not.toHaveAttribute('disabled');
  await page.getByRole('button', { name: 'Save' }).click();

  // The test start here
  await page
    .locator('div')
    .filter({ hasText: /^AutomationsAutomations$/ })
    .getByRole('button')
    .nth(2)
    .click();
  await page.getByTestId('schema-form-field-values.name').fill('test');
  await page.getByTestId('schema-form-field-values.name').press('Tab');
  await page.getByTestId('schema-form-field-values.slug').fill('test');
  await page.getByTestId('schema-form-field-values.slug').press('Enter');
  await page
    .locator('.react-flow__node > div:nth-child(3) > div > .flex')
    .click();
  await page.getByRole('button', { name: 'Run function right' }).click();
  await page.getByLabel('Function').click();
  await page.getByTitle('doSomething').locator('div').click();
  await page.getByTestId('schema-form-field-values.foo').click();
  await page.getByTestId('schema-form-field-values.foo').fill('value');
  await expect(
    await page.getByRole('button', { name: 'Save' })
  ).not.toHaveAttribute('disabled');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Run function edit' }).click();
  await page.waitForTimeout(100);
  await expect(page.getByTestId('schema-form-field-values.foo')).toHaveValue(
    'value'
  );
  await page.getByText('doSomething').click();
  await page.locator('.ant-select-item-option-content').first().click();
  await page.getByRole('button', { name: 'code See code' }).click();
  await expect(
    page
      .locator('#ace-editor div')
      .filter({ hasText: 'slug: testname: testdo: -' })
      .nth(1)
  ).toBeAttached();
});
