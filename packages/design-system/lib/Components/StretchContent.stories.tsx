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

  return (
    <div className="w-72">
      <Button onClick={() => setVisible(!visible)}>Toggle</Button>
      <StretchContent visible={visible}>
        <Title>Some title</Title>
        <Button>Some button</Button>
        <Button>Some button</Button>
        <Button>Some button</Button>
      </StretchContent>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  // initialTags: ['regular', 'hello'],
  // placeholder: 'type anything',
  // onChange: (text: string) => {},
};
