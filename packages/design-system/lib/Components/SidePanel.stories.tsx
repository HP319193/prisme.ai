import { SidePanel } from '../';
import { Story } from '@storybook/react';
import { SidePanelProps } from './SidePanel';

export default {
  title: 'Components/SidePanel',
  component: SidePanel,
};

const Template: Story<SidePanelProps> = ({ children, ...props }) => (
  <div className="h-[400px] w-[300px]">
    <SidePanel {...props}>{children}</SidePanel>
  </div>
);

export const Default = Template.bind({});
Default.args = {
  variant: 'rounded',
  children: <div>Panel content</div>,
};

export const Squared = Template.bind({});
Squared.args = {
  variant: 'squared',
  children: <div>Panel content</div>,
};
