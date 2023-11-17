import { BlockComponent, loadModule } from '@prisme.ai/blocks';
import { Schema } from '@prisme.ai/design-system';
import { createContext, ReactNode, useCallback, useState } from 'react';
import { useContext } from '../../utils/useContext';
import getEditSchema from '../PageBuilder/Panel/EditSchema/getEditSchema';
import useBlocks, { BlockInCatalog } from '../PageBuilder/useBlocks';
import { extendsSchema } from './extendsSchema';

interface BlocksListEditorContext {
  blocks: BlockInCatalog[];
  schemas: Map<string, Schema>;
  getSchema: (slug: string) => Promise<Schema | undefined>;
  getModule: (slug: string) => Promise<BlockComponent<any> | undefined>;
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
const MODULES = new Map<string, Promise<BlockComponent<any> | undefined>>();
const CACHE = new Map<string, Schema | null>();

async function fetchModule(url: string) {
  if (!MODULES.get(url)) {
    MODULES.set(url, loadModule<BlockComponent>(url));
  }
  return await MODULES.get(url);
}

export const BlocksListEditorProvider = ({
  children,
}: BlocksListEditorProviderProps) => {
  const { variants: blocks } = useBlocks();
  const [schemas, setSchemas] = useState(SCHEMAS);

  const fetchSchema = useCallback(
    async (slug: string) => {
      if (!slug) return null;
      const inCatalog = blocks.find(({ slug: bslug }) => slug === bslug);

      if (!inCatalog) return;

      if (inCatalog.builtIn) {
        const schema = getEditSchema(slug);
        if (!schema) return;
        SCHEMAS.set(slug, schema);
        setSchemas(SCHEMAS);
        return schema;
      }
      if (inCatalog.url) {
        if (!CACHE.has(inCatalog.url)) {
          const module = await fetchModule(inCatalog.url);
          if (module && module.schema) {
            SCHEMAS.set(slug, module.schema || null);
            setSchemas(SCHEMAS);
            CACHE.set(inCatalog.url, module.schema);
          }
        }
        return CACHE.get(inCatalog.url);
      }
      if (inCatalog.schema) {
        SCHEMAS.set(slug, inCatalog.schema);
        setSchemas(SCHEMAS);
        return inCatalog.schema;
      }
    },
    [blocks]
  );

  const getModule = useCallback(
    async (slug: string) => {
      const inCatalog = blocks.find(({ slug: bslug }) => slug === bslug);
      if (!inCatalog?.url) return;
      const module = await fetchModule(inCatalog.url);
      return module;
    },
    [blocks]
  );

  const getSchema = useCallback(
    async (slug): Promise<Schema | undefined> => {
      async function getSchema(slug: string) {
        return (await fetchSchema(slug)) || undefined;
      }
      const schema = await getSchema(slug);
      if (!schema) return schema;
      return extendsSchema(schema, getSchema);
    },
    [fetchSchema]
  );

  return (
    <blockSelectorContext.Provider
      value={{
        blocks,
        schemas,
        getSchema,
        getModule,
      }}
    >
      {children}
    </blockSelectorContext.Provider>
  );
};

export default BlocksListEditorProvider;
