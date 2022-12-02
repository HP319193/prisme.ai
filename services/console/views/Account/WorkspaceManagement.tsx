import AccountLayout from './AccountLayout';
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
import RightSidebar from './Components/RightSidebar';
import BillingPlan from './Components/BillingPlan';
import { useWorkspaces } from '../../providers/Workspaces';

interface MyAccountProps {}

const MyAccount = ({}: MyAccountProps) => {
  const { t } = useTranslation('user');
  const { t: workspaceT } = useTranslation('workspaces');

  const { workspaces } = useWorkspaces();
  const {
    query: { workspaceId },
  } = useRouter();

  const {
    workspacesUsage,
    fetchWorkspaceUsage,
    loading,
    error,
  } = useWorkspacesUsage();

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

  const currentWorkspaceUsages = useMemo(() => {
    if (!currentWorkspace) return;
    const currentWorkspaceUsageObject = workspacesUsage.get(`${workspaceId}`);
    if (!currentWorkspaceUsageObject) return;

    return [
      {
        slug: currentWorkspace.name,
        total: currentWorkspaceUsageObject.total,
        photo: currentWorkspace.photo,
      },
      ...currentWorkspaceUsageObject.apps,
    ];
  }, [currentWorkspace, workspaceId, workspacesUsage]);

  if (!currentWorkspace) {
    return <Error404 link={`/account`} />;
  }

  return (
    <AccountLayout>
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
        <div className="flex flex-row h-full flex-1">
          <div className="flex flex-col flex-1 m-[3.938rem] space-y-5 w-4/5">
            <BillingPlan wpName={currentWorkspace.name} />
            <Usages
              currentWorkspaceUsages={currentWorkspaceUsages || []}
              nbUser={
                usersPermissions.get(`workspaces:${workspaceId}`)?.length || 0
              }
              error={error}
            />
            <div className="ml-2 font-bold">
              {workspaceT('workspace.share')}
            </div>
            <ShareWorkspace parentWorkspaceId={`${workspaceId}`} />
          </div>
          <RightSidebar />
        </div>
      )}
    </AccountLayout>
  );
};

export default MyAccount;
