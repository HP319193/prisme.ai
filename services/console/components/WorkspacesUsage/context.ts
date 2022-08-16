import { createContext, useContext } from 'react';
import { ApiError } from '@prisme.ai/sdk';

interface AppUsageMetricsWithPhoto extends Prismeai.AppUsageMetrics {
  photo?: string;
}

export interface WorkspaceUsageWithPhoto
  extends Omit<Prismeai.WorkspaceUsage, 'apps'> {
  apps: AppUsageMetricsWithPhoto[];
}

export interface WorkspacesUsageContext {
  workspacesUsage: Map<string, WorkspaceUsageWithPhoto>;
  fetchWorkspaceUsage: (
    workspaceId: string
  ) => Promise<WorkspaceUsageWithPhoto | unknown>;
  loading: boolean;
  error?: ApiError;
}

export const workspacesUsageContext = createContext<WorkspacesUsageContext>({
  workspacesUsage: new Map(),
  fetchWorkspaceUsage: async () => ({} as any),
  loading: false,
});

export const useWorkspacesUsage = () => useContext(workspacesUsageContext);

export default workspacesUsageContext;
