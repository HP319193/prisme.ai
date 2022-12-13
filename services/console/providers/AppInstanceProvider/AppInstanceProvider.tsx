import { AppstoreOutlined } from '@ant-design/icons';
import { Loading } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import {
  createContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import NotFound from '../../components/NotFound';
import api from '../../utils/api';
import { useContext } from '../../utils/useContext';

export interface AppInstanceContext {
  appInstance: Prismeai.AppInstance;
  documentation: Prismeai.Page | null;
  loading: boolean;
  fetchAppInstance: () => void;
  saveAppInstance: (
    app: Prismeai.AppInstance
  ) => Promise<Prismeai.AppInstance | null>;
  saving: boolean;
  uninstallApp: () => Promise<Prismeai.AppInstance | null>;
}

interface AppInstanceProviderProps {
  id: string;
  workspaceId: string;
  children: ReactNode;
}

export const appInstanceContext = createContext<AppInstanceContext | undefined>(
  undefined
);

export const useAppInstance = () =>
  useContext<AppInstanceContext>(appInstanceContext);

export const AppInstanceProvider = ({
  id,
  workspaceId,
  children,
}: AppInstanceProviderProps) => {
  const { t } = useTranslation('workspaces');
  const [appInstance, setAppInstance] = useState<
    AppInstanceContext['appInstance']
  >();
  const [documentation, setDocumentation] = useState<Prismeai.Page | null>(
    null
  );
  const [loading, setLoading] = useState<AppInstanceContext['loading']>(true);
  const [saving, setSaving] = useState<AppInstanceContext['saving']>(false);
  const [notFound, setNotFound] = useState(false);

  const fetchAppInstance: AppInstanceContext['fetchAppInstance'] = useCallback(async () => {
    try {
      setNotFound(false);
      const {
        documentation = null,
        appSlug = '',
        ...rest
      } = await api.getAppInstance(workspaceId, id);
      const appInstance = {
        appSlug,
        ...rest,
      };
      setAppInstance(appInstance);
      setDocumentation(documentation);
      return appInstance;
    } catch (e) {
      setNotFound(true);
    }
  }, [id, workspaceId]);

  const saveAppInstance: AppInstanceContext['saveAppInstance'] = useCallback(
    async (data) => {
      if (!workspaceId || !appInstance || !appInstance.slug) return null;
      setSaving(true);
      const newAppInstance = await api.saveAppInstance(
        workspaceId,
        appInstance.slug,
        data
      );
      setAppInstance(newAppInstance);
      setSaving(false);
      return newAppInstance;
    },
    [appInstance, workspaceId]
  );

  const uninstallApp: AppInstanceContext['uninstallApp'] = useCallback(async () => {
    if (!workspaceId || !appInstance || !appInstance.slug) return null;
    api.uninstallApp(workspaceId, appInstance?.slug);
    return appInstance;
  }, [appInstance, workspaceId]);

  const prevId = useRef<string>('');
  useEffect(() => {
    if (prevId.current === id) return;
    prevId.current = id;
    const initialFetch = async () => {
      setLoading(true);
      await fetchAppInstance();
      setLoading(false);
    };
    initialFetch();
  }, [fetchAppInstance, id]);

  if (loading) return <Loading />;
  if (notFound)
    return <NotFound icon={AppstoreOutlined} text={t('apps.notFound')} />;
  if (!appInstance) return null;

  return (
    <appInstanceContext.Provider
      value={{
        appInstance,
        documentation,
        loading,
        fetchAppInstance,
        saveAppInstance,
        saving,
        uninstallApp,
      }}
    >
      {children}
    </appInstanceContext.Provider>
  );
};

export default AppInstanceProvider;
