import { TagEditable } from '../';
import { Story } from '@storybook/react';
import { TagEditableProps } from './TagEditable';
import { useState } from 'react';

export default {
  title: 'Components/TagEditable',
  component: TagEditable,
  parameters: {
    layout: 'centered',
  },
};

const Template: Story<any> = (
  {
    // value,
    // placeholder,
    // onChange,
  }
) => {
  const [value, setValue] = useState(['test', 'test2']);
  const placeholder = 'type anything';

  return (
    <div className="w-72">
      <TagEditable
        value={value}
        placeholder={placeholder}
        onChange={setValue}
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  // initialTags: ['regular', 'hello'],
  // placeholder: 'type anything',
  // onChange: (text: string) => {},
};
