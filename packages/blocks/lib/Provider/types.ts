import { ReactElement, ReactNode } from 'react';
import { Schema } from '@prisme.ai/design-system';

export type Block = ((props: {
  workspaceId: string;
  appInstance: string;
  language: string;
}) => ReactNode) & {
  schema?: Schema;
};

interface BlockLoaderProps {
  // Block name
  name: string;
  // Block config
  config?: any;
  // Callback called on block load. Usefull for external Blocks
  onLoad?: () => void;
  // Container element
  container?: HTMLElement;
}
export type TBlockLoader = (props: BlockLoaderProps) => ReactElement | null;
