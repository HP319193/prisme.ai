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
      utils={{
        BlockLoader: ({ name, ...config }) => <div>Block {name}</div>,
      }}
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
  disabled: false,
};

export const ContentAsBlocks = Template.bind({});
ContentAsBlocks.args = {
  text: [
    {
      slug: 'RichText',
      content: 'Rich Text Block',
    },
    {
      slug: 'RichText',
      content: 'Another',
    },
  ],
  type: 'event',
  value: 'delete',
  payload: {
    id: '1234',
  },
};

export const ConfirmAction = Template.bind({});
ConfirmAction.args = {
  text: 'Delete this',
  type: 'event',
  value: 'delete',
  payload: {
    id: '1234',
  },
  confirm: {
    label: 'Are you sure?',
    yesLabel: 'Yes I am',
    noLabel: 'No, pleese no !',
  },
};
