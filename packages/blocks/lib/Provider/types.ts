import { ReactNode } from 'react';
import { Schema } from '@prisme.ai/design-system';

export type Block = ((props: {
  workspaceId: string;
  appInstance: string;
  language: string;
}) => ReactNode) & {
  schema?: Schema;
};
