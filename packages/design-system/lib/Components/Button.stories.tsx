import React from 'react';
import { ButtonProps } from './Button';
import { Button } from '../index';
import { Story } from '@storybook/react';

export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    type: {
      options: ['default', 'primary', 'grey', 'link'],
      control: { type: 'select' },
    },
  },
  parameters: {
    layout: 'centered',
  },
};

const Template: Story<ButtonProps> = ({ variant }) => (
  <Button variant={variant}>I am a button !</Button>
);

export const Default = Template.bind({});
Default.args = {
  variant: 'default',
};

export const Grey = Template.bind({});
Grey.args = {
  variant: 'grey',
};

export const Link = Template.bind({});
Link.args = {
  variant: 'link',
};

export const Plain = Template.bind({});
Plain.args = {
  variant: 'primary',
};
