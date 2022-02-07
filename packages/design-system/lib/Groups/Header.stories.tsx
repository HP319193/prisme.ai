import { Story } from '@storybook/react';
import { Header } from '../index';
import icon from '../../../../services/console/icons/icon-prisme.svg';

export default {
  title: 'Groups/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template: Story = () => (
  <Header
    workspaces={['mon premier workspace', 'mon second workspace']}
    shareText={'Partager'}
    userName={'John Doe'}
    userAvatar={
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/240px-User-avatar.svg.png'
    }
    icon={<img src={icon} />}
  />
);

export const Default = Template.bind({});
