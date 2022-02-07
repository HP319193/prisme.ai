import React from 'react';
import { Button, FeedHeader } from '../index';
import { Story } from '@storybook/react';
import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { Space } from 'antd';

export default {
  title: 'Components/FeedHeader',
  component: FeedHeader,
  parameters: {
    layout: 'centered',
  },
};

const Template: Story = (args: any) => <FeedHeader {...args} />;

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
export const Default = Template.bind({});
Default.args = {
  buttons: headerButtons,
};

export const WithNoButtons = Template.bind({});
WithNoButtons.args = {
  buttons: [],
};
