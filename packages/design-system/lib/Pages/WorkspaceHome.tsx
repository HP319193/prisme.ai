import { Header, Layout, Row, Col } from '../';
import { useTranslation } from 'react-i18next';
import React from 'react';
import SidePanel from '../Groups/SidePanel';
import { WorkspaceFeed } from '../';
import { FeedSection } from '../Groups/WorkspaceFeed';
import { mockFeedSection } from '../mockData';

export interface WorkspaceHomeProps {}

const WorkspaceHome = ({}: any) => {
  const { t } = useTranslation('workspaces');

  // Start hooks mocks
  const workspacesNames = ['mon premier workspace', 'mon second workspace'];
  const user = {
    name: 'John Doe',
    avatar:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/240px-User-avatar.svg.png',
  };

  // importing mockData crash storybook ??
  const sections: FeedSection[] = [
    {
      title: 'TODAY',
      content: [
        {
          label: 'New contact on Hubspot',
          content: 'John doe is requesting a demo',
        },
        {
          label: 'New email from Nathan',
          content: 'Hello, I just wanted to spam your inbox',
        },
      ],
    },
    {
      title: 'Yesterday',
      content: [
        {
          label: 'New contact on Hubspot',
          content: 'John doe is requesting a demo',
        },
        {
          label: 'New email from Nathan',
          content: 'Hello, I just wanted to spam your inbox',
        },
      ],
    },
  ];
  // End hooks mocks

  return (
    <Layout
      Header={
        <Header
          workspaces={workspacesNames}
          shareText={t('share')}
          userName={user.name}
          userAvatar={user.avatar}
        />
      }
    >
      <Row className="grow">
        <Col span={18} className="flex">
          <WorkspaceFeed sections={sections} />
        </Col>
        <Col span={6} className="flex">
          <SidePanel />
        </Col>
      </Row>
    </Layout>
  );
};

export default WorkspaceHome;
