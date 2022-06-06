import { Story } from '@storybook/react';
import { useState } from 'react';
import { BlockProvider } from '@prisme.ai/blocks';
import Form from './Form';

export default {
  title: 'Blocks/Form',
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
      <Form />
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
