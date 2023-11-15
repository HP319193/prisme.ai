import crypto from 'crypto';

export function uniqueId() {
  return crypto.randomBytes(16).toString('hex');
}

export function isPrivateIP(ip: string) {
  const parts = ip.split('.');
  return (
    parts[0] === '10' ||
    (parts[0] === '172' &&
      parseInt(parts[1], 10) >= 16 &&
      parseInt(parts[1], 10) <= 31) ||
    (parts[0] === '192' && parts[1] === '168')
  );
}

function extractObjectsByPath(rootObject: any, path: string | string[]): any {
  const splittedPath = (typeof path === 'string' ? path.split('.') : path || [])
    .map((cur) => cur.trim())
    .filter(Boolean);
  if (!rootObject) {
    return undefined;
  }
  if (!splittedPath.length) {
    return rootObject;
  }
  for (let i = 0; rootObject && i < splittedPath.length - 1; i++) {
    rootObject = rootObject[splittedPath[i]];
  }
  return rootObject?.[splittedPath[splittedPath.length - 1]];
}

export function redact(event: any, fields: string[], replaceWith = 'REDACTED') {
  for (const field of fields) {
    const parentPath = field.split('.');
    const lastKey = parentPath.pop();
    const parentObj = extractObjectsByPath(event, parentPath);
    if (parentObj && lastKey && lastKey in parentObj) {
      parentObj[lastKey] = replaceWith;
    }
  }
}
