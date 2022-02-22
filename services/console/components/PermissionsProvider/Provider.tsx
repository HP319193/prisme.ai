import { FC, useCallback, useState } from 'react';
import { notification } from 'antd';
import { useTranslation } from 'react-i18next';
import isEqual from 'lodash/isEqual';
import context, { PermissionsContext } from './context';
import api from '../../api/api';

type UserPermissions = Prismeai.UserPermissions;
type SubjectType = PrismeaiAPI.GetPermissions.Parameters.SubjectType;

const addUserToMap = (
  subjectId: string,
  usersPermissions: Map<string, UserPermissions[]>,
  newUserPermissions: UserPermissions
) => {
  const newUsersPermissions = new Map<string, UserPermissions[]>(
    usersPermissions
  );
  newUsersPermissions.set(subjectId, [
    ...(usersPermissions.get(subjectId) || []),
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
      (userPerm) => userPerm.email === userEmail
    ),
  ]);

  return newUsersPermissions;
};

export const PermissionsProvider: FC = ({ children }) => {
  const [usersPermissions, setUsersPermissions] = useState<
    PermissionsContext['usersPermissions']
  >(new Map());

  const { t } = useTranslation('errors');

  const addUserPermissions: PermissionsContext['addUserPermissions'] =
    useCallback(
      async (subjectType, subjectId, permissions) => {
        const backupUsersPermissions = new Map(usersPermissions);

        // optimistic
        setUsersPermissions(
          addUserToMap(subjectId, usersPermissions, permissions)
        );

        try {
          const fetchedUserPermissions = await api.addPermissions(
            subjectType,
            subjectId,
            permissions
          );
          setUsersPermissions(
            addUserToMap(subjectId, usersPermissions, fetchedUserPermissions)
          );
          return fetchedUserPermissions;
        } catch (e) {
          notification.error({
            message: t('api', { errorName: e }),
            placement: 'bottomRight',
          });

          setUsersPermissions(backupUsersPermissions);
          return null;
        }
      },
      [t, usersPermissions]
    );

  const getUsersPermissions: PermissionsContext['getUsersPermissions'] =
    useCallback(
      async (subjectType: SubjectType, subjectId: string) => {
        const fetchedUsersPermissions = await api.getPermissions(
          subjectType,
          subjectId
        );
        const newUsersPermissions = new Map<string, UserPermissions[]>(
          usersPermissions
        );
        newUsersPermissions.set(subjectId, fetchedUsersPermissions.result);
        if (!isEqual(newUsersPermissions, usersPermissions)) {
          setUsersPermissions(newUsersPermissions);
        }
        return fetchedUsersPermissions.result;
      },
      [usersPermissions]
    );

  const removeUserPermissions: PermissionsContext['removeUserPermissions'] =
    useCallback(
      async (subjectType, subjectId, userEmail) => {
        const backupUsersPermissions = new Map(usersPermissions);

        // optimistic
        setUsersPermissions(
          removeUserFromMap(subjectId, usersPermissions, userEmail)
        );

        try {
          const deletedUserPermissions = await api.deletePermissions(
            subjectType,
            subjectId,
            userEmail
          );
          setUsersPermissions(
            removeUserFromMap(subjectId, usersPermissions, userEmail)
          );
          return deletedUserPermissions;
        } catch (e) {
          notification.error({
            message: t('api', { errorName: e }),
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
