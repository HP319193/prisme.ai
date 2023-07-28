import { URL } from 'url';

export function findCommonParentDomain(urls: string[]) {
  let parentDomain;
  for (let currentURL of urls) {
    const parsed = new URL(
      currentURL.startsWith('http://') || currentURL.startsWith('https://')
        ? currentURL
        : `https://${currentURL}`
    );
    const currentDomain = parsed.hostname;
    if (!parentDomain) {
      parentDomain = currentDomain;
      continue;
    }

    const splitted1 = parentDomain.split('.').reverse();
    const splitted2 = currentDomain.split('.').reverse();
    const firstDifferentSubdomainIdx = splitted2.findIndex(
      (cur, idx) => cur !== splitted1[idx]
    );
    if (firstDifferentSubdomainIdx === 0) {
      return undefined;
    }
    parentDomain = splitted2
      .reverse()
      .slice(0 - firstDifferentSubdomainIdx)
      .join('.');
  }
  return parentDomain;
}
