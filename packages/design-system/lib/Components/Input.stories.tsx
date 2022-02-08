import { Input } from '../';
import { Story } from '@storybook/react';
import { InputProps } from './Input';

export default {
  placeholder: 'Components/Input',
  component: Input,
  argTypes: {
    type: {
      options: ['text', 'password'],
      control: { type: 'select' },
    },
  },
  parameters: {
    layout: 'centered',
  },
};

const Template: Story<InputProps> = ({ placeholder, type }) => (
  <Input placeholder={placeholder} type={type} />
);

export const Default = Template.bind({});
Default.args = {
  placeholder: 'type anything',
  type: 'text',
};

export const Password = Template.bind({});
Password.args = {
  placeholder: 'enter your password',
  type: 'password',
};
