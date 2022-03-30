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

  const { t } = useTranslation('errors');

  const addUserPermissions: PermissionsContext['addUserPermissions'] = useCallback(
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

  const getUsersPermissions: PermissionsContext['getUsersPermissions'] = useCallback(
    async (subjectType, subjectId) => {
      try {
        const fetchedUsersPermissions = await api.getPermissions(
          subjectType,
          subjectId
        );
        const newUsersPermissions = new Map<string, UserPermissions[]>(
          usersPermissions
        );
        newUsersPermissions.set(
          `${subjectType}:${subjectId}`,
          fetchedUsersPermissions.result
        );
        if (!isEqual(newUsersPermissions, usersPermissions)) {
          setUsersPermissions(newUsersPermissions);
        }
        return fetchedUsersPermissions.result;
      } catch (e) {
        return [];
      }
    },
    [usersPermissions]
  );

  const removeUserPermissions: PermissionsContext['removeUserPermissions'] = useCallback(
    async (subjectType, subjectId, userEmail) => {
      const backupUsersPermissions = new Map(usersPermissions);

      // optimistic
      setUsersPermissions(
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
        setUsersPermissions(
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

  return (
    <context.Provider
      value={{
        usersPermissions,
        addUserPermissions,
        removeUserPermissions,
        getUsersPermissions,
      }}
    >
      {children}
    </context.Provider>
  );
};

export default PermissionsProvider;
