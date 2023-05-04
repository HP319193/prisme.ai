import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import isEqual from 'lodash/isEqual';
import { notification } from '@prisme.ai/design-system';
import context, { PermissionsContext } from './context';
import api, { ApiError } from '../../utils/api';

type UserPermissions = Prismeai.UserPermissions;

const addUserToMap = (
  subjectId: string,
  usersPermissions: Map<string, UserPermissions[]>,
  newUserPermissions: UserPermissions
) => {
  const newUsersPermissions = new Map(usersPermissions);
  newUsersPermissions.set(subjectId, [
    ...(usersPermissions.get(subjectId) || []).filter(
      ({ email }) => email !== newUserPermissions.email
    ),
    newUserPermissions,
  ]);
  return newUsersPermissions;
};
const removeUserFromMap = (
  subjectId: string,
  usersPermissions: Map<string, UserPermissions[]>,
  userEmail: string
) => {
  const newUsersPermissions = new Map<string, UserPermissions[]>(
    usersPermissions
  );
  newUsersPermissions.set(subjectId, [
    ...(usersPermissions.get(subjectId) || []).filter(
      ({ email, id }) => email !== userEmail && id !== userEmail
    ),
  ]);

  return newUsersPermissions;
};

export const PermissionsProvider: FC = ({ children }) => {
  const [usersPermissions, setUsersPermissions] = useState<
    PermissionsContext['usersPermissions']
  >(new Map());
  const [roles, setRoles] = useState<PrismeaiAPI.GetRoles.Responses.$200>([
    { name: 'owner' },
    { name: 'editor' },
  ]);
  const { t } = useTranslation('errors');

  const addUserPermissions: PermissionsContext['addUserPermissions'] =
    useCallback(
      async (subjectType, subjectId, permissions) => {
        const backupUsersPermissions = new Map(usersPermissions);

        // optimistic
        setUsersPermissions(
          addUserToMap(
            `${subjectType}:${subjectId}`,
            usersPermissions,
            permissions
          )
        );

        try {
          const fetchedUserPermissions = await api.addPermissions(
            subjectType,
            subjectId,
            permissions
          );
          setUsersPermissions(
            addUserToMap(
              `${subjectType}:${subjectId}`,
              usersPermissions,
              fetchedUserPermissions
            )
          );
          return fetchedUserPermissions;
        } catch (e) {
          notification.error({
            message: t('share', { context: (e as ApiError).error }),
            placement: 'bottomRight',
          });

          setUsersPermissions(backupUsersPermissions);
          return null;
        }
      },
      [t, usersPermissions]
    );

  const getUsersPermissions: PermissionsContext['getUsersPermissions'] =
    useCallback(async (subjectType, subjectId) => {
      try {
        const fetchedUsersPermissions = await api.getPermissions(
          subjectType,
          subjectId
        );
        setUsersPermissions((usersPermissions) => {
          const newUsersPermissions = new Map(usersPermissions);
          newUsersPermissions.set(
            `${subjectType}:${subjectId}`,
            fetchedUsersPermissions.result
          );
          if (isEqual(newUsersPermissions, usersPermissions)) {
            return usersPermissions;
          }
          return newUsersPermissions;
        });

        return fetchedUsersPermissions.result;
      } catch (e) {
        return [];
      }
    }, []);

  const removeUserPermissions: PermissionsContext['removeUserPermissions'] =
    useCallback(
      async (subjectType, subjectId, userEmail) => {
        const backupUsersPermissions = new Map(usersPermissions);

        // optimistic
        setUsersPermissions((usersPermissions) =>
          removeUserFromMap(
            `${subjectType}:${subjectId}`,
            usersPermissions,
            userEmail
          )
        );

        try {
          const deletedUserPermissions = await api.deletePermissions(
            subjectType,
            subjectId,
            userEmail
          );
          setUsersPermissions((usersPermissions) =>
            removeUserFromMap(
              `${subjectType}:${subjectId}`,
              usersPermissions,
              userEmail
            )
          );
          return deletedUserPermissions;
        } catch (e) {
          notification.error({
            message: t('unknown', { errorName: e }),
            placement: 'bottomRight',
          });

          setUsersPermissions(backupUsersPermissions);
          return null;
        }
      },
      [t, usersPermissions]
    );

  const getRoles: PermissionsContext['getRoles'] = useCallback(
    async (_, subjectId) => {
      try {
        const roles = await api.getWorkspaceRoles(subjectId);
        setRoles(roles);
        return roles;
      } catch (e) {
        return [];
      }
    },
    []
  );

  return (
    <context.Provider
      value={{
        usersPermissions,
        roles,
        addUserPermissions,
        removeUserPermissions,
        getUsersPermissions,
        getRoles,
      }}
    >
      {children}
    </context.Provider>
  );
};

export default PermissionsProvider;
