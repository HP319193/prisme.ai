import { createContext } from 'react';
import { Schema } from '@prisme.ai/design-system';
import { BlockInCatalog } from './useBlocks';
import { useContext } from '../../utils/useContext';

export type BlockWithKey = NonNullable<Prismeai.Page['blocks']>[number] & {
  key: string;
};

export interface PageBuilderContext {
  value: BlockWithKey[];
  addBlock: (position: number, blockName?: string) => void;
  setEditBlock: (blockId: string) => void;
  removeBlock: (key: string) => void;
  setBlockConfig: (key: string, config: any) => void;
  setBlockSchema: (blockId: string, schema: Schema | null) => void;
  catalog: BlockInCatalog[];
  blocksSchemas: Map<string, Schema | null>;
}

export const context = createContext<PageBuilderContext | undefined>(undefined);

export const usePageBuilder = () => useContext<PageBuilderContext>(context);
