import { Story } from '@storybook/react';
import { useEffect, useState } from 'react';
import { BlockProvider, BlocksProvider } from '../Provider';
import BlocksList from './BlocksList';

export default {
  title: 'Blocks/BlocksList',
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
        <BlocksList />
      </BlockProvider>
    </BlocksProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  defaultConfig: {
    blocks: [
      {
        slug: 'Header',
        title: 'Some title',
      },
      {
        slug: 'RichText',
        content: '<p>Hello <strong>World</strong></p>',
      },
    ],
    styles: {
      display: 'flex',
      flexDirection: 'row',
    },
  },
};
