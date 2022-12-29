import { FileUnknownOutlined } from '@ant-design/icons';
import { Loading } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import {
  createContext,
  ReactNode,
  useEffect,
  useCallback,
  useState,
} from 'react';
import NotFound from '../../components/NotFound';
import api from '../../utils/api';
import { useContext } from '../../utils/useContext';

interface Page extends Prismeai.Page {
  apiKey?: string;
}

export interface PageContext {
  page: Page;
  appInstances: Prismeai.PageDetails['appInstances'];
  loading: boolean;
  fetchPage: () => Promise<Page | null>;
  savePage: (page: Page) => Promise<Page | null>;
  saving: boolean;
  deletePage: () => Promise<Page | null>;
}

export const pageContext = createContext<PageContext | undefined>(undefined);

export const usePage = () => useContext<PageContext>(pageContext);

interface PageProviderProps {
  workspaceId?: string;
  slug?: string;
  children: ReactNode;
}

export const PageProvider = ({
  workspaceId,
  slug,
  children,
}: PageProviderProps) => {
  const { t } = useTranslation('workspaces');
  const [page, setPage] = useState<PageContext['page']>();
  const [appInstances, setAppInstances] = useState<PageContext['appInstances']>(
    []
  );
  const [loading, setLoading] = useState<PageContext['loading']>(true);
  const [saving, setSaving] = useState<PageContext['saving']>(false);
  const [notFound, setNotFound] = useState(false);

  const fetchPage = useCallback(async () => {
    setNotFound(false);
    if (!workspaceId || !slug) return null;
    try {
      const { appInstances, public: isPublic, ...page } = await api.getPage(
        workspaceId,
        slug
      );
      setAppInstances(appInstances);
      return page || null;
    } catch (e) {
      setNotFound(true);
      return null;
    }
  }, [slug, workspaceId]);

  const savePage: PageContext['savePage'] = useCallback(
    async ({ apiKey, ...newPage }) => {
      if (!workspaceId) return null;
      setSaving(true);
      const updated = await api.updatePage(
        workspaceId,
        newPage,
        page && page.slug
      );
      setPage(updated);
      setSaving(false);
      return updated;
    },
    [page, workspaceId]
  );

  const deletePage: PageContext['deletePage'] = useCallback(async () => {
    if (!workspaceId || !page?.slug) return null;
    setPage(undefined);
    api.deletePage(workspaceId, page.slug);
    return page;
  }, [page, workspaceId]);

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      const page = await fetchPage();
      setLoading(false);
      if (!page) return;
      setPage(page);
    };
    initPage();
  }, [fetchPage, slug]);

  if (loading) return <Loading />;
  if (notFound)
    return <NotFound icon={FileUnknownOutlined} text={t('pages.notFound')} />;
  if (!page) return null;

  return (
    <pageContext.Provider
      value={{
        page,
        appInstances,
        loading,
        fetchPage,
        savePage,
        saving,
        deletePage,
      }}
    >
      {children}
    </pageContext.Provider>
  );
};

export default PageProvider;
