import { FC, useCallback, useState } from 'react';
import context, { PermissionsContext } from './context';
import api from '../../api/api';
import { isEqual } from 'lodash';
import UserPermissions = Prismeai.UserPermissions;
import SubjectType = PrismeaiAPI.GetPermissions.Parameters.SubjectType;

export const PermissionsProvider: FC = ({ children }) => {
  const [usersPermissions, setUsersPermissions] = useState<
    PermissionsContext['usersPermissions']
  >(new Map());

  const addUserPermissions: PermissionsContext['addUserPermissions'] =
    useCallback(
      async (subjectType, subjectId, permissions) => {
        const fetchedUserPermissions = await api.postPermissions(
          subjectType,
          subjectId,
          permissions
        );
        const newUsersPermissions = new Map<string, UserPermissions[]>(
          usersPermissions
        );
        newUsersPermissions.set(subjectId, [
          ...(usersPermissions.get(subjectId) || []),
          fetchedUserPermissions,
        ]);
        setUsersPermissions(newUsersPermissions);
        return fetchedUserPermissions;
      },
      [usersPermissions]
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

  return (
    <context.Provider
      value={{
        usersPermissions,
        addUserPermissions,
        getUsersPermissions,
      }}
    >
      {children}
    </context.Provider>
  );
};

export default PermissionsProvider;
