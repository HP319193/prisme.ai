import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../../providers/Workspace';
import api, { ApiError } from '../../utils/api';

export interface AppUsageMetricsWithPhoto extends Prismeai.AppUsageMetrics {
  photo?: string;
}

export interface WorkspaceUsageWithPhoto
  extends Omit<Prismeai.WorkspaceUsage, 'apps'> {
  apps: AppUsageMetricsWithPhoto[];
}

export const useWorkspaceUsage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | undefined>(undefined);
  const [value, setValue] = useState<WorkspaceUsageWithPhoto>();
  const { workspace } = useWorkspace();
  const fetchWorkspaceUsage = useCallback(async () => {
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
        api.workspaces(workspace.id).getUsage({
          afterDate,
          beforeDate,
        }),
        api.workspaces(workspace.id).listAppInstances(),
      ]);

      const appInstances = appInstancesReq.flatMap((app) =>
        app.slug ? [app] : []
      );

      // Add photo to workspaceUsages apps
      const workspaceUsageWithPhoto = {
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

      setValue(workspaceUsageWithPhoto);
      setLoading(false);
      return workspaceUsage;
    } catch (e) {
      setError(e as ApiError);
      setLoading(false);
      return null;
    }
  }, [workspace.id]);

  useEffect(() => {
    fetchWorkspaceUsage();
  }, [fetchWorkspaceUsage]);

  return {
    loading,
    error,
    usage: value,
  };
};
