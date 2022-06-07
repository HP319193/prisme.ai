import { Story } from '@storybook/react';
import { BlockProvider, useBlock } from '../Provider';

export default {
  title: 'Blocks/Provider',
};

const Block = () => {
  const { config, appConfig } = useBlock();

  return (
    <div>
      <div>
        config:{' '}
        <pre>
          <code>{JSON.stringify(config)}</code>
        </pre>
      </div>
      <div>
        appConfig:{' '}
        <pre>
          <code>{JSON.stringify(appConfig)}</code>
        </pre>
      </div>
    </div>
  );
};

const Template: Story<any> = () => {
  const config = {
    foo: 'from the block',
  };
  const appConfig = {
    value: 'from an app',
  };
  return (
    <BlockProvider config={config} appConfig={appConfig}>
      <Block />
    </BlockProvider>
  );
};

export const Default = Template.bind({});
