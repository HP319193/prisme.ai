import { Story } from '@storybook/react';
import { useState } from 'react';
import { BlockProvider } from '../Provider';
import Development from './Development';

export default {
  title: 'Blocks/Development',
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
      <Development edit={false} />
    </BlockProvider>
  );
};

export const Default = Template.bind({});
