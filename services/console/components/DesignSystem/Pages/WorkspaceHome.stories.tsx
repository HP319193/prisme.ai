import { WorkspaceHome } from '../';
import { Story } from '@storybook/react';
import { WorkspaceHomeProps } from './WorkspaceHome';

export default {
  title: 'Pages/WorkspaceHome',
  component: WorkspaceHome,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template: Story<WorkspaceHomeProps> = ({}) => <WorkspaceHome />;

export const Default = Template.bind({});
Default.args = {};
