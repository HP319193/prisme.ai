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
import { useWorkspace } from '../Workspace';

export type Block = Prismeai.Block & { slug: string };
export interface BlockContext {
  block: Block;
  loading: boolean;
  fetchBlock: () => Promise<Block | null>;
  saveBlock: (block: Block) => Promise<Block | null>;
  saving: boolean;
  deleteBlock: () => Promise<Block | null>;
}

export const blockContext = createContext<BlockContext | undefined>(undefined);

export const useBlock = () => useContext<BlockContext>(blockContext);

interface BlockProviderProps {
  workspaceId?: string;
  slug?: string;
  children: ReactNode;
}

export const BlockProvider = ({
  workspaceId,
  slug,
  children,
}: BlockProviderProps) => {
  const { t } = useTranslation('workspaces');
  const [block, setBlock] = useState<BlockContext['block']>();
  const [loading, setLoading] = useState<BlockContext['loading']>(true);
  const [saving, setSaving] = useState<BlockContext['saving']>(false);
  const [notFound, setNotFound] = useState(false);
  const { saveWorkspace } = useWorkspace();

  const fetchBlock = useCallback(async () => {
    setNotFound(false);
    if (!workspaceId || !slug) return null;
    try {
      const { blocks: { [slug]: block } = {} } = await api.getWorkspace(
        workspaceId
      );
      return { slug, ...block } || null;
    } catch (e) {
      setNotFound(true);
      return null;
    }
  }, [slug, workspaceId]);

  const saveBlock: BlockContext['saveBlock'] = useCallback(
    async ({ slug: newSlug, ...block }) => {
      if (!workspaceId || !slug) return null;
      setSaving(true);
      try {
        const { blocks: lastBlocks = {} } = await api.getWorkspace(workspaceId);
        lastBlocks[newSlug] = block;
        if (slug !== newSlug) {
          delete lastBlocks[slug];
        }

        const { blocks = {} } =
          (await saveWorkspace({
            id: workspaceId,
            blocks: lastBlocks,
          })) || {};

        const newBlock = { slug: newSlug, ...blocks[newSlug] };
        setBlock(newBlock);
        setSaving(false);
        return newBlock;
      } catch (e) {
        setSaving(false);
        throw e;
      }
    },
    [saveWorkspace, slug, workspaceId]
  );

  const deleteBlock: BlockContext['deleteBlock'] = useCallback(async () => {
    if (!workspaceId || !slug) return null;
    const { blocks: { [slug]: currentBlock, ...lastBlocks } = {} } =
      await api.getWorkspace(workspaceId);
    await saveWorkspace({
      id: workspaceId,
      blocks: lastBlocks,
    });
    return { ...currentBlock, slug };
  }, [saveWorkspace, slug, workspaceId]);

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      const block = await fetchBlock();
      setLoading(false);
      if (!block) return;
      setBlock(block);
    };
    initPage();
  }, [fetchBlock, slug]);

  if (loading) return <Loading />;
  if (notFound)
    return <NotFound icon={FileUnknownOutlined} text={t('pages.notFound')} />;

  if (!block || !slug) return null;

  return (
    <blockContext.Provider
      value={{
        block,
        loading,
        fetchBlock,
        saveBlock,
        saving,
        deleteBlock,
      }}
    >
      {children}
    </blockContext.Provider>
  );
};

export default BlockProvider;
