import { Story } from '@storybook/react';
import { MenuTab, SidePanel, SidePanelAutomations } from '../';
import { SidePanelProps } from './SidePanel';
import React from 'react';

export default {
  title: 'Groups/SidePanel',
  component: SidePanel,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template: Story<SidePanelProps> = ({ Header, children }) => (
  <SidePanel Header={Header}>{children}</SidePanel>
);

export const Default = Template.bind({});
Default.args = {
  Header: <MenuTab items={['Apps', 'Automations']} onSelect={() => {}} />,
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

export const Empty = Template.bind({});
Empty.args = {
  children: undefined,
};
