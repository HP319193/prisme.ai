import { Story } from '@storybook/react';
import { useState } from 'react';
import { BlockProvider } from '../Provider';
import Buttons from './Buttons';

export default {
  title: 'Blocks/Buttons',
};

const Template: Story<any> = ({ defaultConfig }) => {
  const [config, setConfig] = useState<any>(defaultConfig);
  const [appConfig, setAppConfig] = useState<any>();

  return (
    <BlockProvider
      config={config}
      onConfigUpdate={setConfig}
      appConfig={appConfig}
      onAppConfigUpdate={setAppConfig}
    >
      <Buttons />
    </BlockProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  defaultConfig: {
    buttons: [
      {
        text: 'Button1',
        variant: 'default',
        onClick: 'hoho je suis le père noel',
      },
      {
        text: 'Button2',
        variant: 'primary',
        onClick: {
          event: 'who.am.i',
          payload: 'pere noel',
        },
      },
      {
        text: 'Mes messages',
        variant: 'default',
        tag: '50',
      },
      {
        text: 'Archived messages',
        variant: 'default',
        tag: '50',
        unselected: true,
      },
      {
        text: 'my url',
        variant: 'link',
      },
    ],
  },
};
