import { Input } from '../';
import { Story } from '@storybook/react';
import { InputProps } from './Input';

export default {
  placeholder: 'Components/Input',
  component: Input,
  argTypes: {
    inputType: {
      options: ['text', 'password'],
      control: { type: 'select' },
    },
  },
  parameters: {
    layout: 'centered',
  },
};

const Template: Story<InputProps> = ({ placeholder, inputType }) => (
  <Input placeholder={placeholder} inputType={inputType} />
);

export const Default = Template.bind({});
Default.args = {
  placeholder: 'type anything',
  inputType: 'text',
};

export const Password = Template.bind({});
Password.args = {
  placeholder: 'enter your password',
  inputType: 'password',
};
