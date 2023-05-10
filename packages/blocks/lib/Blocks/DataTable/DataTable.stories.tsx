import { Events } from '@prisme.ai/sdk';
import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { useEffect, useState } from 'react';
import { BlockProvider } from '../../Provider';
import { DataTableConfig } from '.';
import { DataTable } from '../index';

export default {
  title: 'Blocks/DataTable',
};

const events = {
  emit(event: string, payload?: any) {
    action(event)(payload);
  },
};
const Template: Story<any> = ({ defaultConfig }) => {
  const [config, setConfig] = useState<any>(defaultConfig);
  const [appConfig, setAppConfig] = useState<any>();

  useEffect(() => {
    setConfig(defaultConfig);
  }, [defaultConfig]);

  return (
    <BlockProvider
      config={config}
      onConfigUpdate={setConfig}
      appConfig={appConfig}
      onAppConfigUpdate={setAppConfig}
      events={events as Events}
    >
      <DataTable />
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

export const WithObjects = Template.bind({});
WithObjects.args = {
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

export const WithMetaData = Template.bind({});
WithMetaData.args = {
  defaultConfig: {
    data: [
      {
        _id: '62b1cc7ee806595bf47ed230',
        title: 'Foo',
        count: 42,
        startAt: '2022-01-01',
        colors: ['red', 'orange'],
        checked: true,
      },
      {
        _id: '62bf07425609f172d1ac12a2',
        title: 'Bar',
        count: 123,
        startAt: '2022-05-06',
        colors: ['green', 'pink', 'purple'],
        checked: false,
      },
    ],
    columns: [
      {
        label: 'Title',
        key: 'title',
        onEdit: 'editTitle',
        validators: {
          required: 'the title is required',
        },
      },
      {
        label: 'Count',
        key: 'count',
        type: 'number',
        onEdit: 'editCount',
        validators: {
          required: true,
        },
      },
      {
        label: 'Checked ?',
        key: 'checked',
        type: 'boolean',
        onEdit: 'editChecked',
      },
      {
        label: 'Colors',
        key: 'colors',
        type: 'tags',
        onEdit: 'cannotEdit',
      },
      {
        label: 'Start at',
        key: 'startAt',
        type: 'date',
        format: {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        },
        onEdit: 'editDate',
      },
      {
        label: 'Actions',
        actions: [
          {
            label: 'Delete',
            event: 'delete',
          },
          {
            label: 'Update',
            event: 'delete',
            payload: {
              id: '${_id}',
            },
          },
          {
            label: 'View',
            url: 'http://prisme.ai/item/${_id}',
          },
        ],
        onEdit: 'cannotEdit',
      },
    ],
  } as DataTableConfig,
};

export const WithEventBasedPagination = Template.bind({});
WithEventBasedPagination.args = {
  defaultConfig: {
    data: [
      {
        _id: '62b1cc7ee806595bf47ed230',
        title: 'Foo',
        count: 42,
        startAt: '2022-01-01',
        colors: ['red', 'orange'],
        checked: true,
      },
      {
        _id: '62bf07425609f172d1ac12a2',
        title: 'Bar',
        count: 123,
        startAt: '2022-05-06',
        colors: ['green', 'pink', 'purple'],
        checked: false,
      },
      {
        _id: '62b1cc7ee806595bf47ed230',
        title: 'Foo',
        count: 42,
        startAt: '2022-01-01',
        colors: ['red', 'orange'],
        checked: true,
      },
      {
        _id: '62bf07425609f172d1ac12a2',
        title: 'Bar',
        count: 123,
        startAt: '2022-05-06',
        colors: ['green', 'pink', 'purple'],
        checked: false,
      },
      {
        _id: '62b1cc7ee806595bf47ed237',
        title: 'Foo',
        count: 42,
        startAt: '2022-01-01',
        colors: ['red', 'orange'],
        checked: true,
      },
      {
        _id: '62bf07425609f172d1ac12a2',
        title: 'Bar',
        count: 123,
        startAt: '2022-05-06',
        colors: ['green', 'pink', 'purple'],
        checked: false,
      },
      {
        _id: '62b1cc7ee806595bf47ed230',
        title: 'Foo',
        count: 42,
        startAt: '2022-01-01',
        colors: ['red', 'orange'],
        checked: true,
      },
      {
        _id: '62bf07425609f172d1ac12a2',
        title: 'Bar',
        count: 123,
        startAt: '2022-05-06',
        colors: ['green', 'pink', 'purple'],
        checked: false,
      },
      {
        _id: '62b1cc7ee806595bf47ed230',
        title: 'Foo',
        count: 42,
        startAt: '2022-01-01',
        colors: ['red', 'orange'],
        checked: true,
      },
      {
        _id: '62bf07425609f172d1ac12a2',
        title: 'Bar',
        count: 123,
        startAt: '2022-05-06',
        colors: ['green', 'pink', 'purple'],
        checked: false,
      },
      {
        _id: '62b1cc7ee806595bf47ed230',
        title: 'Foo',
        count: 42,
        startAt: '2022-01-01',
        colors: ['red', 'orange'],
        checked: true,
      },
      {
        _id: '62bf07425609f172d1ac12a2',
        title: 'Bar',
        count: 123,
        startAt: '2022-05-06',
        colors: ['green', 'pink', 'purple'],
        checked: false,
      },
      {
        _id: '62b1cc7ee806595bf47ed230',
        title: 'Foo',
        count: 42,
        startAt: '2022-01-01',
        colors: ['red', 'orange'],
        checked: true,
      },
      {
        _id: '62bf07425609f172d1ac12a2',
        title: 'Bar',
        count: 123,
        startAt: '2022-05-06',
        colors: ['green', 'pink', 'purple'],
        checked: false,
      },
    ],
    pagination: {
      event: 'paginate',
      page: 3,
      itemCount: 50,
      pageSize: 2,
    },
  } as DataTableConfig,
};
