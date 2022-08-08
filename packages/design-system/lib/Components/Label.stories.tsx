import React from 'react';
import { WithLabelProps } from './Label';
import { WithLabel } from '../index';
import { Story } from '@storybook/react';

export default {
  title: 'Components/Label',
  component: WithLabel,
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

const Template: Story<WithLabelProps> = ({ label, children }) => (
  <WithLabel label={label}>{children}</WithLabel>
);

export const Default = Template.bind({});
Default.args = {
  label: 'My Input',
  children: (
    <textarea style={{ border: '1px solid grey' }}>Input content</textarea>
  ),
};
