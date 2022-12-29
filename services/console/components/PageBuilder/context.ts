import { createContext } from 'react';
import { Schema } from '@prisme.ai/design-system';
import { BlockInCatalog } from './useBlocks';
import { useContext } from '../../utils/useContext';

export type Block = NonNullable<Prismeai.Page['blocks']>[number];
export type BlocksWithKeys = Map<string, Block>;

export interface PageBuilderContext {
  value: BlocksWithKeys;
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
