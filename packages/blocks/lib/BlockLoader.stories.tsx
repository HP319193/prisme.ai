import { Story } from '@storybook/react';
import { useBlock } from '@prisme.ai/Blocks';
import { Input, Loading } from '@prisme.ai/design-system';
import { useState } from 'react';
import { BlockLoader } from './BlockLoader';

export default {
  title: 'Blocks/BlockLoader',
};

const FakeBlock = () => {
  const { config = {}, setConfig, appConfig = {}, setAppConfig } = useBlock();

  if (!setConfig || !setAppConfig) {
    return <Loading />;
  }

  return (
    <div>
      <div>This Block uses `useBlock` to communicate with its host.</div>
      <div>
        config:
        <Input
          value={config.foo || ''}
          onChange={({ target: { value } }) =>
            setConfig({
              foo: value,
            })
          }
        />
        {JSON.stringify(config)}
      </div>
      <div>
        app instance config:
        <Input
          value={appConfig.bar || ''}
          onChange={({ target: { value } }) =>
            setAppConfig({
              bar: value,
            })
          }
        />
        {JSON.stringify(appConfig)}
      </div>
    </div>
  );
};

const Template: Story<any> = () => {
  const [config, setConfig] = useState<any>();
  const [appConfig, setAppConfig] = useState<any>();

  return (
    <BlockLoader
      config={config}
      onConfigUpdate={setConfig}
      appConfig={appConfig}
      onAppConfigUpdate={setAppConfig}
      prismeaiSDK={{}}
      entityId={'0'}
    >
      <FakeBlock />
    </BlockLoader>
  );
};

export const Default = Template.bind({});
