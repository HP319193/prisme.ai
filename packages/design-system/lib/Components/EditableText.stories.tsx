import { EditableText } from '../';
import { Story } from '@storybook/react';
import { useState } from 'react';

export default {
  title: 'Components/EditableText',
  component: EditableText,
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

const Template: Story<any> = (
  {
    // value,
    // onChange
  }
) => {
  const [value, setValue] = useState('edit me !');

  return <EditableText value={value} onChange={setValue} />;
};

export const Default = Template.bind({});
Default.args = {
  type: 'regular',
};
