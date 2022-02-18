import React from 'react';
import { SelectProps } from './Select';
import { Select } from '../index';
import { Story } from '@storybook/react';

export default {
  title: 'Components/Select',
  component: Select,
  argTypes: {
    disabled: {
      control: { type: 'boolean' },
    },
  },
  parameters: {
    layout: 'centered',
  },
};

const Template: Story<SelectProps> = ({
  defaultValue,
  selectOptions,
  label,
}) => (
  <div className="w-[250px]">
    <Select
      defaultValue={defaultValue}
      selectOptions={selectOptions}
      label={label}
    />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  defaultValue: 'first option',
  label: 'Please select',
  selectOptions: [
    {
      value: 'first option',
      label: 'first option text',
    },
    {
      value: 'second option',
      label: 'second option text',
    },
    {
      value: 'third option',
      label: 'third option text',
    },
  ],
};
