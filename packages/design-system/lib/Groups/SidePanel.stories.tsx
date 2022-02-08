import { Story } from '@storybook/react';
import {
  MenuTab,
  SidePanel,
  AutomationsList as AutomationsListComp,
} from '../';
import { SidePanelProps } from './SidePanel';
import React from 'react';
import InstructionsList from './InstructionsList';

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

export const AutomationsList = Template.bind({});
AutomationsList.args = {
  Header: <MenuTab items={['Apps', 'Automations']} onSelect={() => {}} />,
  children: (
    <AutomationsListComp
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

export const GraphInstructions = Template.bind({});
GraphInstructions.args = {
  children: (
    <InstructionsList
      instructionsCategories={{
        Logique: [
          { label: 'condition', value: 'condition' },
          { label: 'emit', value: 'emit' },
          { label: 'wait', value: 'wait' },
        ],
        Slack: [
          { label: 'say text', value: 'say text' },
          { label: 'say button', value: 'say button' },
          { label: 'say card', value: 'say card' },
        ],
        'Facebook Messenger': [],
      }}
    />
  ),
};

export const Empty = Template.bind({});
Empty.args = {
  children: undefined,
};
