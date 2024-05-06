import { test, expect } from '@playwright/test';
import path from 'path';

const { TESTS_E2E_BASE_LOGIN = '', TESTS_E2E_BASE_PASSWORD = '' } = process.env;
const authFile = 'tests-e2e/.auth/user.json';
const baseUrl = 'https://ai-knowledge-inbox.pages.prisme.ai/fr';

test.beforeEach(async ({ page }) => {
  await page.goto(baseUrl);

  try {
    await expect(
      page.getByRole('button', {
        name: 'Me connecter',
      })
    ).toBeAttached({ timeout: 500 });
  } catch {
    return;
  }
  await page
    .getByRole('button', {
      name: 'Me connecter',
    })
    .click();
  await page.waitForURL((url) => {
    return url.searchParams.has('interaction');
  });
  await page.getByPlaceholder('E-mail').fill(TESTS_E2E_BASE_LOGIN);
  await page.getByPlaceholder('Mot de passe').fill(TESTS_E2E_BASE_PASSWORD);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL(baseUrl);
  await page.context().storageState({ path: authFile });
});
test('Display AI Inbox', async ({ page }) => {
  await page.goto(baseUrl);

  await expect(
    page.getByTestId('schema-form-field-values.search')
  ).toBeAttached();

  await expect(
    page.getByRole('button', { name: 'Créer une équipe' })
  ).toBeAttached();
});

test('Create a team', async ({ page }) => {
  await page.goto(baseUrl);

  await page.getByRole('button', { name: 'Créer une équipe' }).click();

  await page
    .getByTestId('schema-form-field-values.name')
    .fill('name new team for test');
  await page
    .getByTestId('schema-form-field-values.description')
    .fill('description new team for test');

  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByTestId('schema-form-field-values.img').click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.join(__dirname, '../assets/prisme-logo.png'));
  await page.getByTestId('schema-form-field-values.name').press('Enter');
  let createdId = '';
  await page.waitForURL((url: URL) => {
    if (url.pathname === '/fr/inbox') {
      createdId = url.searchParams.get('team') || '';
      return true;
    }
    return false;
  });
  await expect(page.getByText('name new team for test').nth(1)).toBeAttached();
  await expect(page.getByText('description new team for test')).toBeAttached();
  await expect(
    page.locator('span').filter({ hasText: 'name new team for test' })
  ).toBeAttached();
  await page
    .locator('div')
    .filter({ hasText: /^Nname new team for test$/ })
    .getByRole('link')
    .click();
  await page.waitForURL(baseUrl);
  await expect(
    page.locator(`[href="/fr/inbox?team=${createdId}"]`)
  ).toBeAttached();

  // delete
  await page.goto(`${baseUrl}/deleteTeam?team=${createdId}`);
});

test('Search a team', async ({ page }) => {
  const framesSent: string[] = [];
  page.on('websocket', (ws) => {
    ws.on('framesent', (event) => {
      framesSent.push(event.payload.toString());
    });
  });

  await page.goto(baseUrl);
  await page.getByTestId('schema-form-field-values.search').focus();
  await page.getByTestId('schema-form-field-values.search').fill('équipe');
  await page.getByTestId('schema-form-field-values.search').focus();
  await page.waitForTimeout(1000);
  await page.keyboard.press('Enter');
  await expect(framesSent).toContain(
    '42/v2/workspaces/iGsXZ6I/events,["event",{"type":"filter teams","payload":{"search":"équipe"}}]'
  );
  await expect(
    page.getByRole('button', { name: 'Une équipe Une équipe' })
  ).toBeAttached();
  await expect(
    page.getByRole('button', { name: 'Une autre équipe' })
  ).toBeAttached();
  await expect(page.getByRole('button', { name: 'A Team' })).not.toBeAttached();
});
