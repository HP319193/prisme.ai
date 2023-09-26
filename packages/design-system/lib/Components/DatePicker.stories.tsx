import { DatePicker } from '../';
import { Story } from '@storybook/react';
import { DatePickerProps } from './DatePicker';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
};

const Template: Story<DatePickerProps> = ({ label, ...props }) => (
  <DatePicker label={label} onChange={action('date changed')} {...props} />
);

export const Default = Template.bind({
  label: 'Select a date',
});
Default.args = {};
