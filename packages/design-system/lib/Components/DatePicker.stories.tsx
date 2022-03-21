import { DatePicker } from '../';
import { Story } from '@storybook/react';
import { DatePickerProps } from './DatePicker';

export default {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
};

const Template: Story<DatePickerProps> = () => <DatePicker />;

export const Default = Template.bind({});
