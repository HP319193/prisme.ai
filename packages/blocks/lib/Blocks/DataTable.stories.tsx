import { Story } from '@storybook/react';
import { useState } from 'react';
import { BlockProvider } from '../Provider';
import { DataTable } from './index';

export default {
  title: 'Blocks/DataTable',
};

const Template: Story<any> = ({ defaultConfig }) => {
  const [config, setConfig] = useState<any>(defaultConfig);
  const [appConfig, setAppConfig] = useState<any>();

  return (
    <BlockProvider
      config={config}
      onConfigUpdate={setConfig}
      appConfig={appConfig}
      onAppConfigUpdate={setAppConfig}
    >
      <DataTable edit={false} />
    </BlockProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  defaultConfig: {
    data: [],
  },
};

export const Simple = Template.bind({});
Simple.args = {
  defaultConfig: {
    data: [
      {
        _id: '62b1cc7ee806595bf47ed230',
        title: 'Expérimentation de l’extinction de l’éclairage public',
        description:
          "Une expérimentation est actuellement en cours dans les secteurs Bousquet Panoramique et Hameau de Firmis où l'éclairage public est éteint pendant la nuit. ",
        question:
          "Quelle note donneriez-vous au principe d'extinction la nuit ?",
        updatedAt: '2022-06-21T13:49:50.686Z',
        createdAt: '2022-06-21T13:49:50.686Z',
      },
      {
        _id: '62bf07425609f172d1ac12a2',
        title: 'Que pensez-vous des nouveaux lampadaires ?',
        description:
          "Une expérimentation est actuellement en cours dans les secteurs Bousquet Panoramique et Hameau de Firmis où l'éclairage public est éteint pendant la nuit. ",
        question:
          "Quelle note donneriez-vous au principe d'extinction la nuit ?",
        updatedAt: '2022-07-01T14:40:02.682Z',
        createdAt: '2022-07-01T14:40:02.682Z',
      },
    ],
  },
};

export const WihObjects = Template.bind({});
WihObjects.args = {
  defaultConfig: {
    data: [
      {
        _id: '62b1cc7ee806595bf47ed230',
        title: 'Expérimentation de l’extinction de l’éclairage public',
        description:
          "Une expérimentation est actuellement en cours dans les secteurs Bousquet Panoramique et Hameau de Firmis où l'éclairage public est éteint pendant la nuit. ",
        question:
          "Quelle note donneriez-vous au principe d'extinction la nuit ?",
        choices: [
          {
            text: '1',
            value: '1',
          },
          {
            text: '2',
            value: '2',
          },
          {
            text: '3',
            value: '3',
          },
          {
            text: '4',
            value: '4',
          },
          {
            text: '5',
            value: '5',
          },
        ],
        updatedAt: '2022-06-21T13:49:50.686Z',
        createdAt: '2022-06-21T13:49:50.686Z',
      },
      {
        _id: '62bf07425609f172d1ac12a2',
        title: 'Que pensez-vous des nouveaux lampadaires ?',
        description:
          "Une expérimentation est actuellement en cours dans les secteurs Bousquet Panoramique et Hameau de Firmis où l'éclairage public est éteint pendant la nuit. ",
        question:
          "Quelle note donneriez-vous au principe d'extinction la nuit ?",
        choices: [
          {
            text: '1',
            value: '1',
          },
          {
            text: '2',
            value: '2',
          },
          {
            text: '3',
            value: '3',
          },
          {
            text: '4',
            value: '4',
          },
          {
            text: '5',
            value: '5',
          },
        ],
        updatedAt: '2022-07-01T14:40:02.682Z',
        createdAt: '2022-07-01T14:40:02.682Z',
      },
    ],
  },
};
