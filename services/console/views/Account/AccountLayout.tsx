import Header from '../../components/Header';
import { Button, Layout } from '@prisme.ai/design-system';
import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import Avatar from '../../icons/avatar.svgr';
import WorkspaceSimple from '../../icons/workspace-simple.svgr';
import { useWorkspaces } from '../../providers/Workspaces';

interface AccountLayoutProps {
  children: ReactNode;
}

const AccountLayout = ({ children }: AccountLayoutProps) => {
  const {
    query: { workspaceId },
  } = useRouter();
  const { workspaces } = useWorkspaces();

  const selectedClassName =
    '!bg-[#E6EFFF] !text-accent !font-semibold !text-accent';

  const { t } = useTranslation('user');

  return (
    <Layout Header={<Header />} contentClassName="overflow-y-auto">
      <div className="flex flex-row h-full">
        <div className="flex flex-col flex-1 space-y-5 h-full min-w-xs max-w-xs border-r border-gray-200 border-solid p-4 overflow-auto">
          <Link href="/account" passHref>
            <Button
              variant="grey"
              className={`!flex justify-start items-center hover:!text-accent !h-[3.125rem] hover:!bg-[#E6EFFF] ${
                !workspaceId ? selectedClassName : '!text-base'
              }`}
            >
              <div className="flex items-center justify-start h-[3.125rem]">
                <Avatar width={17} height={17} />
                <div className="ml-[0.813rem]">{t('account_my')}</div>
              </div>
            </Button>
          </Link>
          <Button
            disabled
            variant="grey"
            className={`!flex justify-start items-center !cursor-default ${
              workspaceId ? '!text-accent' : '!text-base'
            }`}
          >
            <WorkspaceSimple width={17} height={17} />
            <div className="ml-[0.813rem]">{t('workspaces')}</div>
          </Button>
          <div className="flex flex-col space-y-1 ml-4">
            {workspaces.flatMap((workspace) =>
              !!workspace
                ? [
                    <Link
                      href={`/account/workspaces/${workspace.id}`}
                      passHref
                      key={workspace.id}
                    >
                      <Button
                        variant="grey"
                        className={`!flex items-center justify-start !h-[3.125rem] hover:!bg-[#E6EFFF] ${
                          workspaceId === workspace.id ? selectedClassName : ''
                        }`}
                      >
                        {workspace.name}
                      </Button>
                    </Link>,
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
