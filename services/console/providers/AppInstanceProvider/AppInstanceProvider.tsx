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
import api, { Events } from '../../utils/api';
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
  events: Events;
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
  events,
  children,
}: AppInstanceProviderProps) => {
  const { t } = useTranslation('workspaces');
  const [slug, setSlug] = useState(id);
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
      if (newAppInstance.slug) {
        setSlug(newAppInstance.slug);
      }
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

  useEffect(() => {
    const off = events.on('workspaces.apps.configured', ({ payload }) => {
      if (
        !appInstance ||
        !payload.appInstance ||
        appInstance.slug !== payload.appInstance.slug
      )
        return;
      const updated = {
        ...appInstance,
        config: {
          ...appInstance.config,
          value: payload.appInstance.config,
        },
      };
      setAppInstance(updated);
    });

    return () => {
      off();
    };
  }, [appInstance, events]);

  if (loading) return <Loading />;
  if (notFound)
    return <NotFound icon={AppstoreOutlined} text={t('apps.notFound')} />;
  if (!appInstance) return null;

  return (
    <appInstanceContext.Provider
      value={{
        appInstance,
        // TODO : afficher la dod avec un /_doc dans services/pages
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
