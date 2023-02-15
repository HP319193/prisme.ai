import { BlockComponent, loadModule } from '@prisme.ai/blocks';
import { Schema } from '@prisme.ai/design-system';
import { createContext, FC, useCallback, useEffect, useState } from 'react';
import { useContext } from '../../../utils/useContext';
import useLocalizedText from '../../../utils/useLocalizedText';
import getEditSchema from '../../PageBuilder/Panel/EditSchema/getEditSchema';
import useBlocks, { BlockInCatalog } from '../../PageBuilder/useBlocks';

interface BlockSelectorContext {
  blocks: BlockInCatalog[];
  selectBlock: (selected: string | null) => void;
  selectedBlock: BlockInCatalog;
  schema: Schema | null;
}

export const blockSelectorContext = createContext<
  BlockSelectorContext | undefined
>(undefined);

export const useBlockSelector = () =>
  useContext<BlockSelectorContext>(blockSelectorContext);

export const BlockSelectorProvider: FC = ({ children }) => {
  const { variants: blocks } = useBlocks();
  const [selectedBlock, setSelectedBlock] = useState<BlockInCatalog | null>(
    null
  );
  const [schema, setSchema] = useState<Schema | null>(null);
  const { localizeSchemaForm } = useLocalizedText();

  const fetchSchema = useCallback(
    async (block: BlockInCatalog | null) => {
      // This await goal is to force a re-render
      await setSchema(null);
      if (!block) return null;
      if (block.builtIn) {
        const schema = getEditSchema(block.slug);
        setSchema(schema && localizeSchemaForm(schema));
        return;
      }
      if (block.url) {
        const module = await loadModule<BlockComponent>(block.url);
        if (module && module.schema) {
          setSchema(module.schema);
        }
      }
    },
    [localizeSchemaForm]
  );

  const selectBlock: BlockSelectorContext['selectBlock'] = useCallback(
    (blockSlug) => {
      const block = blocks.find(({ slug }) => slug === blockSlug);
      setSelectedBlock(block || null);
      fetchSchema(block || null);
    },
    [blocks, fetchSchema]
  );

  return (
    <blockSelectorContext.Provider
      value={{
        blocks,
        selectBlock,
        schema,
      }}
    >
      {children}
    </blockSelectorContext.Provider>
  );
};
