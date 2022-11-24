import { Story } from '@storybook/react';
import { useState } from 'react';
import { BlockProvider, BlocksProvider } from '../Provider';
import Buttons from './Buttons';

export default {
  title: 'Blocks/Buttons',
};

const Template: Story<any> = ({ defaultConfig }) => {
  const [config, setConfig] = useState<any>(defaultConfig);
  const [appConfig, setAppConfig] = useState<any>();

  return (
    <BlocksProvider
      components={{
        Link: (props) => <a {...props} />,
        Loading: () => null,
        DownIcon: () => null,
      }}
      externals={{}}
    >
      <BlockProvider
        config={config}
        onConfigUpdate={setConfig}
        appConfig={appConfig}
        onAppConfigUpdate={setAppConfig}
      >
        <Buttons />
      </BlockProvider>
    </BlocksProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  defaultConfig: {
    buttons: [
      {
        text: 'Button1',
        variant: 'default',
        action: {
          type: 'event',
          value: 'button.je suis le pere noel',
        },
      },
      {
        text: 'Button2',
        variant: 'primary',
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
        action: {
          type: 'url',
          popup: true,
          value: 'http://studio.prisme.ai',
        },
      },
    ],
  },
};

export const SimpleButton = Template.bind({});
SimpleButton.args = {
  defaultConfig: {
    buttons: [
      {
        text: 'Click me',
        variant: 'primary',
      },
    ],
  },
};

export const TagButtons = Template.bind({});
TagButtons.args = {
  defaultConfig: {
    buttons: [
      {
        text: 'New notifications',
        variant: 'default',
        tag: '5',
      },
      {
        text: 'Archived',
        variant: 'default',
        unselected: true,
        tag: '25',
      },
      {
        text: 'Starred',
        variant: 'default',
        unselected: true,
        tag: '12',
      },
    ],
  },
};
