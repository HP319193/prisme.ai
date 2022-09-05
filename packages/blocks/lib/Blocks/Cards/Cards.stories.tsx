import { Story } from '@storybook/react';
import { useState } from 'react';
import { BlockProvider } from '../../Provider';
import Cards from './Cards';

export default {
  title: 'Blocks/Cards',
};

const Template: Story<any> = () => {
  const [config, setConfig] = useState<any>({
    variant: 'short',
    cards: [
      {
        title: 'Gares de Labège : attention au travaux !',
        subtitle: 'Publié le 13 juillet 2022',
        tag: 'Mobilités',
        description:
          'Pour accueillir des rames TER nouvelle génération et offrir des avantages de confort aux voyageurs, SNCF Réseau réalise des travaux d’allongement de quais dans les gares de Labège-Innopole et Labège-Village.',
        backgroundColor: 'black',
      },
      {
        title:
          'Gares de Labège : attention au travaux !  ainsi que ce texte long très long mais bon cest pas grave',
        subtitle:
          'Publié le 13 juillet 2022 ainsi que ce texte long très long mais bon cest pas grave',
        tag: 'Mobilités  ainsi que ce texte long très long mais bon cest pas grave',
        description:
          'Pour accueillir des rames TER nouvelle génération et offrir des avantages de confort aux voyageurs, SNCF Réseau réalise des travaux d’allongement de quais dans les gares de Labège-Innopole et Labège-Village.',
        backgroundColor: 'white',
      },
      {
        title:
          'Gares de Labège : attention au travaux !  ainsi que ce texte long très long mais bon cest pas grave',
        subtitle:
          'Publié le 13 juillet 2022 ainsi que ce texte long très long mais bon cest pas grave',
        tag: 'Mobilités  ainsi que ce texte long très long mais bon cest pas grave',
        description:
          'Pour accueillir des rames TER nouvelle génération et offrir des avantages de confort aux voyageurs, SNCF Réseau réalise des travaux d’allongement de quais dans les gares de Labège-Innopole et Labège-Village.',
        backgroundColor: 'transparent-black',
      },
      {
        title:
          'Gares de Labège : attention au travaux !  ainsi que ce texte long très long mais bon cest pas grave',
        subtitle:
          'Publié le 13 juillet 2022 ainsi que ce texte long très long mais bon cest pas grave',
        tag: 'Mobilités  ainsi que ce texte long très long mais bon cest pas grave',
        description:
          'Pour accueillir des rames TER nouvelle génération et offrir des avantages de confort aux voyageurs, SNCF Réseau réalise des travaux d’allongement de quais dans les gares de Labège-Innopole et Labège-Village.',
        backgroundColor: 'transparent-white',
      },
      {},
      {},
      {},
      {},
      {},
      {},
    ],
  });
  const [config4, setConfig4] = useState<any>({
    variant: 'article',
    cards: [
      {
        title: 'Gares de Labège : attention au travaux !',
        subtitle: 'Publié le 13 juillet 2022',
        tag: 'Mobilités',
        description:
          'Pour accueillir des rames TER nouvelle génération et offrir des avantages de confort aux voyageurs, SNCF Réseau réalise des travaux d’allongement de quais dans les gares de Labège-Innopole et Labège-Village.',
        cover:
          'https://i.postimg.cc/Hx1yXdjj/Capture-d-e-cran-2021-04-29-a-16-03-1.png',
      },
      {
        title:
          'Gares de Labège : attention au travaux !  ainsi que ce texte long très long mais bon cest pas grave',
        subtitle:
          'Publié le 13 juillet 2022 ainsi que ce texte long très long mais bon cest pas grave',
        tag: 'Mobilités  ainsi que ce texte long très long mais bon cest pas grave',
        description:
          'Pour accueillir des rames TER nouvelle génération et offrir des avantages de confort aux voyageurs, SNCF Réseau réalise des travaux d’allongement de quais dans les gares de Labège-Innopole et Labège-Village.',
        cover:
          'https://i.postimg.cc/Hx1yXdjj/Capture-d-e-cran-2021-04-29-a-16-03-1.png',
      },
      {},
      {},
      {},
      {},
      {},
    ],
  });
  const [config2, setConfig2] = useState<any>({
    variant: 'square',
    cards: [
      {
        title: 'Les Anis de Flavigny',
        description: 'Confiseur(s)',
        cover:
          'https://i.postimg.cc/Hx1yXdjj/Capture-d-e-cran-2021-04-29-a-16-03-1.png',
      },
      {
        title:
          'Les Anis de Flavigny avec un texte plus long car cest cool des fois',
        description:
          'Confiseur(s) avec un texte plus long car cest cool des fois avec un texte plus long car cest cool des fois',
        cover:
          'https://i.postimg.cc/Hx1yXdjj/Capture-d-e-cran-2021-04-29-a-16-03-1.png',
      },
      {},
      {},
      {},
      {},
    ],
  });
  const [config3, setConfig3] = useState<any>({
    variant: 'actions',
    cards: [
      {
        title: 'Les Anis de Flavigny but this is sooo long why do I write this',
        description: 'Confiseur(s) but this is sooo long why do I write this',
        cover:
          'https://i.postimg.cc/Hx1yXdjj/Capture-d-e-cran-2021-04-29-a-16-03-1.png',
        content: [
          {
            type: 'event',
            text: 'test but this is sooo long why do I write this but this is sooo long why do I write this',
            value: 'triggerEvent',
          },
          {
            type: 'link',
            text: 'Contact but this is sooo long why do I write this but this is sooo long why do I write this',
            value: 'http://google.com',
          },
        ],
      },
      {
        title: 'Les Anis de Flavigny but this is sooo long why do I write this',
        description: 'Confiseur(s) but this is sooo long why do I write this',
        cover:
          'https://i.postimg.cc/Hx1yXdjj/Capture-d-e-cran-2021-04-29-a-16-03-1.png',
        content: [
          {
            type: 'event',
            text: 'test but this is sooo long why do I write this but this is sooo long why do I write this',
            value: 'triggerEvent',
          },
          {
            type: 'link',
            text: 'Contact but this is sooo long why do I write this but this is sooo long why do I write this',
            value: 'http://google.com',
          },
          {
            type: 'link',
            text: 'Contact but this is sooo long why do I write this but this is sooo long why do I write this',
            value: 'http://google.com',
          },
        ],
      },
      {
        title: 'Les Anis de Flavigny but this is sooo long why do I write this',
        description: 'Confiseur(s) but this is sooo long why do I write this',
        cover:
          'https://i.postimg.cc/Hx1yXdjj/Capture-d-e-cran-2021-04-29-a-16-03-1.png',
        content: [
          {
            type: 'event',
            text: 'test but this is sooo long why do I write this but this is sooo long why do I write this',
            value: 'triggerEvent',
          },
          {
            type: 'link',
            text: 'Contact but this is sooo long why do I write this but this is sooo long why do I write this',
            value: 'http://google.com',
          },
          {
            type: 'link',
            text: 'Contact but this is sooo long why do I write this but this is sooo long why do I write this',
            value: 'http://google.com',
          },
          {
            type: 'link',
            text: 'Contact but this is sooo long why do I write this but this is sooo long why do I write this',
            value: 'http://google.com',
          },
          {
            type: 'link',
            text: 'Contact but this is sooo long why do I write this but this is sooo long why do I write this',
            value: 'http://google.com',
          },
        ],
      },
      {
        title: 'Les Anis de Flavigny but this is sooo long why do I write this',
        description: 'Confiseur(s) but this is sooo long why do I write this',
        cover:
          'https://i.postimg.cc/Hx1yXdjj/Capture-d-e-cran-2021-04-29-a-16-03-1.png',
        content: [
          {
            type: 'link',
            text: 'Contact but this is sooo long why do I write this but this is sooo long why do I write this',
            value: 'http://google.com',
          },
        ],
      },
      {
        title: 'Les Anis de Flavigny but this is sooo long why do I write this',
        description: 'Confiseur(s) but this is sooo long why do I write this',
        cover:
          'https://i.postimg.cc/Hx1yXdjj/Capture-d-e-cran-2021-04-29-a-16-03-1.png',
        content: [],
      },
      {},
      {},
      {},
    ],
  });
  const [config5, setConfig5] = useState<any>({
    variant: 'classic',
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
        config={config4}
        onConfigUpdate={setConfig4}
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
      <BlockProvider
        config={config5}
        onConfigUpdate={setConfig5}
        appConfig={appConfig}
        onAppConfigUpdate={setAppConfig}
      >
        <Cards edit={false} />
      </BlockProvider>
    </>
  );
};

export const Default = Template.bind({});
