import { LayoutSelection } from '../';
import { Story } from '@storybook/react';
import { LayoutSelectionProps } from './LayoutSelection';

export default {
  title: 'Components/LayoutSelection',
  component: LayoutSelection,
  parameters: {
    layout: 'fullscreen',
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
      id: 'test1',
      title: 'test1',
    },
    {
      id: 'test2',
      title: 'test2',
    },
    {
      id: 'test3',
      title: 'test3',
    },
    {
      id: 'test4',
      title: 'test4',
    },
  ],
};

export const withHeader = Template.bind({});
withHeader.args = {
  Header: <div>This is a header</div>,
  items: [
    {
      id: 'test1',
      title: 'test1',
    },
    {
      id: 'test2',
      title: 'test2',
    },
    {
      id: 'test3',
      title: 'test3',
    },
    {
      id: 'test4',
      title: 'test4',
    },
  ],
};
