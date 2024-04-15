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
});

test('create workspace', async ({ page, baseURL, request, context }) => {
  await page.goto(`${baseURL}/workspaces`);
  await expect(page.getByText('Create a workspace')).toBeAttached();
  await page.getByText('Create a workspace').click();
  await page.waitForURL(`${baseURL}/workspaces/new`);

  await expect(page.getByText('Name of new Workspace')).toBeAttached();
  await expect(page.locator('.pr-form input[type=text]')).toBeAttached();
  await page.locator('.pr-form input[type=text]').fill('A test Workspace name');
  await page.locator('.pr-form textarea').fill('A test Workspace description');
  await page.waitForTimeout(200);
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.locator('.pr-form input[type=file]').click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.join(__dirname, '../assets/prisme-logo.png'));
  await page.locator('.pr-form input[type=text]').press('Enter');
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
