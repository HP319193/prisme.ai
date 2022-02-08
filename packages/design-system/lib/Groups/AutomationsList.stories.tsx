import { Story } from '@storybook/react';
import AutomationsList, { AutomationsListProps } from './AutomationsList';

export default {
  title: 'Groups/AutomationsList',
  component: AutomationsList,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template: Story<AutomationsListProps> = ({ automations }) => (
  <AutomationsList automations={automations} />
);

export const Default = Template.bind({});
Default.args = {
  automations: [
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
  ],
};
