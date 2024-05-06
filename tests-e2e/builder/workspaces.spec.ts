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

test('enter builder', async ({ page, baseURL }) => {
  await page.goto(baseURL || '');
  await page.waitForURL(`${baseURL}/products`);
  await expect(
    page.getByText('Create and manage your products')
  ).toBeAttached();
  await page.getByText('Create and manage your products').click();
  await page.waitForURL(`${baseURL}/workspaces`);
});

test('list workspaces', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/workspaces`);
  await expect(page.getByText('Create a workspace')).toBeAttached();
  await expect(
    page.getByRole('link', { name: 'Test Product Layout' })
  ).toBeAttached();
  await expect(
    page.getByRole('link', { name: 'Second test workspace title' })
  ).toBeAttached();
  await expect(
    page.getByRole('link', { name: 'Third test workspace title' })
  ).toBeAttached();
});

test('create workspace', async ({ page, baseURL, context }) => {
  await page.goto(`${baseURL}/workspaces`);
  await expect(page.getByText('Create a workspace')).toBeAttached();
  await page.getByText('Create a workspace').click();
  await page.waitForURL(`${baseURL}/workspaces/new`);

  await expect(page.getByText('Name of new Workspace')).toBeAttached();
  await expect(
    page.getByTestId('schema-form-field-values.name')
  ).toBeAttached();
  await page
    .getByTestId('schema-form-field-values.name')
    .fill('A test Workspace name');
  await page
    .getByTestId('schema-form-field-values.description')
    .fill('A test Workspace description');
  await page.waitForTimeout(200);
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByTestId('schema-form-field-values.photo').click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.join(__dirname, '../assets/prisme-logo.png'));
  await page.getByTestId('schema-form-field-values.name').press('Enter');
  let createdId = '';
  await page.waitForURL((url: URL) => {
    const [, id] = url.pathname.split('/en/workspaces/');
    if (id !== 'new') {
      createdId = id;
    }
    return id !== 'new';
  });

  await page.goto(`${baseURL}/workspaces`);
  await expect(page.getByText('A test Workspace name')).toBeAttached();

  if (createdId) {
    const token = await getAccessToken(
      context,
      new URL(baseURL || '').hostname
    );
    actionsOnEnd.push(async ({ request }) => {
      const resp = await request.delete(
        `${TESTS_E2E_API_URL}/workspaces/${createdId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    });
  }
});

test('delete workspace from workspaces list', async ({
  page,
  baseURL,
  request,
  context,
}) => {
  const token = await getAccessToken(context, new URL(baseURL || '').hostname);
  const resp = await request.post(`${TESTS_E2E_API_URL}/workspaces`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      name: 'name test to delete',
      description: 'description test to delete',
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
  await page.goto(`${baseURL}/workspaces`);
  await expect(
    page.getByRole('link', { name: 'name test to delete Edit' })
  ).toBeAttached();
  await page.getByRole('link', { name: 'name test to delete Edit' }).hover();
  await page
    .getByRole('link', { name: 'name test to delete Edit' })
    .getByRole('button')
    .click();
  await page.getByRole('button', { name: 'Delete Workspace' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await expect(
    page.getByRole('link', { name: 'name test to delete Edit' })
  ).not.toBeAttached();
});

test('duplicate workspace from workspaces list', async ({
  page,
  baseURL,
  request,
  context,
}) => {
  const token = await getAccessToken(context, new URL(baseURL || '').hostname);
  const resp = await request.post(`${TESTS_E2E_API_URL}/workspaces`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      name: 'name test to duplicate',
      description: 'description test to duplicate',
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
  await page.goto(`${baseURL}/workspaces`);
  await page.getByRole('link', { name: 'name test to duplicate Edit' }).hover();
  await page
    .getByRole('link', { name: 'name test to duplicate Edit' })
    .getByRole('button')
    .click();
  await page.getByRole('button', { name: 'Duplicate' }).click();
  let duplicateId;
  await page.waitForURL((url) => {
    if (!url) return false;
    const [, dId] = url.pathname.split('workspaces/');
    if (!dId) return false;
    duplicateId = dId;
    return true;
  });
  actionsOnEnd.push(async ({ request }) => {
    try {
      await request.delete(`${TESTS_E2E_API_URL}/workspaces/${duplicateId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {}
  });
});

test('search workspace', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/workspaces`);
  await expect(page.getByPlaceholder('Search a workspace')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Test Product Layout Test' })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Second test workspace title' })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Third test workspace title' })
  ).toBeVisible();
  await page.getByPlaceholder('Search a workspace').click();
  await page.getByPlaceholder('Search a workspace').fill('third');
  await expect(
    page.getByRole('link', { name: 'Test Product Layout Test' })
  ).not.toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Second test workspace title' })
  ).not.toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Third test workspace title' })
  ).toBeVisible();

  await page.getByPlaceholder('Search a workspace').fill('');
  await expect(
    page.getByRole('link', { name: 'Test Product Layout Test' })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Second test workspace title' })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Third test workspace title' })
  ).toBeVisible();
});
