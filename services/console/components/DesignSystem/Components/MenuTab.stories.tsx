import { Story } from '@storybook/react';
import { MenuTab } from '../index';
import { action } from '@storybook/addon-actions';

const actionsData = {
  onSelect: action('onSelect'),
};

export default {
  title: 'Components/MenuTab',
  component: MenuTab,
  argsType: {
    items: {
      control: {
        type: 'array',
      },
    },
  },
  parameters: {
    layout: 'centered',
  },
};

const Template: Story = ({ onSelect, items = [] }) => (
  <div className="w-96">
    <MenuTab items={items} onSelect={onSelect} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  items: ['Automations', 'Apps'],
};
