import { ReactElement } from 'react';
import WorkspaceLayout from './WorkspaceLayout';
import { WorkspaceProvider } from '../../components/WorkspaceProvider';

export * from './WorkspaceLayout';

export const getLayout = (page: ReactElement) => {
  return (
    <WorkspaceProvider>
      <WorkspaceLayout>{page}</WorkspaceLayout>
    </WorkspaceProvider>
  );
};

export default getLayout;
