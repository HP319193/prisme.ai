import { FC, ReactElement } from 'react';
import WorkspaceLayout from './WorkspaceLayout';
import WorkspaceProvider from '../../providers/Workspace';
import { useRouter } from 'next/router';
import { useWorkspaces } from '../../providers/Workspaces';

export * from './WorkspaceLayout';

const WithWorkspace: FC = ({ children }) => {
  const {
    query: { id },
  } = useRouter();
  const { refreshWorkspace } = useWorkspaces();

  return (
    <WorkspaceProvider id={`${id}`} onUpdate={refreshWorkspace}>
      {children}
    </WorkspaceProvider>
  );
};

export const getLayout = (page: ReactElement) => {
  return (
    <WithWorkspace>
      <WorkspaceLayout>{page}</WorkspaceLayout>
    </WithWorkspace>
  );
};

export default getLayout;
