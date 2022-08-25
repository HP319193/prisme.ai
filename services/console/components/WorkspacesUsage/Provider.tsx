import { FC, useCallback, useState } from 'react';
import context, {
  WorkspacesUsageContext,
  WorkspaceUsageWithPhoto,
} from './context';
import api, { ApiError } from '../../utils/api';

interface WorkspacesUsageProviderProps {}

export const WorkspacesUsageProvider: FC<WorkspacesUsageProviderProps> = ({
  children,
}) => {
  const [workspacesUsage, setWorkspacesUsage] = useState<
    WorkspacesUsageContext['workspacesUsage']
  >(new Map());
  const [loading, setLoading] =
    useState<WorkspacesUsageContext['loading']>(true);
  const [error, setError] = useState<ApiError>();

  const fetchWorkspaceUsage: WorkspacesUsageContext['fetchWorkspaceUsage'] =
    useCallback(async (workspaceId: string) => {
      setLoading(true);
      setError(undefined);
      try {
        const beforeDate = new Date().toISOString();

        const date = new Date();
        const afterDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          1
        ).toISOString();

        const [workspaceUsage, appInstancesReq] = await Promise.all([
          api.getWorkspaceUsage(workspaceId, {
            afterDate,
            beforeDate,
          }),
          api.listAppInstances(workspaceId),
        ]);

        const appInstances = appInstancesReq.flatMap((app) =>
          app.slug ? [app] : []
        );

        // Add photo to workspaceUsages apps
        const workspaceUsageWithPhoto: WorkspaceUsageWithPhoto = {
          ...workspaceUsage,
          apps: workspaceUsage.apps.map((appUsage) => {
            const matchingAppInstance = appInstances.find(
              (appInstance) => appUsage.slug === appInstance.slug
            );

            if (!matchingAppInstance) {
              return appUsage;
            }

            return { ...appUsage, photo: matchingAppInstance.photo };
          }),
        };

        setWorkspacesUsage((workspacesUsage) =>
          new Map(workspacesUsage).set(workspaceId, workspaceUsageWithPhoto)
        );
        setLoading(false);
        return workspaceUsage;
      } catch (e) {
        setError(e as ApiError);
        setLoading(false);
        return null;
      }
    }, []);

  return (
    <context.Provider
      value={{ workspacesUsage, fetchWorkspaceUsage, loading, error }}
    >
      {children}
    </context.Provider>
  );
};

export default WorkspacesUsageProvider;
