import { useTranslation } from 'next-i18next';
import getConfig from 'next/config';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { ReactNode } from 'react';
import AppsProvider from '../../providers/Apps/AppsProvider';
import { WorkspacesProvider } from '../../providers/Workspaces';
import Sentry from '../../utils/Sentry';
import InstallWorkspace from '../InstallWorkspace';
import PermissionsProvider from '../PermissionsProvider';
import Tracking from '../Tracking';
import { WorkspacesUsageProvider } from '../WorkspacesUsage';

const {
  publicRuntimeConfig: { FEATURES: { ONBOARDING = false } = {} },
} = getConfig();

const OnBoarding = dynamic(import('../OnBoarding'));

interface WorkspaceBuilderProps {
  children: ReactNode;
}

export const WorkspaceBuilder = ({ children }: WorkspaceBuilderProps) => {
  const { t } = useTranslation('common');
  return (
    <WorkspacesProvider>
      <WorkspacesUsageProvider>
        <PermissionsProvider>
          <AppsProvider>
            <Tracking>
              <Head>
                <title>{t('main.title')}</title>
                <meta
                  name="viewport"
                  content="width=device-width,initial-scale=1, maximum-scale=1, shrink-to-fit=no, viewport-fit=cover"
                />
                <meta name="description" content={t('main.description')} />
                <link rel="icon" href="/favicon.png" />
              </Head>
              <Sentry />
              <InstallWorkspace>
                {children}
                {ONBOARDING && <OnBoarding />}
              </InstallWorkspace>
            </Tracking>
          </AppsProvider>
        </PermissionsProvider>
      </WorkspacesUsageProvider>
    </WorkspacesProvider>
  );
};
export default WorkspaceBuilder;
