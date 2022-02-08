import { Story } from '@storybook/react';
import InstructionsList, { InstructionsListProps } from './InstructionsList';

export default {
  title: 'Groups/InstructionsList',
  component: InstructionsList,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template: Story<InstructionsListProps> = ({ instructionsCategories }) => (
  <InstructionsList instructionsCategories={instructionsCategories} />
);

export const Default = Template.bind({});
Default.args = {
  instructionsCategories: {
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
  },
};
