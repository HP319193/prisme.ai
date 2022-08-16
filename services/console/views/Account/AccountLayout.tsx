import Header from '../../components/Header';
import { Button, Layout } from '@prisme.ai/design-system';
import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useWorkspaces } from '../../components/WorkspacesProvider';
import { useTranslation } from 'next-i18next';
import Avatar from '../../icons/avatar.svgr';
import WorkspaceSimple from '../../icons/workspace-simple.svgr';

interface AccountLayoutProps {
  children: ReactNode;
}

const AccountLayout = ({ children }: AccountLayoutProps) => {
  const {
    push,
    query: { workspaceId },
  } = useRouter();
  const { workspaces } = useWorkspaces();

  const selectedClassName =
    '!bg-[#E6EFFF] !text-accent !font-semibold !text-accent';

  const { t } = useTranslation('user');

  return (
    <Layout Header={<Header />} contentClassName="overflow-y-auto">
      <div className="flex flex-row h-full">
        <div className="flex flex-col grow space-y-5 h-full min-w-xs max-w-xs border-r border-gray-200 border-solid p-4 overflow-auto">
          <Button
            variant="grey"
            className={`!flex justify-start items-center hover:!text-accent !h-[3.125rem] hover:!bg-[#E6EFFF] ${
              !workspaceId ? selectedClassName : '!text-base'
            }`}
            onClick={() => push('/account')}
          >
            <div className="flex items-center justify-start h-[3.125rem]">
              <Avatar width={17} height={17} />
              <div className="ml-[0.813rem]">{t('account_my')}</div>
            </div>
          </Button>
          <Button
            disabled
            variant="grey"
            className={`!flex justify-start items-center !cursor-default !flex justify-start  ${
              workspaceId ? '!text-accent' : '!text-base'
            }`}
          >
            <WorkspaceSimple width={17} height={17} />
            <div className="ml-[0.813rem]">{t('workspaces')}</div>
          </Button>
          <div className="flex flex-col space-y-1 ml-4">
            {Array.from(workspaces).flatMap(([curWorkspaceId, workspace]) =>
              !!workspace
                ? [
                    <Button
                      key={curWorkspaceId}
                      variant="grey"
                      className={`!flex items-center justify-start !h-[3.125rem] hover:!bg-[#E6EFFF] ${
                        workspaceId === curWorkspaceId ? selectedClassName : ''
                      }`}
                      onClick={() =>
                        push(`/account/workspaces/${curWorkspaceId}`)
                      }
                    >
                      {workspace.name}
                    </Button>,
                  ]
                : []
            )}
          </div>
        </div>
        {children}
      </div>
    </Layout>
  );
};

export default AccountLayout;
