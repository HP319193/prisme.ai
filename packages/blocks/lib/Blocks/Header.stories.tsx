import { Story } from '@storybook/react';
import { useState } from 'react';
import { BlockProvider } from '@prisme.ai/blocks';
import Header from './Header';

export default {
  title: 'Blocks/Header',
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
      <Header edit={false} />
    </BlockProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  defaultConfig: {
    title: 'test',
    nav: [
      {
        type: 'external',
        text: 'link 1',
        value: 'http://google.com',
      },
    ],
  },
};
