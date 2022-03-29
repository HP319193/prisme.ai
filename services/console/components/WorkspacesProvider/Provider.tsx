import { FC, useCallback, useEffect, useState } from 'react';
import context, { WorkspacesContext } from './context';
import api from '../../utils/api';
import { Workspace } from '@prisme.ai/sdk';
import { useUser } from '../UserProvider';
import { useTranslation } from 'react-i18next';
import { removedUndefinedProperties } from '../../utils/objects';
import { notification } from '@prisme.ai/design-system';
import { SLUG_MATCH_INVALID_CHARACTERS } from '../../utils/regex';
import useLocalizedText from '../../utils/useLocalizedText';

export const WorkspacesProvider: FC = ({ children }) => {
  const localize = useLocalizedText();
  const { t: errorT } = useTranslation('errors');
  const { user } = useUser();
  const [workspaces, setWorkspaces] = useState<WorkspacesContext['workspaces']>(
    new Map()
  );
  const fetchWorkspaces = useCallback(async () => {
    const freshWorkspaces = await api.getWorkspaces();
    setWorkspaces((workspaces) => {
      const newWorkspaces = new Map(workspaces);
      freshWorkspaces.forEach((w) => {
        if (newWorkspaces.has(w.id)) {
        }
        newWorkspaces.set(
          w.id,
          newWorkspaces.get(w.id)
            ? ({
                ...newWorkspaces.get(w.id),
                name: localize(w.name),
              } as Workspace)
            : w
        );
      });
      return newWorkspaces;
    });
  }, [localize]);

  useEffect(() => {
    if (!user) {
      setWorkspaces(new Map());
      return;
    }
    fetchWorkspaces();
  }, [fetchWorkspaces, user]);

  const get: WorkspacesContext['get'] = useCallback(
    (id: string) => {
      return workspaces.get(id);
    },
    [workspaces]
  );

  const fetch = useCallback(
    async (id: string) => {
      let workspace: Workspace | null = null;
      try {
        workspace = await api.getWorkspace(id);
      } catch (e) {}
      const newWorkspaces = new Map(workspaces);
      newWorkspaces.set(id, workspace);
      setWorkspaces(newWorkspaces);
      return workspace;
    },
    [workspaces]
  );

  const create: WorkspacesContext['create'] = useCallback(
    async (name: string) => {
      let version = 0;
      const lastName = () => `${name}${version ? ` (${version})` : ''}`;
      while (
        Array.from(workspaces.values()).find(
          (workspace) => workspace && localize(workspace.name) === lastName()
        )
      ) {
        version++;
      }
      const workspace = await api.createWorkspace(lastName());
      const newWorkspaces = new Map(workspaces);
      newWorkspaces.set(workspace.id, workspace);
      setWorkspaces(newWorkspaces);
      return workspace;
    },
    [localize, workspaces]
  );

  const update = useCallback(
    async (workspace: Workspace) => {
      try {
        const optimisticNewWorkspaces = new Map(workspaces);
        optimisticNewWorkspaces.set(workspace.id, workspace);
        setWorkspaces(optimisticNewWorkspaces);
        const newWorkspace = await api.updateWorkspace(workspace);

        const newWorkspaces = new Map(workspaces);
        newWorkspaces.set(newWorkspace.id, newWorkspace);
        setWorkspaces(newWorkspaces);
        return workspace;
      } catch (e) {
        notification.error({
          message: errorT('unknown', { errorName: e }),
          placement: 'bottomRight',
        });
        const originalWorkspace = workspaces.get(workspace.id);
        if (!originalWorkspace) return null;
        const revertedWorkspaces = new Map(workspaces);
        revertedWorkspaces.set(originalWorkspace.id, originalWorkspace);
        setWorkspaces(revertedWorkspaces);
        return null;
      }
    },
    [errorT, workspaces]
  );

  const remove: WorkspacesContext['remove'] = useCallback(
    async ({ id }) => {
      const optimisticNewWorkspaces = new Map(workspaces);
      const toDelete = optimisticNewWorkspaces.get(id);
      try {
        optimisticNewWorkspaces.delete(id);
        setWorkspaces(optimisticNewWorkspaces);
        await api.deleteWorkspace(id);
      } catch (e) {
        if (!toDelete) return null;
        setWorkspaces((workspaces) => {
          const newWorkspaces = new Map(workspaces);
          newWorkspaces.set(id, toDelete);
          return newWorkspaces;
        });
      }
      return null;
    },
    [workspaces]
  );

  // set role to editor for the postpermissions
  const getWorkspaceUsersPermissions: WorkspacesContext['getWorkspaceUsersPermissions'] = useCallback(
    async (workspaceId) => {
      const { result: userPermissions } = await api.getPermissions(
        'workspaces',
        workspaceId
      );
      return userPermissions;
    },
    []
  );

  const installApp: WorkspacesContext['installApp'] = useCallback(
    async (workspaceId, body) => {
      try {
        const currentWorkspace = workspaces.get(workspaceId);

        if (!currentWorkspace) {
          throw new Error("Can't add an app to an empty workspace");
        }

        // Generate app instance slug
        let version = 0;
        const newAppInstanceSlug = () =>
          `${body.appSlug.replace(SLUG_MATCH_INVALID_CHARACTERS, '')}${
            version ? ` ${version}` : ''
          }`;
        while (
          Object.keys(currentWorkspace.imports || {}).find(
            (appInstanceSlug) => appInstanceSlug === newAppInstanceSlug()
          )
        ) {
          version++;
        }

        const fetchedAppInstance = await api.installApp(workspaceId, {
          ...body,
          slug: newAppInstanceSlug(),
        });

        // Typescript check, this route should always return a slug
        if (!fetchedAppInstance.slug) {
          throw new Error('Received app instance has no slug');
        }

        const updatedWorkspace = {
          ...currentWorkspace,
          imports: {
            ...(currentWorkspace.imports || {}),
            [fetchedAppInstance.slug]: fetchedAppInstance,
          },
        };

        const newWorkspaces = new Map(workspaces);
        newWorkspaces.set(workspaceId, updatedWorkspace);
        setWorkspaces(newWorkspaces);

        return fetchedAppInstance;
      } catch (e) {
        notification.error({
          message: errorT('unknown', { errorName: e }),
          placement: 'bottomRight',
        });
        console.error(e);
        return null;
      }
    },
    [errorT, workspaces]
  );

  const updateApp: WorkspacesContext['updateApp'] = useCallback(
    async (workspaceId, slug, body) => {
      try {
        const updatedAppInstance = await api.updateApp(workspaceId, slug, body);

        const newWorkspaces = new Map(workspaces);
        const currentWorkspace = workspaces.get(workspaceId);

        if (!currentWorkspace) {
          throw new Error("Can't add an app to an empty workspace");
        }

        newWorkspaces.set(workspaceId, {
          ...currentWorkspace,
          imports: {
            ...currentWorkspace.imports,
            [slug]: updatedAppInstance,
          },
        });

        setWorkspaces(newWorkspaces);
        return { id: slug };
      } catch (e) {
        notification.error({
          message: errorT('unknown', { errorName: e }),
          placement: 'bottomRight',
        });
        console.error(e);
        return null;
      }
    },
    [errorT, workspaces]
  );

  const uninstallApp: WorkspacesContext['uninstallApp'] = useCallback(
    async (workspaceId, slug) => {
      try {
        const newWorkspaces = new Map(workspaces);
        const currentWorkspace = workspaces.get(workspaceId);

        if (!currentWorkspace) {
          throw new Error("Can't add an app to an empty workspace");
        }

        newWorkspaces.set(workspaceId, {
          ...currentWorkspace,
          imports: {
            ...Object.entries(currentWorkspace.imports || {})
              .filter(([key]) => key !== slug)
              .reduce(
                // Transform back to object
                (object, [key, value]) => ({ ...object, [key]: value }),
                {}
              ),
          },
        });

        setWorkspaces(newWorkspaces);

        await api.uninstallApp(workspaceId, slug);

        return { id: slug };
      } catch (e) {
        notification.error({
          message: errorT('unknown', { errorName: e }),
          placement: 'bottomRight',
        });
        return null;
      }
    },
    [errorT, workspaces]
  );

  const publishApp: WorkspacesContext['publishApp'] = useCallback(
    async (body) => {
      return api.publishApp(removedUndefinedProperties(body));
    },
    []
  );

  return (
    <context.Provider
      value={{
        workspaces,
        get,
        fetch,
        create,
        update,
        remove,
        getWorkspaceUsersPermissions,
        installApp,
        updateApp,
        uninstallApp,
        publishApp,
      }}
    >
      {children}
    </context.Provider>
  );
};

export default WorkspacesProvider;
