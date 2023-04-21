import { Story } from '@storybook/react';
import { useEffect, useState } from 'react';
import { BlockProvider, BlocksProvider } from '../Provider';
import BlocksSplit from './BlocksSplit';

export default {
  title: 'Blocks/BlocksSplit',
};

const Template: Story<any> = ({ defaultConfig }) => {
  const [config, setConfig] = useState<any>(defaultConfig);
  const [appConfig, setAppConfig] = useState<any>();

  useEffect(() => {
    setConfig(defaultConfig);
  }, [defaultConfig]);

  return (
    <BlocksProvider
      components={{
        Link: (props) => <a {...props} />,
        Loading: () => null,
        DownIcon: () => null,
        SchemaForm: () => null,
      }}
      externals={{}}
      utils={{
        BlockLoader: ({ name, ...config }) => <div>Block {name}</div>,
      }}
    >
      <BlockProvider
        config={config}
        onConfigUpdate={setConfig}
        appConfig={appConfig}
        onAppConfigUpdate={setAppConfig}
      >
        <BlocksSplit />
      </BlockProvider>
    </BlocksProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  defaultConfig: {
    firstBlock: {
      slug: 'Header',
      title: 'Some title',
    },
    secondBlock: {
      slug: 'RichText',
      content: '<p>Hello <strong>World</strong></p>',
    },
  },
};
