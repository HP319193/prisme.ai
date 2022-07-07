import { Story } from '@storybook/react';
import { useState } from 'react';
import { BlockProvider } from '../Provider';
import Cards from './Cards';

export default {
  title: 'Blocks/Cards',
};

const Template: Story<any> = () => {
  const [config, setConfig] = useState<any>({
    cards: [
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
    ],
  });
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
