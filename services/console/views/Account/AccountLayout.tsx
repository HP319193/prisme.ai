import Header from '../../components/Header';
import { Layout } from '@prisme.ai/design-system';
import { ReactElement, ReactNode, useState } from 'react';
import { useWorkspaces } from '../../providers/Workspaces';
import Navigation from './Components/Navigation';
import Expand from '../../components/Navigation/Expand';

interface AccountLayoutProps {
  children: ReactNode;
}

const AccountLayout = ({ children }: AccountLayoutProps) => {
  const { workspaces } = useWorkspaces();
  const [fullSidebar, setFullSidebar] = useState(true);
  return (
    <Layout Header={<Header />}>
      <div className="flex flex-row h-full">
        <Layout
          className={`${
            fullSidebar ? 'max-w-xs' : 'max-w-[4.2rem]'
          } transition-all p-0`}
        >
          <div className="flex w-full h-full border-r border-gray-200 border-solid flex-col justify-between overflow-hidden">
            <Navigation
              workspaces={workspaces}
              className="max-h-[calc(100%-3rem)]"
            />
            <Expand
              expanded={fullSidebar}
              onToggle={() => setFullSidebar(!fullSidebar)}
            />
          </div>
        </Layout>
        <div className="flex h-full flex-col flex-1 min-w-[500px] max-w-full">
          {children}
        </div>
      </div>
    </Layout>
  );
};

export const getLayout = (page: ReactElement) => {
  return <AccountLayout>{page}</AccountLayout>;
};

export default AccountLayout;
