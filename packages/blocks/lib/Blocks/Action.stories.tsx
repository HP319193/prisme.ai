import { Events } from '@prisme.ai/sdk';
import { action } from '@storybook/addon-actions';
import { Story } from '@storybook/react';
import { useMemo } from 'react';
import { BlockProvider, BlocksProvider } from '../Provider';
import Action from './Action';

export default {
  title: 'Blocks/Action',
  argTypes: {
    type: {
      options: ['external', 'internal', 'inside', 'event'],
      control: { type: 'select' },
    },
  },
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
    <BlocksProvider
      components={{
        Link: (props) => <a {...props} />,
        Loading: () => null,
        DownIcon: () => null,
        SchemaForm: () => null,
      }}
      externals={{}}
    >
      <BlockProvider config={config} events={events}>
        <Action />
      </BlockProvider>
    </BlocksProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  type: 'external',
  value: 'https://prisme.ai',
  text: 'Link',
};
