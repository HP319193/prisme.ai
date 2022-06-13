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
      return acc.replace(new RegExp(secret, 'g'), 'REDACTED');
    } catch (err) {
      logger.error({ msg: 'Could not redact a secret value', err });
      return acc;
    }
  }, JSON.stringify(payload));

  return JSON.parse(redactedString);
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
    return payload;
  }

  if (!secretSet) {
    secretSet = new Set();
  }

  for (const path of secretPaths) {
    const [parent, lastKey] = get(payload, path);
    if (parent && typeof parent[lastKey] === 'string') {
      secretSet.add(parent[lastKey]);
    }
  }

  return secretSet;
}
