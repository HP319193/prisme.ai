import { Events } from '@prisme.ai/sdk';
import { action } from '@storybook/addon-actions';
import { Story } from '@storybook/react';
import { useMemo } from 'react';
import { BlockProvider, BlocksProvider } from '../Provider';
import Header from './Header';

export default {
  title: 'Blocks/Header',
};

const Template: Story<any> = (config) => {
  const events = useMemo(
    () =>
      ({
        emit: (type: string, payload: any) => {
          action('emit')(type, payload);
        },
      } as Events),
    []
  );
  return (
    <div>
      <BlocksProvider
        components={{
          Link: ({ children }) => <a onClick={action('click')}>{children}</a>,
          DownIcon: () => null,
          Loading: () => null,
          SchemaForm: () => null,
        }}
        externals={{}}
      >
        <BlockProvider config={config} events={events}>
          <Header />
        </BlockProvider>
      </BlocksProvider>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  title: 'test',
  logo: {
    src:
      'https://global-uploads.webflow.com/60a514cee679ef23b32cefc0/624702f7a07f6c0407632de8_Prisme.ai%20-%20Logo.svg',
    alt: 'Prisme.ai',
    action: {
      type: 'external',
      value: 'https://prisme.ai',
    },
  },
  nav: [
    {
      type: 'external',
      text: 'link 1',
      value: 'http://google.com',
    },
  ],
};
