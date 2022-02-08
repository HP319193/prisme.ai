import { Story } from '@storybook/react';
import { SidePanel, SidePanelAutomations } from '../';
import { SidePanelProps } from './SidePanel';
import React from 'react';

export default {
  title: 'Groups/SidePanel',
  component: SidePanel,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template: Story<SidePanelProps> = ({ children }) => (
  <SidePanel>{children}</SidePanel>
);

export const Default = Template.bind({});
Default.args = {
  children: undefined,
};

export const Automations = Template.bind({});
Automations.args = {
  children: (
    <SidePanelAutomations
      automations={[
        { title: 'Mail', content: 'Réponse automatique vacances' },
        { title: 'Bot', content: 'Gérer compte client' },
        { title: 'Mail', content: 'Réponse automatique vacances' },
        { title: 'Bot', content: 'Gérer compte client' },
        { title: 'Mail', content: 'Réponse automatique vacances' },
        { title: 'Bot', content: 'Gérer compte client' },
        { title: 'Mail', content: 'Réponse automatique vacances' },
        { title: 'Bot', content: 'Gérer compte client' },
        { title: 'Mail', content: 'Réponse automatique vacances' },
        { title: 'Bot', content: 'Gérer compte client' },
        { title: 'Mail', content: 'Réponse automatique vacances' },
        { title: 'Bot', content: 'Gérer compte client' },
        { title: 'Mail', content: 'Réponse automatique vacances' },
        { title: 'Bot', content: 'Gérer compte client' },
        { title: 'Mail', content: 'Réponse automatique vacances' },
        { title: 'Bot', content: 'Gérer compte client' },
      ]}
    />
  ),
};
