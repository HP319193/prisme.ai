import { ReactNode } from 'react';
import { Schema } from '../SchemaForm';

export type Block = ((props: {
  workspaceId: string;
  appInstance: string;
  language: string;
}) => ReactNode) & {
  schema?: Schema;
};
