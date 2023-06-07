import { Loading, notification } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import api from '../utils/api';
import Storage from '../utils/Storage';
import { useUser } from './UserProvider';

interface InstallWorkspaceProps {
  children?: React.ReactNode;
}
export const InstallWorkspace = ({ children }: InstallWorkspaceProps) => {
  const { user } = useUser();
  const install = Storage.get('__install');
  const { push } = useRouter();
  const { t } = useTranslation('workspaces');

  useEffect(() => {
    if (!install || !user) return;
    async function installWorkspace() {
      try {
        const w = await api.duplicateWorkspace({ id: install });
        if (!w) {
          throw new Error('Cannot install workspace');
        }
        push(`/workspaces/${w.id}`);
        notification.success({
          message: t('workspaces.install.ok'),
        });
      } catch (e) {
        notification.error({
          message: t('workspaces.install.error'),
        });
      }
    }
    installWorkspace();
    Storage.remove('__install');
  }, [install, push, t, user]);

  if (!install || !user) return <>{children}</>;

  return <Loading />;
};

export default InstallWorkspace;
