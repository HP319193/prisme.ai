import { Story } from '@storybook/react';
import { DualHeader } from '../';
// @ts-ignore
import icon from '../../../../services/console/icons/icon-prisme.svg';
import { DualHeaderProps } from './DualHeader';

export default {
  title: 'Groups/DualHeader',
  component: DualHeader,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template: Story<DualHeaderProps> = ({ t }) => (
  <DualHeader
    workspaces={['mon premier workspace', 'mon second workspace']}
    t={t}
    userName={'John Doe'}
    userAvatar={
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/240px-User-avatar.svg.png'
    }
    icon={<img src={icon} />}
    title="Mail: Réponse de vacances"
    onBack={() => console.log('clicked back')}
  />
);

export const Default = Template.bind({});
Default.args = {
  t: (text: string) => text,
};
