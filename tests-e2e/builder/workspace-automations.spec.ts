import { test, expect } from '@playwright/test';
import { getAccessToken } from '../getAccessToken';

const { TESTS_E2E_API_URL = '' } = process.env;

let actionsOnEnd: Function[] = [];
let workspaceId = '';

test.beforeEach(async ({ context, request }) => {
  const token = await getAccessToken(context);
  actionsOnEnd = [];
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

test('create a new Automation', async ({ page, baseURL }) => {
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

test.describe('Insert instructions', () => {
  let automationSlug = '';
  test.beforeEach(async ({ context, request }) => {
    const token = await getAccessToken(context);
    const respAutomation = await request.post(
      `${TESTS_E2E_API_URL}/workspaces/${workspaceId}/automations`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          do: [],
          name: 'test all instructions',
          slug: 'test all instructions',
        },
      }
    );
    const { slug } = await respAutomation.json();
    automationSlug = slug;
  });

  test('insert emit instruction', async ({ page, baseURL }) => {
    await page.goto(
      `${baseURL}/workspaces/${workspaceId}/automations/${automationSlug}`
    );

    await page.getByTestId('automation-builder-add-0').click();
    await expect(page.getByTestId('panel')).toHaveClass(/-translate-x-full/);
    await page.getByTestId('automation-builder-instruction-emit').click();
    await page.getByTestId('schema-form-field-values.event').click();
    await page.getByTestId('schema-form-field-values.event').fill('event');
    await page.locator('.ace_content').click();
    await page.locator('textarea').fill('{"foo": "bar"}');
    await page.getByTestId('panel-close-btn').click();
    await expect(page.getByTestId('panel')).not.toHaveClass(
      /-translate-x-full/
    );

    let body = '';
    page.on('request', (request) => {
      body = request.postData() || '';
    });
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(body).toBe(
      '{"do":[{"emit":{"target":{"currentSocket":true},"options":{"persist":true},"autocomplete":{},"event":"event","payload":{"foo":"bar"}}}],"name":"test all instructions","slug":"test all instructions"}'
    );
  });

  test('insert wait instruction', async ({ page, baseURL }) => {
    await page.goto(
      `${baseURL}/workspaces/${workspaceId}/automations/${automationSlug}`
    );
    await page.getByTestId('automation-builder-add-0').click();
    await expect(page.getByTestId('panel')).toHaveClass(/-translate-x-full/);
    await page.getByTestId('automation-builder-instruction-wait').click();
    await page.getByLabel('One of these events:').click();
    await page
      .getByTestId('schema-form-field-values.oneOf[0].event')
      .fill('wait for it');
    await page.getByTestId('schema-form-field-values.timeout').fill('30');
    await page.getByTestId('panel-close-btn').click();
    await expect(page.getByTestId('panel')).not.toHaveClass(
      /-translate-x-full/
    );

    let body = '';
    page.on('request', (request) => {
      body = request.postData() || '';
    });
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(body).toBe(
      '{"do":[{"wait":{"oneOf":[{"filters":{},"event":"wait for it"}],"timeout":30}}],"name":"test all instructions","slug":"test all instructions"}'
    );
  });
  test('insert set instruction', async ({ page, baseURL }) => {
    await page.goto(
      `${baseURL}/workspaces/${workspaceId}/automations/${automationSlug}`
    );
    await page.getByTestId('automation-builder-add-0').click();
    await expect(page.getByTestId('panel')).toHaveClass(/-translate-x-full/);
    await page.getByTestId('automation-builder-instruction-set').click();

    await page.getByTestId('schema-form-field-values.name').fill('foo');
    await page.locator('textarea').fill('{{bar}}');

    await page.getByTestId('panel-close-btn').click();
    await expect(page.getByTestId('panel')).not.toHaveClass(
      /-translate-x-full/
    );

    let body = '';
    page.on('request', (request) => {
      body = request.postData() || '';
    });
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(body).toBe(
      '{"do":[{"set":{"name":"foo","value":"{{bar}}"}}],"name":"test all instructions","slug":"test all instructions"}'
    );
  });
  test('insert delete instruction', async ({ page, baseURL }) => {
    await page.goto(
      `${baseURL}/workspaces/${workspaceId}/automations/${automationSlug}`
    );
    await page.getByTestId('automation-builder-add-0').click();
    await expect(page.getByTestId('panel')).toHaveClass(/-translate-x-full/);
    await page.getByTestId('automation-builder-instruction-delete').click();

    await page.getByTestId('schema-form-field-values.name').fill('foo');

    await page.getByTestId('panel-close-btn').click();
    await expect(page.getByTestId('panel')).not.toHaveClass(
      /-translate-x-full/
    );

    let body = '';
    page.on('request', (request) => {
      body = request.postData() || '';
    });
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(body).toBe(
      '{"do":[{"delete":{"name":"foo"}}],"name":"test all instructions","slug":"test all instructions"}'
    );
  });

  test('insert conditions instruction', async ({ page, baseURL }) => {
    await page.goto(
      `${baseURL}/workspaces/${workspaceId}/automations/${automationSlug}`
    );
    await page.getByTestId('automation-builder-add-0').click();
    await expect(page.getByTestId('panel')).toHaveClass(/-translate-x-full/);
    await page.getByTestId('automation-builder-instruction-conditions').click();

    await page.getByRole('button', { name: 'Add condition' }).click();
    await page.getByTestId('schema-form-field-values').fill('{{foo}}');
    await page.getByTestId('panel-close-btn').click();
    await expect(page.getByTestId('panel')).not.toHaveClass(
      /-translate-x-full/
    );
    await page.mouse.move(200, 200);
    await page.mouse.down();
    await page.mouse.move(-300, 300);
    await page.mouse.up();

    await page.getByTestId('automation-builder-add-undefined').first().click();
    await expect(page.getByTestId('panel')).toHaveClass(/-translate-x-full/);
    await page.getByTestId('automation-builder-instruction-set').click();
    await page.getByTestId('schema-form-field-values.name').fill('foo');
    await page.getByTestId('panel').locator('textarea').fill('{{bar}}');
    await page.getByTestId('panel-close-btn').click();
    await expect(page.getByTestId('panel')).not.toHaveClass(
      /-translate-x-full/
    );

    await page.getByTestId('automation-builder-add-undefined').click();
    await expect(page.getByTestId('panel')).toHaveClass(/-translate-x-full/);
    await page.getByTestId('automation-builder-instruction-set').click();
    await page.getByTestId('schema-form-field-values.name').fill('foo');
    await page.getByTestId('panel').locator('textarea').fill('{{bar}}');
    await page.getByTestId('panel-close-btn').click();
    await expect(page.getByTestId('panel')).not.toHaveClass(
      /-translate-x-full/
    );

    await page.mouse.move(200, 200);
    await page.mouse.down();
    await page.mouse.move(-300, 0);
    await page.mouse.up();

    await page.getByRole('button', { name: 'Add condition' }).click();
    await expect(page.getByTestId('panel')).toHaveClass(/-translate-x-full/);
    await page.getByTestId('schema-form-field-values').click();
    await page
      .getByTestId('schema-form-field-values')
      .fill('{{otherCondition}}');
    await page.getByTestId('panel-close-btn').click();
    await expect(page.getByTestId('panel')).not.toHaveClass(
      /-translate-x-full/
    );

    await page.getByTestId('automation-builder-add-undefined').click();
    await expect(page.getByTestId('panel')).toHaveClass(/-translate-x-full/);
    await page.getByTestId('automation-builder-instruction-set').click();
    await page.getByTestId('schema-form-field-values.name').click();
    await page.getByTestId('schema-form-field-values.name').fill('foo');
    await page.locator('.ace_content').click();
    await page
      .getByTestId('panel')
      .locator('textarea')
      .fill('{{anotherValue}}');
    await page.getByTestId('panel-close-btn').click();
    await expect(page.getByTestId('panel')).not.toHaveClass(
      /-translate-x-full/
    );
    let body = '';
    page.on('request', (request) => {
      body = request.postData() || '';
    });
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(body).toBe(
      '{"do":[{"conditions":{"{{foo}}":[{"set":{"name":"foo","value":"{{bar}}"}}],"{{otherCondition}}":[{"set":{"name":"foo","value":"{{anotherValue}}"}}],"default":[{"set":{"name":"foo","value":"{{bar}}"}}]}}],"name":"test all instructions","slug":"test all instructions"}'
    );
  });

  test('insert repeat instruction', async ({ page, baseURL }) => {
    await page.goto(
      `${baseURL}/workspaces/${workspaceId}/automations/${automationSlug}`
    );
    await page.getByTestId('automation-builder-add-0').click();
    await expect(page.getByTestId('panel')).toHaveClass(/-translate-x-full/);
    await page.getByTestId('automation-builder-instruction-repeat').click();

    await page.getByTestId('schema-form-field-values.on').fill('{{list}}');
    await page.getByTestId('schema-form-field-values.until').fill('42');
    await page.getByTestId('panel-close-btn').click();
    await expect(page.getByTestId('panel')).not.toHaveClass(
      /-translate-x-full/
    );

    await page.getByTestId('automation-builder-add-0').nth(1).click();
    await expect(page.getByTestId('panel')).toHaveClass(/-translate-x-full/);
    await page.getByTestId('automation-builder-instruction-set').click();
    await page.getByTestId('schema-form-field-values.name').fill('foo');
    await page.locator('textarea').fill('{{bar}}');
    await page.getByTestId('panel-close-btn').click();
    await expect(page.getByTestId('panel')).not.toHaveClass(
      /-translate-x-full/
    );

    let body = '';
    page.on('request', (request) => {
      body = request.postData() || '';
    });
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(body).toBe(
      '{"do":[{"repeat":{"on":"{{list}}","do":[{"set":{"name":"foo","value":"{{bar}}"}}],"until":42}}],"name":"test all instructions","slug":"test all instructions"}'
    );
  });

  test('insert all instruction', async ({ page, baseURL }) => {
    await page.goto(
      `${baseURL}/workspaces/${workspaceId}/automations/${automationSlug}`
    );
    await page.getByTestId('automation-builder-add-0').click();
    await expect(page.getByTestId('panel')).toHaveClass(/-translate-x-full/);
    await page.getByTestId('automation-builder-instruction-all').click();
    await expect(page.getByTestId('panel')).not.toHaveClass(
      /-translate-x-full/
    );

    await page.mouse.move(200, 200);
    await page.mouse.down();
    await page.mouse.move(0, -200);
    await page.mouse.up();

    await page.getByTestId('automation-builder-add-0').nth(1).click();
    await expect(page.getByTestId('panel')).toHaveClass(/-translate-x-full/);
    await page.getByTestId('automation-builder-instruction-set').click();
    await page.getByTestId('schema-form-field-values.name').fill('foo');
    await page.locator('textarea').fill('{{bar}}');
    await page.getByTestId('panel-close-btn').click();
    await expect(page.getByTestId('panel')).not.toHaveClass(
      /-translate-x-full/
    );

    await page.getByTestId('automation-builder-add-1').first().click();
    await expect(page.getByTestId('panel')).toHaveClass(/-translate-x-full/);
    await page.getByTestId('automation-builder-instruction-set').click();
    await page.getByTestId('schema-form-field-values.name').fill('bar');
    await page.locator('textarea').fill('{{foo}}');
    await page.getByTestId('panel-close-btn').click();
    await expect(page.getByTestId('panel')).not.toHaveClass(
      /-translate-x-full/
    );

    let body = '';
    page.on('request', (request) => {
      body = request.postData() || '';
    });
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(body).toBe(
      '{"do":[{"all":[{"set":{"name":"foo","value":"{{bar}}"}},{"set":{"name":"bar","value":"{{foo}}"}}]}],"name":"test all instructions","slug":"test all instructions"}'
    );
  });

  test('insert break instruction', async ({ page, baseURL }) => {
    await page.goto(
      `${baseURL}/workspaces/${workspaceId}/automations/${automationSlug}`
    );
    await page.getByTestId('automation-builder-add-0').click();
    await expect(page.getByTestId('panel')).toHaveClass(/-translate-x-full/);
    await page.getByTestId('automation-builder-instruction-break').click();
    await page.getByTestId('panel-close-btn').click();
    await expect(page.getByTestId('panel')).not.toHaveClass(
      /-translate-x-full/
    );

    await page.mouse.move(200, 200);
    await page.mouse.down();
    await page.mouse.move(0, -100);
    await page.mouse.up();

    await page.getByTestId('automation-builder-add-1').click();
    await expect(page.getByTestId('panel')).toHaveClass(/-translate-x-full/);
    await page.getByTestId('automation-builder-instruction-break').click();

    await page.getByLabel('Scope').click();
    await page.getByText('All', { exact: true }).click();
    await page.getByTestId('panel-close-btn').click();
    await expect(page.getByTestId('panel')).not.toHaveClass(
      /-translate-x-full/
    );

    await page.mouse.move(200, 200);
    await page.mouse.down();
    await page.mouse.move(0, -100);
    await page.mouse.up();

    await page.getByTestId('automation-builder-add-2').click();
    await expect(page.getByTestId('panel')).toHaveClass(/-translate-x-full/);
    await page.getByTestId('automation-builder-instruction-break').click();

    await page.getByLabel('Scope').click();
    await page.getByText('This automation', { exact: true }).click();
    await page.getByTestId('panel-close-btn').click();
    await expect(page.getByTestId('panel')).not.toHaveClass(
      /-translate-x-full/
    );

    let body = '';
    page.on('request', (request) => {
      body = request.postData() || '';
    });
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(body).toBe(
      '{"do":[{"break":{}},{"break":{"scope":"all"}},{"break":{"scope":"automation"}}],"name":"test all instructions","slug":"test all instructions"}'
    );
  });

  test('insert fetch instruction', async ({ page, baseURL }) => {
    await page.goto(
      `${baseURL}/workspaces/${workspaceId}/automations/${automationSlug}`
    );
    await page.getByTestId('automation-builder-add-0').click();
    await expect(page.getByTestId('panel')).toHaveClass(/-translate-x-full/);
    await page.getByTestId('automation-builder-instruction-fetch').click();

    await page
      .getByTestId('schema-form-field-values.url')
      .fill('https://prisme.ai');
    await page.getByLabel('HTTP method').click();
    await page.getByText('GET', { exact: true }).click();
    await page.getByTestId('schema-form-field-values.output').click();
    await page.getByTestId('schema-form-field-values.output').fill('output');
    await page.getByTestId('panel-close-btn').click();
    await expect(page.getByTestId('panel')).not.toHaveClass(
      /-translate-x-full/
    );

    let body = '';
    page.on('request', (request) => {
      body = request.postData() || '';
    });
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(body).toBe(
      '{"do":[{"fetch":{"emitErrors":true,"stream":{"target":{"currentSocket":true},"options":{"persist":true}},"outputMode":"body","headers":{},"query":{},"url":"https://prisme.ai","method":"get","output":"output"}}],"name":"test all instructions","slug":"test all instructions"}'
    );
  });
});
