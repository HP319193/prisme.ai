import { GraphSidePanel } from '../index';
import { Story } from '@storybook/react';
import { GraphSidePanelProps } from './GraphSidePanel';

export default {
  placeholder: 'Groups/GraphSidePanel',
  component: GraphSidePanel,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template: Story<GraphSidePanelProps> = ({ children }) => (
  <GraphSidePanel>{children}</GraphSidePanel>
);

export const Default = Template.bind({});
Default.args = {
  children: <div>Graph component editor will be here</div>,
};
