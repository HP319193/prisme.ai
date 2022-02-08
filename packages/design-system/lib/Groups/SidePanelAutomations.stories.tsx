import { Story } from '@storybook/react';
import SidePanelAutomations, {
  SidePanelAutomationsProps,
} from './SidePanelAutomations';

export default {
  title: 'Groups/SidePanelAutomations',
  component: SidePanelAutomations,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template: Story<SidePanelAutomationsProps> = ({ automations }) => (
  <SidePanelAutomations automations={automations} />
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
