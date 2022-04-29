import CustomSelect, { CustomSelectProps } from './CustomSelect';
import { Story } from '@storybook/react';
import { useState } from 'react';
import { PicRightOutlined } from '@ant-design/icons';

export default {
  title: 'Components/CustomSelect',
  component: CustomSelect,
};

const Template: Story<CustomSelectProps> = (props: CustomSelectProps) => {
  const [value, setValue] = useState(
    props.options[0] as string | { value: string }
  );

  return (
    <CustomSelect
      {...props}
      value={typeof value === 'string' ? value : value.value}
      onChange={setValue}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  options: [
    { label: 'foo', value: 'foo' },
    'bar',
    { label: <PicRightOutlined />, value: '1', searchable: 'icon' },
    {
      label: (
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Click
          </button>{' '}
          Label
        </div>
      ),
      value: '1',
      searchable: 'icon',
    },
    { label: 'un groupe', options: ['a', 'b', 'c'] },
  ],
};
