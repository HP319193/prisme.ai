import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Collapse, Feed, FeedHeader, Layout } from "../";

// Importing Space from above crash build
import { Space } from "antd";
import { CollapseItem } from "../Components/Collapse";

const headerButtons = [
  <Button key="filter">
    <Space>
      <FilterOutlined />
      Filter
    </Space>
  </Button>,
  <Button type="grey" key="Search">
    <Space>
      <SearchOutlined />
      Search
    </Space>
  </Button>,
];

const WorkspaceFeedHeader = <FeedHeader buttons={headerButtons} />;

export type Section = {
  title: string;
  content: CollapseItem[];
};

export interface WorkspaceFeedProps {
  sections: Section[];
}

const WorkspaceFeed = ({ sections }: WorkspaceFeedProps) => {
  const feedSections = sections.map(({ title, content }) => ({
    title,
    content: <Collapse items={content} />,
  }));

  return (
    <Layout Header={WorkspaceFeedHeader}>
      <Feed sections={feedSections} />
    </Layout>
  );
};

export default WorkspaceFeed;
