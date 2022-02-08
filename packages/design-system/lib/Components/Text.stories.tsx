import { Text } from '../';
import { Story } from '@storybook/react';
import { TextProps } from './Text';

export default {
  title: 'Components/Text',
  component: Text,
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

const Template: Story<TextProps> = ({ type }) => (
  <Text type={type}>I am a text !</Text>
);

export const Default = Template.bind({});
Default.args = {
  type: 'regular',
};
export const Grey = Template.bind({});
Grey.args = {
  type: 'grey',
};
