import { ListItem } from '../';
import { Story } from '@storybook/react';
import { ListItemProps } from './ListItem';

export default {
  title: 'Components/ListItem',
  component: ListItem,
  argTypes: {
    type: {
      options: ['grey', 'regular'],
      control: { type: 'select' },
    },
  },
  parameters: {
    layout: 'centered',
  },
};

const Template: Story<ListItemProps> = ({ title, content }) => (
  <ListItem title={title} content={content} />
);

export const Default = Template.bind({});
Default.args = {
  title: 'Element title',
  content: 'element content',
};
