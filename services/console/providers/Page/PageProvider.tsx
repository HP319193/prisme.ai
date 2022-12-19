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
  id?: string;
  workspaceSlug?: string;
  slug?: string;
  children: ReactNode;
}

export const PageProvider = ({
  workspaceId,
  id,
  workspaceSlug,
  slug,
  children,
}: PageProviderProps) => {
  const { t } = useTranslation('workspaces');
  const [currentSlug, setCurrentSlug] = useState(slug);
  const [page, setPage] = useState<PageContext['page']>();
  const [appInstances, setAppInstances] = useState<PageContext['appInstances']>(
    []
  );
  const [loading, setLoading] = useState<PageContext['loading']>(true);
  const [saving, setSaving] = useState<PageContext['saving']>(false);
  const [notFound, setNotFound] = useState(false);

  const fetchPageById = useCallback(async () => {
    if (!workspaceId || !id) return;

    const { appInstances, public: isPublic, ...page } = await api.getPage(
      workspaceId,
      id
    );
    setAppInstances(appInstances);
    return page;
  }, [workspaceId, id]);

  const fetchPageBySlug = useCallback(async () => {
    if (!workspaceSlug || !slug) return;
    const { appInstances, public: isPublic, ...page } = await api.getPageBySlug(
      workspaceSlug,
      slug
    );
    setAppInstances(appInstances);
    return page;
  }, [workspaceSlug, slug]);

  const fetchPage = useCallback(async () => {
    let page: PageContext['page'] | undefined;
    setNotFound(false);
    try {
      if (workspaceId && id) {
        page = await fetchPageById();
      }
      if (workspaceSlug && slug) {
        page = await fetchPageBySlug();
      }
      return page || null;
    } catch (e) {
      setNotFound(true);
      return null;
    }
  }, [fetchPageById, fetchPageBySlug, id, slug, workspaceId, workspaceSlug]);

  const savePage: PageContext['savePage'] = useCallback(
    async ({ apiKey, ...newPage }) => {
      if (!workspaceId) return null;
      setSaving(true);
      const page = await api.updatePage(workspaceId, newPage);
      setPage(page);
      setCurrentSlug(page.slug);
      setSaving(false);
      return page;
    },
    [workspaceId]
  );

  const deletePage: PageContext['deletePage'] = useCallback(async () => {
    if (!workspaceId || !page?.id) return null;
    setPage(undefined);
    api.deletePage(workspaceId, page.id);
    return page;
  }, [page, workspaceId]);

  useEffect(() => {
    const initPage = async () => {
      setCurrentSlug(slug);
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
