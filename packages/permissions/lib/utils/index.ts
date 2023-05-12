export * from './extractObjectsByPath';
export * from './subjectRelations';

export const PublicAccess = '*';
export const RolePrefix = 'role:';

export function permissionTargetToId(
  target: Prismeai.UserPermissionsTarget
): string {
  if (target.public) {
    return PublicAccess;
  }
  if (target.role) {
    return `${RolePrefix}${target.role}`;
  }
  if (!target.id) {
    throw new Error('Invalid target');
  }
  return target.id!;
}

export function permissionIdToTarget(
  id: string
): Prismeai.UserPermissionsTarget {
  if (id === PublicAccess) {
    return {
      public: true,
      displayName: 'Public',
      id: PublicAccess,
    };
  }
  if (id.startsWith(RolePrefix)) {
    const roleName = id.slice(RolePrefix.length);
    return {
      role: roleName,
      displayName: `Role: ${roleName}`,
      id,
    };
  }
  return { id };
}
