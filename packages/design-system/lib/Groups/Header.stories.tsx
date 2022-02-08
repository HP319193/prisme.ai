import { Story } from '@storybook/react';
import { Header } from '../';
// @ts-ignore
import icon from '../../../../services/console/icons/icon-prisme.svg';
import { HeaderProps } from './Header';

export default {
  title: 'Groups/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template: Story<HeaderProps> = ({ t }) => (
  <Header
    workspaces={['mon premier workspace', 'mon second workspace']}
    t={t}
    userName={'John Doe'}
    userAvatar={
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/240px-User-avatar.svg.png'
    }
    icon={<img src={icon} />}
  />
);

export const Default = Template.bind({});
Default.args = {
  t: (text: string) => text,
};
