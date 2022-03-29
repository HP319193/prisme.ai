import { LayoutSelection } from '../';
import { Story } from '@storybook/react';
import { LayoutSelectionProps } from './LayoutSelection';

export default {
  title: 'Components/LayoutSelection',
  component: LayoutSelection,
  parameters: {
    layout: 'centered',
  },
};

const Template: Story<LayoutSelectionProps> = (props) => (
  <LayoutSelection {...props}>
    <div>hello it's children</div>
  </LayoutSelection>
);

export const Default = Template.bind({});
Default.args = {
  items: [
    {
      key: 'test1',
      title: 'test1',
    },
    {
      key: 'test2',
      title: 'test2',
    },
    {
      key: 'test3',
      title: 'test3',
    },
    {
      key: 'test4',
      title: 'test4',
    },
  ],
};

export const withHeader = Template.bind({});
withHeader.args = {
  Header: <div>This is a header</div>,
  items: [
    {
      key: 'test1',
      title: 'test1',
    },
    {
      key: 'test2',
      title: 'test2',
    },
    {
      key: 'test3',
      title: 'test3',
    },
    {
      key: 'test4',
      title: 'test4',
    },
  ],
};
