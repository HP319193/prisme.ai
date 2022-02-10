import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Collapse, Feed, FeedHeader, Layout } from '../';

import { Space } from 'antd';
import { CollapseItem } from '../Components/Collapse';

const headerButtons = [
  <Button key="filter">
    <Space>
      <FilterOutlined />
      Filter
    </Space>
  </Button>,
  <Button variant="grey" key="Search">
    <Space>
      <SearchOutlined />
      Search
    </Space>
  </Button>,
];

const WorkspaceFeedHeader = <FeedHeader buttons={headerButtons} />;

export type FeedSection = {
  title: string;
  content: CollapseItem[];
};

export interface WorkspaceFeedProps {
  sections: FeedSection[];
}

const WorkspaceFeed = ({ sections }: WorkspaceFeedProps) => {
  const feedSections = sections.map(({ title, content }) => ({
    title,
    content: <Collapse items={content} />,
  }));

  return (
    <Layout Header={WorkspaceFeedHeader}>
      <div className="p-2 flex grow">
        <Feed sections={feedSections} />
      </div>
    </Layout>
  );
};

export default WorkspaceFeed;
