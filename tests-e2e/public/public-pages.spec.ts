import { test, expect } from '@playwright/test';

test('Display prisme.ai home', async ({ page }) => {
  let lastFrameSent = '';
  page.on('websocket', (ws) => {
    ws.on('framesent', (event) => {
      lastFrameSent = event.payload.toString();
    });
  });

  await page.goto('https://www.prisme.ai/fr');
  await page
    .locator('div')
    .filter({ hasText: /^Technologie$/ })
    .getByRole('button')
    .click();
  await page.getByRole('button', { name: 'Builder' }).click();
  await page.getByRole('button', { name: 'AI knowledge' }).click();
  await page.getByRole('button', { name: 'AI store' }).click();
  await page.getByRole('button', { name: 'AI Inbox - AI Evaluate' }).click();
  await page
    .locator('div')
    .filter({ hasText: /^Tarifs$/ })
    .getByRole('button')
    .click();
  await page.getByRole('button', { name: 'Contact', exact: true }).click();
  await page.getByPlaceholder('Nom complet').click();
  await page.getByPlaceholder('Nom complet').fill('test');
  await page.getByPlaceholder('Email professionnel').click();
  await page.getByPlaceholder('Email professionnel').fill('test@test.com');
  await page.getByPlaceholder('Email professionnel').press('Tab');
  await page.getByPlaceholder('Numéro de téléphone').fill('0000000000');
  await page.getByPlaceholder('Nom de l’entreprise').click();
  await page.getByPlaceholder('Nom de l’entreprise').fill('test');
  await page.getByPlaceholder('Poste au sein de l’entreprise').click();
  await page.getByPlaceholder('Poste au sein de l’entreprise').fill('test');
  await page.getByPlaceholder('Que voulez vous nous dire ?').click();
  await page.getByPlaceholder('Que voulez vous nous dire ?').fill('Je teste');
  await page.getByRole('button', { name: 'Envoyer' }).click();
  expect(lastFrameSent).toBe(
    '42/v2/workspaces/yj7mmn-/events,["event",{"type":"submit contact form","payload":{"name":"test","email":"test@test.com","phone":"0000000000","company":"test","position":"test","message":"Je teste"}}]'
  );
  await expect(page.getByText('✅ Merci de nous avoir contact')).toBeAttached();
});
