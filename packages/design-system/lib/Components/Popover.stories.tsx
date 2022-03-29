import { Button, Popover } from '../';
import { Story } from '@storybook/react';
import { PopoverProps } from './Popover';
import { useState } from 'react';

export default {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
};

const Template: Story<PopoverProps> = ({
  placement,
  title,
  children,
  content,
}) => (
  <Popover title={title} content={content} placement={placement}>
    {children}
  </Popover>
);

export const Default = Template.bind({});
Default.args = {
  content: ({}) => <div>I'm a popover</div>,
  children: <Button>Click me !</Button>,
  title: 'A title !',
  placement: 'bottom',
};

export const Controlled = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Popover
        visible={visible}
        title="Hello"
        content={() => (
          <div>
            <div>World</div>
            <button onClick={() => setVisible(false)}>Close</button>
          </div>
        )}
      />
      <button onClick={() => setVisible(!visible)}>Click me</button>
    </>
  );
};
