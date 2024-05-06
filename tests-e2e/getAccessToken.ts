import { BrowserContext } from '@playwright/test';

export async function getAccessToken(context: BrowserContext, origin: string) {
  const foundOrigin = (await context.storageState()).origins.find(
    ({ origin: o }) => o.match(origin)
  );
  if (!foundOrigin || !foundOrigin.localStorage) return null;
  return foundOrigin.localStorage.find(({ name }) => name === 'access-token')
    ?.value;
}
