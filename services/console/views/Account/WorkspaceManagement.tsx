import { getLayout } from './AccountLayout';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Error404 from '../Errors/404';
import { Loading } from '@prisme.ai/design-system';
import { useWorkspacesUsage } from '../../components/WorkspacesUsage';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { usePermissions } from '../../components/PermissionsProvider';
import Usages from './Components/Usages';
import ShareWorkspace from '../../components/Share/ShareWorkspace';
import BillingPlan from './Components/BillingPlan';
import { useWorkspaces } from '../../providers/Workspaces';
import WorkspaceProvider from '../../providers/Workspace';
import { useUser } from '../../components/UserProvider';

const WorkspaceManagement = () => {
  const { t } = useTranslation('user');
  const { t: workspaceT } = useTranslation('workspaces');
  const {
    user: { email },
  } = useUser();

  const { workspaces } = useWorkspaces();
  const {
    query: { workspaceId },
  } = useRouter();

  const { workspacesUsage, fetchWorkspaceUsage, loading, error } =
    useWorkspacesUsage();

  const { getUsersPermissions, usersPermissions } = usePermissions();

  const initialFetch = useCallback(async () => {
    getUsersPermissions('workspaces', `${workspaceId}`);
  }, [getUsersPermissions, workspaceId]);

  useEffect(() => {
    initialFetch();
  }, [initialFetch, workspaceId]);

  const currentWorkspace = useMemo(
    () => workspaces.find(({ id }) => id === `${workspaceId}`),
    [workspaceId, workspaces]
  );

  useEffect(() => {
    fetchWorkspaceUsage(`${workspaceId}`);
  }, [fetchWorkspaceUsage, workspaceId]);

  const appsUsages = useMemo(() => {
    if (!currentWorkspace) return;
    const currentWorkspaceUsageObject = workspacesUsage.get(`${workspaceId}`);
    if (!currentWorkspaceUsageObject) return;

    return currentWorkspaceUsageObject.apps;
  }, [currentWorkspace, workspaceId, workspacesUsage]);

  if (loading) {
    return <Loading />;
  }
  if (!currentWorkspace) {
    return <Error404 link={`/account`} />;
  }
  return (
    <>
      <Head>
        <title>
          {t('title.workspaceManagement', {
            workspaceName: currentWorkspace.name,
          })}
        </title>
      </Head>
      {loading ? (
        <Loading />
      ) : (
        <WorkspaceProvider id={`${workspaceId}`}>
          <div className="flex flex-col h-full flex-1 overflow-auto p-[4rem] space-y-5">
            <BillingPlan
              wpName={currentWorkspace.name}
              wpId={currentWorkspace.id}
              userEmail={email as string}
            />
            <Usages
              appsUsages={appsUsages || []}
              wpId={currentWorkspace.id}
              error={error}
            />
            <div className="ml-2 font-bold">
              {workspaceT('workspace.share')}
            </div>
            <ShareWorkspace workspaceId={`${workspaceId}`} />
          </div>
        </WorkspaceProvider>
      )}
    </>
  );
};

WorkspaceManagement.getLayout = getLayout;

export default WorkspaceManagement;
