import { EditableTitle } from '../';
import { Story } from '@storybook/react';
import { useState } from 'react';

export default {
  title: 'Components/EditableTitle',
  component: EditableTitle,
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

  return <EditableTitle value={value} onChange={setValue} level={4} />;
};

export const Default = Template.bind({});
Default.args = {
  type: 'regular',
};
