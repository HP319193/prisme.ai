import { Story } from '@storybook/react';
import { SidePanel } from '../';
import { SidePanelProps } from './SidePanel';

export default {
  title: 'Groups/SidePanel',
  component: SidePanel,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template: Story<SidePanelProps> = ({}) => <SidePanel />;

export const Default = Template.bind({});
Default.args = {};
