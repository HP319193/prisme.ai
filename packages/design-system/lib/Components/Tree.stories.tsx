import React from 'react';
import { TreeData, TreeProps } from './Tree';
import { Tree } from '../index';
import { Story } from '@storybook/react';
import { DataNode } from 'antd/es/tree';

const x = 3;
const y = 2;
const z = 1;
const defaultData: DataNode[] = [];

const generateData = (
  _level: number,
  _preKey?: React.Key,
  _tns?: DataNode[]
) => {
  const preKey = _preKey || '0';
  const tns = _tns || defaultData;

  const children = [];
  for (let i = 0; i < x; i++) {
    const key = `${preKey}-${i}`;
    tns.push({ title: key, key });
    if (i < y) {
      children.push(key);
    }
  }
  if (_level < 0) {
    return tns;
  }
  const level = _level - 1;
  children.forEach((key, index) => {
    tns[index].children = [];
    return generateData(level, key, tns[index].children);
  });
};
generateData(z);

const dataList: { key: React.Key; title: string }[] = [];
const generateList = (data: DataNode[]) => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    const { key } = node;
    dataList.push({ key, title: key as string });
    if (node.children) {
      generateList(node.children);
    }
  }
};
generateList(defaultData);

export default {
  title: 'Components/Tree',
  component: Tree,
  argTypes: {
    type: {
      options: ['default', 'primary', 'grey', 'link'],
      control: { type: 'select' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
  parameters: {
    layout: 'centered',
  },
};

const Template: Story<TreeProps> = ({ data, defaultExpandAll }) => (
  <Tree data={data} defaultExpandAll={defaultExpandAll} />
);

export const Default = Template.bind({});
Default.args = {
  data: defaultData,
};

export const WorkspaceSidebar = Template.bind({});
WorkspaceSidebar.args = {
  defaultExpandAll: true,
  data: [
    {
      onAdd: () => {},
      title: 'Automations',
      key: 'Automations',
      selectable: false,
      children: [
        {
          title: 'my automation 1',
          key: 'my automation 1',
          onDelete: (...props) => console.log(props),
        },
        {
          title: 'my automation 2',
          key: 'my automation 2',
          onDelete: (...props) => console.log(props),
        },
        {
          title: 'my automation 3',
          key: 'my automation 3',
          onDelete: (...props) => console.log(props),
        },
      ],
    },
    {
      onAdd: () => {},
      title: 'Pages',
      key: 'Pages',
      selectable: false,
      children: [
        {
          title: 'my Page 1',
          key: 'my Page 1',
          onDelete: (...props) => console.log(props),
        },
        {
          title: 'my Page 2',
          key: 'my Page 2',
          onDelete: (...props) => console.log(props),
        },
        {
          title: 'my Page 3',
          key: 'my Page 3',
          onDelete: (...props) => console.log(props),
        },
      ],
    },
    {
      onAdd: () => {},
      title: 'Apps',
      key: 'Apps',
      selectable: false,
      children: [
        {
          title: 'my app 1',
          key: 'my app 1',
          onDelete: (...props) => console.log(props),
        },
        {
          title: 'my app 2',
          key: 'my app 2',
          onDelete: (...props) => console.log(props),
        },
        {
          title: 'my app 3',
          key: 'my app 3',
          onDelete: (...props) => console.log(props),
        },
      ],
    },
  ] as TreeData[],
};
