import { SidePanel } from '../';
import { Story } from '@storybook/react';
import { SidePanelProps } from './SidePanel';

export default {
  title: 'Components/SidePanel',
  component: SidePanel,
  argTypes: {
    type: {
      options: ['grey', 'regular'],
      control: { type: 'select' },
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
};

const Template: Story<SidePanelProps> = ({ children }) => (
  <SidePanel>{children}</SidePanel>
);

export const Default = Template.bind({});
Default.args = {
  children: <div>Panel content</div>,
};
