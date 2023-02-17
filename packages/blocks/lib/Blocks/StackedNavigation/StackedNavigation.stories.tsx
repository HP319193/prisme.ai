import { Story } from '@storybook/react';
import { useMemo, useState } from 'react';
import { BlockProvider, BlocksProvider } from '../../Provider';
import { StackedNavigationConfig } from './context';
import Layout from './StackedNavigation';
import { BlockLoader } from '../../BlockLoader';

export default {
  title: 'Blocks/Layout',
};

const Template: Story<any> = () => {
  const [config, setConfig] = useState<StackedNavigationConfig>({
    head: [
      {
        slug: 'Header',
        title: 'Exemple of Layout',
        nav: [
          {
            type: 'event',
            text: 'Do something',
            value: 'do something',
          },
        ],
      },
    ],
    content: {
      title: 'summary',
      blocks: [
        {
          slug: 'Cards',
          cards: [
            {
              title: 'Démarrer une conversation',
              content: [
                {
                  type: 'button',
                  value: 'Envoyer un message',
                  event: 'navigate conversation',
                },
              ],
            },
            {
              title: 'Alimentation',
              description: 'Rapprochez vous de vos producteurs locaux',
              content: [
                {
                  type: 'button',
                  value: 'Marchés',
                  event: 'navigate marchés',
                },
                {
                  type: 'button',
                  value: 'Producteusrs locaux',
                  event: 'navigate producteurs locaux',
                },
                {
                  type: 'button',
                  value: 'Menus des cantines',
                  event: 'navigate menus cantines',
                },
              ],
            },
          ],
        },
      ],
    },
  });
  const [appConfig, setAppConfig] = useState<any>();

  const events = useMemo<any>(
    () => ({
      emit: (event: string) => {
        switch (event) {
          case 'navigate conversation':
            return setConfig((config) => ({
              ...config,
              content: {
                title: 'Conversation',
                blocks: [
                  {
                    slug: 'RichText',
                    content: 'Je suis un chat miaou',
                  },
                ],
              },
            }));
          case 'navigate marchés step 2':
          case 'navigate marchés':
            const cards = [
              {
                title: 'pouet',
                content: [
                  {
                    type: 'button',
                    value: 'Met à jour cette vue',
                    event: 'navigate marchés step 2',
                  },
                ],
              },
            ];
            if (event === 'navigate marchés step 2') {
              cards.push({
                title: 'Une nouvelle carte',
                content: [
                  {
                    type: 'button',
                    value: 'Retourner chez les producteurs',
                    event: 'navigate producteurs locaux',
                  },
                ],
              });
            }
            return setConfig((config) => ({
              ...config,
              content: {
                title: 'Marchés',
                blocks: [
                  {
                    slug: 'RichText',
                    content: 'Voici les marchés',
                  },
                  {
                    slug: 'Cards',
                    cards,
                  },
                ],
              },
            }));
          case 'navigate producteurs locaux':
            return setConfig((config) => ({
              ...config,
              content: {
                title: 'Producteurs locaux',
                blocks: [
                  {
                    slug: 'RichText',
                    content: 'Voici les producteurs',
                  },
                ],
              },
            }));
          case 'navigate menus cantines':
            return setConfig((config) => ({
              ...config,
              content: {
                title: 'Menus cantine',
                blocks: [
                  {
                    slug: 'RichText',
                    content: 'Voici les menus',
                  },
                  {
                    slug: 'Cards',
                    cards: [
                      {
                        title: 'Démarrer une conversation',
                        content: [
                          {
                            type: 'button',
                            value: 'Envoyer un message',
                            event: 'navigate conversation',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    slug: 'Cards',
                    cards: [
                      {
                        title: 'Démarrer une conversation',
                        content: [
                          {
                            type: 'button',
                            value: 'Envoyer un message',
                            event: 'navigate conversation',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    slug: 'Cards',
                    cards: [
                      {
                        title: 'Démarrer une conversation',
                        content: [
                          {
                            type: 'button',
                            value: 'Envoyer un message',
                            event: 'navigate conversation',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            }));
        }
      },
    }),
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
      <style>{`body {padding: 0 ! important;}`}</style>
      <BlockProvider
        config={config}
        onConfigUpdate={setConfig}
        appConfig={appConfig}
        onAppConfigUpdate={setAppConfig}
        events={events}
      >
        <Layout />
      </BlockProvider>
    </BlocksProvider>
  );
};

export const Default = Template.bind({});
