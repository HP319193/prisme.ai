import { Story } from '@storybook/react';
import { BlockProvider } from './Block';
import { useState } from 'react';
import { useBlock } from './Block/context';
import Input from './Input';
import { Title } from '../index';

export default {
  title: 'Components/Block',
};

const FakeBlock = () => {
  const { config = {}, setConfig, appConfig = {}, setAppConfig } = useBlock();
  return (
    <div>
      <div>This Block uses `useBlock` to communicate with its host.</div>
      <div>
        Add a foo value to Block config:
        <Input
          value={config.foo || ''}
          onChange={({ target: { value } }) =>
            setConfig({
              foo: value,
            })
          }
        />
      </div>
      <div>
        Add a bar value to app instance config:
        <Input
          value={appConfig.bar || ''}
          onChange={({ target: { value } }) =>
            setAppConfig({
              bar: value,
            })
          }
        />
      </div>
    </div>
  );
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
      <>
        <Title level={2}>Block exemple:</Title>
        <FakeBlock />
        <Title level={2}>Current block config:</Title>
        <pre>
          <code>{JSON.stringify(config, null, '  ')}</code>
        </pre>
        <Title level={2}>Current App instance config:</Title>
        <pre>
          <code>{JSON.stringify(appConfig, null, '  ')}</code>
        </pre>
      </>
    </BlockProvider>
  );
};

export const Default = Template.bind({});
