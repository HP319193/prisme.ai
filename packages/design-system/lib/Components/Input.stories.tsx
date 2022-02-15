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

const Template: Story<InputProps> = ({ placeholder, inputType, label }) => (
  <Input placeholder={placeholder} inputType={inputType} label={label} />
);

export const Default = Template.bind({});
Default.args = {
  placeholder: 'type anything',
  label: 'Label',
  inputType: 'text',
};

export const Password = Template.bind({});
Password.args = {
  placeholder: 'enter your password',
  label: 'Label',
  inputType: 'password',
};
