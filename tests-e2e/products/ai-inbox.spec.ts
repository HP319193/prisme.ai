import { test, expect } from '@playwright/test';
import path from 'path';

const { TESTS_E2E_BASE_LOGIN = '', TESTS_E2E_BASE_PASSWORD = '' } = process.env;
const authFile = 'tests-e2e/.auth/user.json';
const baseUrl = 'https://ai-knowledge-inbox.pages.prisme.ai/fr';

test.describe.configure({ mode: 'serial' });
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

test.describe('Teams list', () => {
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
    await fileChooser.setFiles(
      path.join(__dirname, '../assets/prisme-logo.png')
    );
    await page.getByTestId('schema-form-field-values.name').press('Enter');
    let createdId = '';
    await page.waitForURL((url: URL) => {
      if (url.pathname === '/fr/inbox') {
        createdId = url.searchParams.get('team') || '';
        return true;
      }
      return false;
    });
    await expect(
      page.getByText('name new team for test').nth(1)
    ).toBeAttached();
    await expect(
      page.getByText('description new team for test')
    ).toBeAttached();
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
    await page.waitForFunction(() => {
      // @ts-ignore
      return window.Prisme.ai.events;
    });

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
    await expect(
      page.getByRole('button', { name: 'A Team' })
    ).not.toBeAttached();
  });
});

test.describe('Channels', () => {
  test.describe.configure({ mode: 'serial' });
  let createdId = '';
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('button', { name: 'Créer une équipe' }).click();

    await page
      .getByTestId('schema-form-field-values.name')
      .fill('name testing channels');
    await page
      .getByTestId('schema-form-field-values.description')
      .fill('description testing channels');
    await page.getByTestId('schema-form-field-values.name').press('Enter');
    createdId = '';
    await page.waitForURL((url: URL) => {
      if (url.pathname === '/fr/inbox') {
        createdId = url.searchParams.get('team') || '';
        return true;
      }
      return false;
    });
  });
  test.afterEach(async ({ page }) => {
    if (!createdId) return;
    await page.goto(`${baseUrl}/deleteTeam?team=${createdId}`);
  });

  test('List empty channels', async ({ page }) => {
    await page.goto(baseUrl);

    await page.getByRole('link', { name: 'name testing channels' }).click();

    await page.getByRole('button', { name: 'Canaux Canaux' }).click();

    await expect(
      page.getByRole('cell', { name: 'Aucune donnée' })
    ).toBeAttached();
  });

  test('Add channels', async ({ page }) => {
    await page.goto(baseUrl);

    await page.getByRole('link', { name: 'name testing channels' }).click();

    await page.getByRole('button', { name: 'Canaux Canaux' }).click();

    // Add a new canal
    await page
      .getByRole('button', { name: 'Ajouter un nouveau canal' })
      .click();
    await page.getByLabel('Projet AI Knowledge').click();
    await page.getByText('Projet de test').click();
    await page.getByRole('button', { name: 'Envoyer' }).click();
    await expect(
      page.getByRole('cell', { name: 'Projet de test' })
    ).toBeAttached();
    await expect(page.getByText('Le canal a bien été ajouté')).toBeAttached();

    // Try to add it again
    await page
      .getByRole('button', { name: 'Ajouter un nouveau canal' })
      .click();
    await page.getByLabel('Projet AI Knowledge').click();
    await page
      .locator('.ant-select-dropdown')
      .getByText('Projet de test')
      .click();
    await page.getByRole('button', { name: 'Envoyer' }).click();

    await expect(page.getByText('Ce canal existe déjà.')).toBeAttached();
  });

  test('Delete channels', async ({ page }) => {
    await page.goto(baseUrl);

    await page.getByRole('link', { name: 'name testing channels' }).click();

    await page.getByRole('button', { name: 'Canaux Canaux' }).click();

    // Add a new canal
    await page
      .getByRole('button', { name: 'Ajouter un nouveau canal' })
      .click();
    await page.getByLabel('Projet AI Knowledge').click();
    await page.getByText('Projet de test').click();
    await page.getByRole('button', { name: 'Envoyer' }).click();
    await expect(
      page.getByRole('cell', { name: 'Projet de test' })
    ).toBeAttached();
    await expect(page.getByText('Le canal a bien été ajouté')).toBeAttached();

    // Try to add it again
    await page.getByRole('button', { name: 'Supprimer le canal' }).click();
    await page.getByRole('button', { name: 'Oui' }).click();

    await expect(
      page.getByRole('cell', { name: 'Aucune donnée' })
    ).toBeAttached();
  });
});

test.describe('Inbox', () => {
  test.describe.configure({ mode: 'serial' });
  let createdId = '';
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('button', { name: 'Créer une équipe' }).click();

    await page
      .getByTestId('schema-form-field-values.name')
      .fill('name testing channels');
    await page
      .getByTestId('schema-form-field-values.description')
      .fill('description testing channels');
    await page.getByTestId('schema-form-field-values.name').press('Enter');
    createdId = '';
    await page.waitForURL((url: URL) => {
      if (url.pathname === '/fr/inbox') {
        createdId = url.searchParams.get('team') || '';
        return true;
      }
      return false;
    });
    // Add a new canal
    await page.getByRole('button', { name: 'Canaux Canaux' }).click();
    await page
      .getByRole('button', { name: 'Ajouter un nouveau canal' })
      .click();
    await page.getByLabel('Projet AI Knowledge').click();
    await page.getByText('Projet de test').click();
    await page.getByRole('button', { name: 'Envoyer' }).click();
    await expect(
      page.getByRole('cell', { name: 'Projet de test' })
    ).toBeAttached();
    await expect(page.getByText('Le canal a bien été ajouté')).toBeAttached();
  });
  test.afterEach(async ({ page }) => {
    if (!createdId) return;
    await page.goto(`${baseUrl}/deleteTeam?team=${createdId}`);
  });

  test('Display inbox conversations', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('link', { name: 'name testing channels' }).click();
    await expect(
      page.getByText('👈 Choisissez une conversation')
    ).toBeAttached();
    await expect(page.locator('a.conversation').first()).toBeAttached();
    await page.locator('a.conversation').first().click();
    await expect(page.locator('.pr-block-dialog-box')).toBeAttached();
  });
});
