import { Story } from '@storybook/react';
import { useState } from 'react';
import { BlockProvider } from '@prisme.ai/blocks';
import Cards from './Cards';

export default {
  title: 'Blocks/Cards',
};

const Template: Story<any> = () => {
  const [config, setConfig] = useState<any>();
  const [appConfig, setAppConfig] = useState<any>();

  return (
    <BlockProvider
      config={config}
      onConfigUpdate={setConfig}
      appConfig={appConfig}
      onAppConfigUpdate={setAppConfig}
    >
      <Cards edit={false} />
    </BlockProvider>
  );
};

export const Default = Template.bind({});
