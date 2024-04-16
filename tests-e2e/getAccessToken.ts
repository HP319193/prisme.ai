import { BrowserContext } from '@playwright/test';

export async function getAccessToken(context: BrowserContext) {
  const localStorage = (await context.storageState()).origins.reduce<
    Record<string, any>[] | null
  >((prev, { localStorage }) => (localStorage ? localStorage : prev), null);

  return (
    localStorage &&
    localStorage.find(({ name }) => name === 'access-token')?.value
  );
}
