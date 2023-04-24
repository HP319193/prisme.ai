import { Story } from '@storybook/react';
import { useEffect, useState } from 'react';
import { BlockProvider, BlocksProvider } from '../Provider';
import BlocksGrid from './BlocksGrid';

export default {
  title: 'Blocks/GridLayout',
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
        <BlocksGrid />
      </BlockProvider>
    </BlocksProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  defaultConfig: {
    globalLayout: {
      compactType: 'horizontal',
      autoSize: false,
      isBounded: true,
      maxRows: 1,
    },
    blocks: [
      {
        block: {
          slug: 'RichText',
          content: '<p>Column 1</p>',
          css: ':block {\n  border: 1px solid lightgreen;\n  height: 100%;\n}\n',
        },
        layout: {
          isDraggable: false,
          isResizable: true,
          resizeHandles: ['e'],
          x: 0,
          y: 0,
          h: 1,
          w: 4,
        },
      },
      {
        block: {
          slug: 'RichText',
          content: '<p>Column 2</p>',
          css: ':block {\n  border: 1px solid lightblue;\n  height: 100%;\n}\n',
        },
        layout: {
          isResizable: true,
          isDraggable: false,
          resizeHandles: ['e', 'w'],
          x: 1,
          y: 0,
          h: 1,
          w: 4,
        },
      },
      {
        block: {
          slug: 'RichText',
          content: '<p>Column 3</p>',
          css: ':block {\n  border: 1px solid cyan;\n  height: 100%;\n}\n',
        },
        layout: {
          isDraggable: false,
          isResizable: true,
          resizeHandles: ['w'],
          x: 2,
          y: 0,
          h: 1,
          w: 4,
        },
      },
    ],
    styles: {
      display: 'flex',
      flexDirection: 'row',
    },
  },
};
