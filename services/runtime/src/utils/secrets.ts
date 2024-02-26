import { logger } from '../logger';

export interface VariableAnnotations {
  secretPaths: string[];
  secret?: boolean;
}

export function findSecretPaths(
  types: Record<string, Prismeai.TypedArgument>,
  rootPath?: string
): string[] {
  return Object.entries(types).reduce<string[]>((paths, [fieldName, type]) => {
    const currentPath = rootPath ? `${rootPath}.${fieldName}` : fieldName;
    if (type.secret) {
      paths.push(currentPath);
    }
    if (type.properties) {
      paths.push(...findSecretPaths(type.properties, currentPath));
    }
    return paths;
  }, []);
}

export function redact(payload: any, secretSet: Set<string>) {
  if (!secretSet.size) {
    return payload;
  }

  const redactedString = [...secretSet.values()].reduce((acc, secret) => {
    try {
      return acc.replace(new RegExp(escapeRegex(secret), 'g'), 'REDACTED');
    } catch (err) {
      logger.error({ msg: 'Could not redact a secret value', err });
      return acc;
    }
  }, JSON.stringify(payload));

  try {
    return JSON.parse(redactedString);
  } catch (err) {
    logger.warn({
      msg: `Unexpected exception occured while readacting some payload. Given payload leaked unredacted !`,
      err,
      payload,
      secrets: secretSet.size,
    });
    return payload;
  }
}

function escapeRegex(str: string) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function get(obj: any, path: string) {
  const splittedPath = path.split('.');
  const lastKey = splittedPath.pop();
  const parent = splittedPath.reduce((acc, part) => acc && acc[part], obj);
  return [parent, lastKey];
}

export function findSecretValues(
  payload: any,
  secretPaths: string[],
  secretSet?: Set<string>
): Set<string> {
  if (typeof payload !== 'object') {
    return secretSet || new Set();
  }

  if (!secretSet) {
    secretSet = new Set();
  }

  for (const path of secretPaths) {
    const [parent, lastKey] = get(payload, path);
    if (
      parent &&
      typeof parent[lastKey] === 'string' &&
      parent[lastKey].trim()
    ) {
      secretSet.add(parent[lastKey].trim());
    }
  }

  return secretSet;
}
