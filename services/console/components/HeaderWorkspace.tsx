import { useMemo } from 'react';
import { CodeOutlined } from '@ant-design/icons';
import { Menu, Dropdown, Space } from '@prisme.ai/design-system';
import { useWorkspaces } from './WorkspacesProvider';
import { useWorkspace } from '../layouts/WorkspaceLayout';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Header from './Header';

const HeaderWorkspace = () => {
  const { t } = useTranslation('workspaces');
  const { workspaces } = useWorkspaces();
  const {
    workspace: { id, name: currentWorkspace },
    displaySource,
  } = useWorkspace();
  const { push } = useRouter();

  const workspacesMenu = useMemo(
    () => (
      <Menu
        items={[
          {
            label: (
              <Space>
                <CodeOutlined />
                {t(`expert.${displaySource ? 'hide' : 'show'}`)}
              </Space>
            ),
            key: 'source',
          },
        ]}
        onClick={(item) => {
          if (typeof item === 'string') return;
          switch (item.key) {
            case 'source':
              push(`/workspaces/${id}/${displaySource ? '' : 'source'}`);
          }
        }}
      />
    ),
    [t, displaySource, push, id]
  );

  // const share = useCallback(() => {
  //   console.log('share');
  // }, []);
  return (
    <Header
      title={<Dropdown Menu={workspacesMenu}>{currentWorkspace}</Dropdown>}
      // leftContent={
      //   <Button variant="grey" onClick={share}>
      //     <Space>
      //       {t('workspace.share')}
      //       <ShareAltOutlined />
      //     </Space>
      //   </Button>
      // }
    />
  );
};

export default HeaderWorkspace;
