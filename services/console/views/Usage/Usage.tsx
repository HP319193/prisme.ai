import { Loading } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useCallback, useEffect } from 'react';
import { usePermissions } from '../../components/PermissionsProvider';
import ShareWorkspace from '../../components/Share/ShareWorkspace';
import { useUser } from '../../components/UserProvider';
import getLayout from '../../layouts/WorkspaceLayout';
import { useWorkspace } from '../../providers/Workspace';
import useLocalizedText from '../../utils/useLocalizedText';
import BillingPlan from './BillingPlan';
import Usages from './Usages';
import { useWorkspaceUsage } from './useWorkspaceUsage';

export const Usage = () => {
  const { t } = useTranslation('user');
  const { localize } = useLocalizedText();
  const { t: workspaceT } = useTranslation('workspaces');
  const {
    user: { email },
  } = useUser();

  const { workspace } = useWorkspace();

  const { usage, loading, error } = useWorkspaceUsage();

  const { getUsersPermissions } = usePermissions();

  const initialFetch = useCallback(async () => {
    getUsersPermissions('workspaces', `${workspace.id}`);
  }, [getUsersPermissions, workspace]);

  useEffect(() => {
    initialFetch();
  }, [initialFetch]);

  return (
    <>
      <Head>
        <title>
          [{localize(workspace.name)}]
          {t('title.workspaceManagement', {
            workspaceName: workspace.name,
          })}
        </title>
      </Head>
      {loading ? (
        <Loading />
      ) : (
        <div className="flex flex-col h-full flex-1 overflow-auto p-[4rem] space-y-5">
          <BillingPlan
            wpName={workspace.name}
            wpId={workspace.id}
            userEmail={email as string}
          />
          <Usages
            appsUsages={usage?.apps || []}
            wpId={workspace.id}
            error={error}
          />
          <div className="ml-2 font-bold">{workspaceT('workspace.share')}</div>
          <ShareWorkspace workspaceId={`${workspace.id}`} />
        </div>
      )}
    </>
  );
};

Usage.getLayout = getLayout;

export default Usage;
