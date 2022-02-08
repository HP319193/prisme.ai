import { Story } from '@storybook/react';
import { LoginForm } from '../';
import { LoginFormProps } from './LoginForm';
import React from 'react';

export default {
  title: 'Groups/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'centered',
  },
};

const Template: Story<LoginFormProps> = ({ t }) => <LoginForm t={t} />;

export const Default = Template.bind({});
Default.args = {
  t: (text: string) => text,
};
