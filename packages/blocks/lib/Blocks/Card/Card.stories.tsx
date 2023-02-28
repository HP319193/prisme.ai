import { Story } from '@storybook/react';
import { BlockProvider, BlocksProvider } from '../../Provider';
import Card from './Card';
import { BlockLoader } from '../../BlockLoader';

export default {
  title: 'Blocks/Card',
};

const Template: Story<any> = (config) => {
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
      <BlockProvider config={config}>
        <Card />
      </BlockProvider>
    </BlocksProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  title: 'Les Anis de Flavigny',
  description: 'Confiseur(s)',
  cover:
    'https://i.postimg.cc/Hx1yXdjj/Capture-d-e-cran-2021-04-29-a-16-03-1.png',
  actions: [
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
  template: `<div>{{title}}</div>`,
  css: `
  ${Card.styles}
  :block {
    width: 15rem;
    min-height: 23rem;
    margin: 1.5rem 0;
    padding-left: 1.3rem;
  }
  .pr-block-card__container {
    border-radius: 1rem;
  }
  .pr-block-card__cover {
    order: 0;
    border-radius: 1rem;
    overflow: hidden;
    position: absolute;
    z-index: -1;
  }
  .pr-block-card__title {
    order: 1;
    margin-top: 103px;
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
    background: white;
  }
  .pr-block-card__subtitle {
    order: 1;
    background: white;
  }
  .pr-block-card__description {
    order: 1;
    background: white;
  }
  .pr-block-card__tag {
    order: 1;
  }
  .pr-block-card__content {
    order: 1;
    background: white;
  }
  .pr-block-card__actions {
    order: 1;
    background: white;
  }
  `,
};
