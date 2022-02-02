import { ReactElement } from 'react';
import WorkspaceLayout from './WorkspaceLayout';

export * from './context';
export * from './WorkspaceLayout';

export const getLayout = (page: ReactElement) => {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

export default getLayout;
