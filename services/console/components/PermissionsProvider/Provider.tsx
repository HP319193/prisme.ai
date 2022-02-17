import { FC, useCallback, useState } from 'react';
import context, { PermissionsContext } from './context';
import api from '../../api/api';
import UserPermissions = Prismeai.UserPermissions;
import SubjectType = PrismeaiAPI.GetPermissions.Parameters.SubjectType;

export const PermissionsProvider: FC = ({ children }) => {
  const [usersPermissions, setUsersPermissions] = useState<
    PermissionsContext['usersPermissions']
  >(new Map());

  const addUserPermissions: PermissionsContext['addUserPermissions'] =
    useCallback(() => {}, []);

  const getUsersPermissions: PermissionsContext['getUsersPermissions'] =
    useCallback(async (objectId: string, subjectType: SubjectType) => {
      const userPermissions = await api.getPermissions(subjectType, objectId);
      const newUsersPermissions = new Map<string, UserPermissions | null>(
        userPermissions.result
      );
      newUsersPermissions.set(objectId, userPermissions);
      console.log('get', userPermissions);
      setUsersPermissions(newUsersPermissions);
      return newUsersPermissions;
    }, []);

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
