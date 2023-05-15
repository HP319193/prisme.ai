import { Story } from '@storybook/react';
import { BlockProvider, BlocksProvider } from '../../Provider';
import TabsView from './TabsView';
import { BlockLoader } from '../../BlockLoader';
import { useMemo } from 'react';
import { action } from '@storybook/addon-actions';
import { Events } from '@prisme.ai/sdk';

export default {
  title: 'Blocks/TabsView',
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
        BlockLoader,
      }}
    >
      <BlockProvider config={config} events={events}>
        <style>
          {`:root {
  --light-gray-color: #e5e5e5;
  --accent-color: #015dff;
  --accent-contrast-color: white;
  --error-color: #ff4d4f;
}`}
        </style>
        <TabsView />
      </BlockProvider>
    </BlocksProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  tabs: [
    {
      text: 'Documentation',
      content: {
        blocks: [
          {
            slug: 'RichText',
            content: 'This is the documentation',
          },
        ],
      },
    },
    {
      text: 'Changelog',
      content: {
        blocks: [
          {
            slug: 'RichText',
            content: 'This is the changelog',
          },
        ],
      },
    },
    {
      text: 'API',
      content: {
        blocks: [
          {
            slug: 'RichText',
            content: 'This is the API',
          },
        ],
      },
    },
  ],
};

export const WithAction = Template.bind({});
WithAction.args = {
  tabs: [
    {
      text: 'Documentation',
      content: {
        blocks: [
          {
            slug: 'RichText',
            content: 'This is the documentation',
          },
        ],
      },
      type: 'event',
      value: 'click on documentation',
    },
    {
      text: 'Changelog',
      content: {
        blocks: [
          {
            slug: 'RichText',
            content: 'This is the changelog',
          },
        ],
      },
      type: 'event',
      value: 'click on changelog',
    },
    {
      text: 'API',
      content: {
        blocks: [
          {
            slug: 'RichText',
            content: 'This is the API',
          },
        ],
      },
      type: 'event',
      value: 'click on api',
    },
  ],
};

export const WithBlocksList = Template.bind({});
WithBlocksList.args = {
  tabs: [
    {
      text: 'Chat',
      content: {
        blocks: [
          {
            slug: 'RichText',
            content: 'This is the chat',
          },
        ],
      }
    },
    {
      text: {
        blocks: [{
          slug: "RichText",
          content: "Notifications"
        }, {
          slug: "RichText",
          content: ' (3)',
          css: ``
        }],
        css: `:block {
          display: flex;
          flex-direction: row;
          align-items: center;
        }`
      },
      content: {
        blocks: [
          {
            slug: 'RichText',
            content: 'This is the notifications',
          },
        ],
      }
    },
  ],
};

export const Vertical = Template.bind({});
Vertical.args = {
  direction: 'vertical',
  tabs: [
    {
      text: '<img src="https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/toda3iP/JoNFhsa1g9KMl-q45q4vr.Vector.png" />',
      content: {
        blocks: [
          {
            slug: 'RichText',
            content: 'This is the documentation',
          },
        ],
      },
      type: 'event',
      value: 'click on documentation',
    },
    {
      text: '<img src="https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/toda3iP/wCXCpqFvVC1nLQ0lsk_05.Vector(1).png" />',
      content: {
        blocks: [
          {
            slug: 'RichText',
            content: 'This is the changelog',
          },
        ],
      },
      type: 'event',
      value: 'click on changelog',
    },
    {
      text: '<img src="https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/toda3iP/sS1ciqJ8eYWuVkAaLhJc_.Vector(2).png" />',
      content: {
        blocks: [
          {
            slug: 'RichText',
            content: 'This is the API',
          },
        ],
      },
      type: 'event',
      value: 'click on api',
    },
  ],
};
