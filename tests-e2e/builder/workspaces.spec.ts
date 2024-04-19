import { test, expect } from '@playwright/test';
import path from 'path';
import { getAccessToken } from '../getAccessToken';

const { TESTS_E2E_API_URL = '' } = process.env;

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

test('create workspace', async ({ page, baseURL, request, context }) => {
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
    // Delete it
    await request.delete(`${TESTS_E2E_API_URL}/workspaces/${createdId}`, {
      headers: {
        Authorization: `Bearer ${await getAccessToken(context)}`,
      },
    });
  }
});

test('delete workspace from workspaces list', async ({
  page,
  baseURL,
  request,
  context,
}) => {
  const resp = await request.post(`${TESTS_E2E_API_URL}/workspaces`, {
    headers: {
      Authorization: `Bearer ${await getAccessToken(context)}`,
    },
    data: {
      name: 'name test to delete',
      description: 'description test to delete',
    },
  });
  expect(resp.status()).toBe(200);
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
