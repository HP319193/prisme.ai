import { Story } from '@storybook/react';
import { useState } from 'react';
import SchemaFormBuilder from './SchemaFormBuilder';

const story = {
  title: 'Console/SchemaFormBuilder',
};
export default story;

const Template: Story<any> = () => {
  const [value, setValue] = useState({});
  return <SchemaFormBuilder value={value} onChange={setValue} />;
};

export const Default = Template.bind({});
