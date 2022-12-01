import { Story } from '@storybook/react';
import { useState } from 'react';
import { Title } from '..';
import Button from './Button';
import StretchContent from './StretchContent';

export default {
  title: 'Components/StretchContent',
  component: StretchContent,
};

const Template: Story<any> = () => {
  const [visible, setVisible] = useState(false);
  const [lines, setLines] = useState(['', '', '']);

  return (
    <div className="w-72">
      <Button onClick={() => setVisible(!visible)}>Toggle</Button>
      <StretchContent visible={visible}>
        <Title>Some title</Title>
        <button
          onClick={() =>
            setLines((lines) => {
              return [...lines, ''];
            })
          }
        >
          Add line
        </button>
        {lines.map((k) => (
          <Button key={k}>Some button</Button>
        ))}
      </StretchContent>
      <div>Footer</div>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  // initialTags: ['regular', 'hello'],
  // placeholder: 'type anything',
  // onChange: (text: string) => {},
};
