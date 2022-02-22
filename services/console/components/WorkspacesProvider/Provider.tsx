import { FC, useCallback, useEffect, useState } from 'react';
import context, { WorkspacesContext } from './context';
import api from '../../utils/api';
import { Workspace } from '@prisme.ai/sdk';
import { useUser } from '../UserProvider';

export const WorkspacesProvider: FC = ({ children }) => {
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
            ? ({ ...newWorkspaces.get(w.id), name: w.name } as Workspace)
            : w
        );
      });
      return newWorkspaces;
    });
  }, []);

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
          (workspace) => workspace && workspace.name === lastName()
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
    [workspaces]
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
        const originalWorkspace = workspaces.get(workspace.id);
        if (!originalWorkspace) return null;
        const revertedWorkspaces = new Map(workspaces);
        revertedWorkspaces.set(originalWorkspace.id, originalWorkspace);
        setWorkspaces(revertedWorkspaces);
        return null;
      }
    },
    [workspaces]
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

  const createAutomation: WorkspacesContext['createAutomation'] = useCallback(
    async (workspace, automation) => {
      const automationResult = await api.createAutomation(
        workspace,
        automation
      );
      const { slug, ...newAutomation } = automationResult;
      const newWorkspace = {
        ...workspace,
        automations: {
          ...workspace.automations,
          [slug]: newAutomation,
        },
      };
      const newWorkspaces = new Map(workspaces);
      newWorkspaces.set(newWorkspace.id, newWorkspace);
      setWorkspaces(newWorkspaces);
      return automationResult;
    },
    [workspaces]
  );

  const updateAutomation: WorkspacesContext['updateAutomation'] = useCallback(
    async (workspace, slug, automation) => {
      const automationResult = await api.updateAutomation(
        workspace,
        slug,
        automation
      );

      const newWorkspace = {
        ...workspace,
        automations: {
          ...workspace.automations,
          [slug]: automationResult,
        },
      };
      const newWorkspaces = new Map(workspaces);
      newWorkspaces.set(newWorkspace.id, newWorkspace);
      setWorkspaces(newWorkspaces);

      return automationResult;
    },
    [workspaces]
  );

  const deleteAutomation: WorkspacesContext['deleteAutomation'] = useCallback(
    async (workspace, slug) => {
      await api.deleteAutomation(workspace, slug);

      const newWorkspaces = new Map(workspaces);
      const newWorkspace = {
        ...newWorkspaces.get(workspace.id),
      } as Workspace;

      const { [slug]: removed, ...filteredAutomations } =
        workspace.automations || {};
      newWorkspace.automations = filteredAutomations;
      newWorkspaces.set(workspace.id, newWorkspace);
      setWorkspaces(newWorkspaces);

      return removed;
    },
    [workspaces]
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
        createAutomation,
        updateAutomation,
        deleteAutomation,
      }}
    >
      {children}
    </context.Provider>
  );
};

export default WorkspacesProvider;
