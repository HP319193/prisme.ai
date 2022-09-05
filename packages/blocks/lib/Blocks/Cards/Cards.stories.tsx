import { Story } from '@storybook/react';
import { useState } from 'react';
import { BlockProvider } from '../../Provider';
import Cards from './Cards';

export default {
  title: 'Blocks/Cards',
};

const Template: Story<any> = () => {
  const [config, setConfig] = useState<any>({
    type: 'classic',
    cards: [
      {
        title: 'Les Anis de Flavigny',
        description: 'Confiseur(s)',
        cover:
          'https://i.postimg.cc/Hx1yXdjj/Capture-d-e-cran-2021-04-29-a-16-03-1.png',
        content: [
          {
            type: 'button',
            url: 'test',
            value: 'test',
          },
          {
            type: 'accordion',
            title: 'Contact',
            content: '',
          },
          {
            type: 'accordion',
            title: 'Produits',
            content: '',
          },
        ],
      },
      {},
      {},
      {},
      {},
      {},
      {},
    ],
  });
  const [config2, setConfig2] = useState<any>({
    type: 'square',
    cards: [
      {
        title: 'Les Anis de Flavigny',
        description: 'Confiseur(s)',
        cover:
          'https://i.postimg.cc/Hx1yXdjj/Capture-d-e-cran-2021-04-29-a-16-03-1.png',
        content: [
          {
            type: 'button',
            url: 'test',
            value: 'test',
          },
          {
            type: 'accordion',
            title: 'Contact',
            content: '',
          },
          {
            type: 'accordion',
            title: 'Produits',
            content: '',
          },
        ],
      },
      {},
      {},
      {},
      {},
    ],
  });
  const [config3, setConfig3] = useState<any>({
    type: 'withButtons',
    cards: [
      {
        title: 'Les Anis de Flavigny',
        description: 'Confiseur(s)',
        cover:
          'https://i.postimg.cc/Hx1yXdjj/Capture-d-e-cran-2021-04-29-a-16-03-1.png',
        content: [
          {
            type: 'button',
            url: 'test',
            value: 'test',
          },
          {
            type: 'accordion',
            title: 'Contact',
            content: '',
          },
          {
            type: 'accordion',
            title: 'Produits',
            content: '',
          },
        ],
      },
      {},
      {},
      {},
      {},
    ],
  });
  const [appConfig, setAppConfig] = useState<any>();

  return (
    <>
      <BlockProvider
        config={config}
        onConfigUpdate={setConfig}
        appConfig={appConfig}
        onAppConfigUpdate={setAppConfig}
      >
        <Cards edit={false} />
      </BlockProvider>
      <BlockProvider
        config={config2}
        onConfigUpdate={setConfig2}
        appConfig={appConfig}
        onAppConfigUpdate={setAppConfig}
      >
        <Cards edit={false} />
      </BlockProvider>
      <BlockProvider
        config={config3}
        onConfigUpdate={setConfig3}
        appConfig={appConfig}
        onAppConfigUpdate={setAppConfig}
      >
        <Cards edit={false} />
      </BlockProvider>
    </>
  );
};

export const Default = Template.bind({});
