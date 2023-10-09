import { BlockComponent, loadModule } from '@prisme.ai/blocks';
import { Schema } from '@prisme.ai/design-system';
import { createContext, ReactNode, useCallback, useState } from 'react';
import { useContext } from '../../utils/useContext';
import useLocalizedText from '../../utils/useLocalizedText';
import getEditSchema from '../PageBuilder/Panel/EditSchema/getEditSchema';
import useBlocks, { BlockInCatalog } from '../PageBuilder/useBlocks';

interface BlocksListEditorContext {
  blocks: BlockInCatalog[];
  schemas: Map<string, Schema>;
  getSchema: (slug: string) => Promise<Schema | undefined>;
}

export const blockSelectorContext = createContext<
  BlocksListEditorContext | undefined
>(undefined);

export const useBlocksListEditor = () =>
  useContext<BlocksListEditorContext>(blockSelectorContext);

interface BlocksListEditorProviderProps {
  children: ReactNode;
}

const SCHEMAS = new Map<string, Schema>();
const CACHE = new Map<string, Schema | null>();

export const BlocksListEditorProvider = ({
  children,
}: BlocksListEditorProviderProps) => {
  const { variants: blocks } = useBlocks();
  const { localizeSchemaForm } = useLocalizedText();
  const [schemas, setSchemas] = useState(SCHEMAS);

  const fetchSchema = useCallback(
    async (slug: string) => {
      if (!slug) return null;
      const inCatalog = blocks.find(({ slug: bslug }) => slug === bslug);

      if (!inCatalog) return;

      if (inCatalog.builtIn) {
        const schema = getEditSchema(slug);
        if (!schema) return;
        SCHEMAS.set(slug, localizeSchemaForm(schema));
        setSchemas(SCHEMAS);
        return schema;
      }
      if (inCatalog.url) {
        if (!CACHE.has(inCatalog.url)) {
          const module = await loadModule<BlockComponent>(inCatalog.url);
          if (module && module.schema) {
            SCHEMAS.set(slug, module.schema || null);
            setSchemas(SCHEMAS);
            CACHE.set(inCatalog.url, module.schema);
          }
        }
        return CACHE.get(inCatalog.url);
      }
      if (inCatalog.schema) {
        SCHEMAS.set(slug, localizeSchemaForm(inCatalog.schema));
        setSchemas(SCHEMAS);
        return inCatalog.schema;
      }
    },
    [blocks, localizeSchemaForm]
  );

  const getSchema = useCallback(
    async (slug) => {
      return (await fetchSchema(slug)) || undefined;
    },
    [fetchSchema]
  );

  return (
    <blockSelectorContext.Provider
      value={{
        blocks,
        schemas,
        getSchema,
      }}
    >
      {children}
    </blockSelectorContext.Provider>
  );
};

export default BlocksListEditorProvider;
