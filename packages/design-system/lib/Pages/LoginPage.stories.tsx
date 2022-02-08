import { Story } from '@storybook/react';
import { LoginPage } from '../';
// @ts-ignore
import icon from '@prisme.ai/console/icons/icon-prisme.svg';

export default {
  title: 'Pages/LoginPage',
  component: LoginPage,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template: Story = () => (
  <LoginPage
    logoBig={
      <div className="flex flex-row">
        <img src={icon} />
        Prisme.ai
      </div>
    }
    t={(text: string) => text}
  />
);

export const Default = Template.bind({});
