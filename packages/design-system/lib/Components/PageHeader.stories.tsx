import { Button, PageHeader } from '../index';
import { PageHeaderProps } from './PageHeader';
import { Story } from '@storybook/react';

export default {
  title: 'Components/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'padded',
  },
};

const RightButtons = [
  <Button variant="grey" key="1">
    Button 1
  </Button>,
  <Button key="2">Button 2</Button>,
];

const Template: Story<PageHeaderProps> = (args: any) => (
  <PageHeader title={<div>'Send mail automation'</div>} {...args} />
);

export const Default = Template.bind({});
Default.args = {
  RightButtons: RightButtons,
};

export const WithoutButtons = Template.bind({});
WithoutButtons.args = {
  RightButtons: undefined,
};
