import { test, expect } from '@playwright/test';
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
  const token = await getAccessToken(context, new URL(baseURL || '').hostname);
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

  // Install app Custom Code
  await request.post(`${TESTS_E2E_API_URL}/workspaces/${id}/apps`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      appSlug: 'Custom Code',
      slug: 'Custom Code',
      config: {
        functions: {
          doSomething: {
            code: '',
            language: 'nodejs',
            parameters: {
              foo: {
                type: 'string',
              },
              bar: {
                type: 'object',
              },
            },
          },
        },
      },
    },
  });
  // Create automation
  const respAutomation = await request.post(
    `${TESTS_E2E_API_URL}/workspaces/${id}/automations`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        do: [],
        name: 'test',
        slug: 'test',
      },
    }
  );
  const { slug } = await respAutomation.json();

  expect(slug).toBeDefined();

  await page.goto(`${baseURL}/workspaces/${id}/automations/${slug}`);

  // The test start here
  await page
    .locator('.react-flow__node > div:nth-child(3) > div > .flex')
    .click();
  await page.getByRole('button', { name: 'Run function right' }).click();
  await page.getByLabel('Function').click();
  await page.getByTitle('doSomething').locator('div').click();
  await page.getByTestId('schema-form-field-values.foo').click();
  await page.getByTestId('schema-form-field-values.foo').fill('value');
  await page.locator('.ace_content').click();
  await page.locator('textarea').fill('{"ba": "papa"}');

  let body = '';
  page.on('request', (request) => {
    body = request.postData() || '';
  });
  await expect(
    await page.getByRole('button', { name: 'Save' })
  ).not.toHaveAttribute('disabled');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(body).toBe(
    '{"do":[{"Custom Code.run function":{"function":"doSomething","parameters":{"foo":"value","bar":{"ba":"papa"}}}}],"name":"test","slug":"test"}'
  );

  await page.reload();
  await page.getByRole('button', { name: 'Run function edit' }).click();
  await page.waitForTimeout(100);
  await expect(page.getByTestId('schema-form-field-values.foo')).toHaveValue(
    'value'
  );
  await expect(
    page
      .locator('#ace-editor div')
      .filter({ hasText: '{ "ba": "papa"}' })
      .nth(1)
  ).toBeAttached();
});
