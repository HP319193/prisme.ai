import { Events } from '@prisme.ai/sdk';
import { action } from '@storybook/addon-actions';
import { Story } from '@storybook/react';
import { useMemo } from 'react';
import { BlockProvider, BlocksProvider } from '../../Provider';
import ProductLayout from './ProductLayout';
import { ProductLayoutProps, SidebarHeaderProps } from './types';

export default {
  title: 'Blocks/ProductLayout',
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
        Link: (props: any) => <a {...props} />,
        Loading: () => null,
        DownIcon: () => null,
        SchemaForm: () => null,
      }}
      externals={{}}
      utils={{
        BlockLoader: ({ name, ...config }) => <div>Block {name}</div>,
      }}
    >
      <style>{`
      body {
        margin: 0;
        padding: 0 ! important;
        min-height: 100%;
      }
      #root {
        max-height: 100vh;
      }`}</style>
      <BlockProvider config={config} events={events}>
        <ProductLayout />
      </BlockProvider>
    </BlocksProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  sidebar: {
    header: {
      logo: 'https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/PC6RXcp/CvQpakEG2A0LHmpbHLw0H.logo.png',
      tooltip: 'Product',
      title: {
        en: 'Product',
        fr: 'Produit',
      },
      href: '/',
    },
    items: [
      {
        icon: 'home',
        text: 'Home',
        type: 'external',
        value: '/',
      },
      {
        icon: 'charts',
        text: 'Charts',
        type: 'external',
        value: '/charts',
        selected: true,
      },
      {
        icon: 'home',
        text: 'Home',
        type: 'external',
        value: '/',
      },
    ],
  },
};

export const DefaultWithBackButton = Template.bind({});
const args: ProductLayoutProps = {
  sidebar: {
    header: {
      logo: 'https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/PC6RXcp/CvQpakEG2A0LHmpbHLw0H.logo.png',
      tooltip: 'Product with a very very long name which should be truncated',
      title: 'Product with a very very long name which should be truncated',
      href: '/',
      back: '/',
      buttons: [
        {
          icon: 'gear',
          type: 'event',
          text: 'Settings',
          value: 'display settings',
        },
        {
          icon: 'share',
          type: 'event',
          text: 'Share',
          value: 'display sharing',
        },
      ],
    },
    items: [
      {
        icon: 'home',
        text: 'Home',
        type: 'external',
        value: '/',
      },
      {
        icon: 'charts',
        text: 'Charts',
        type: 'external',
        value: '/charts',
        selected: true,
      },
      {
        icon: 'home',
        text: 'Home',
        type: 'external',
        value: '/',
      },
      {
        icon: 'home',
        text: 'Home',
        type: 'external',
        value: '/',
      },
      {
        icon: 'charts',
        text: 'Charts',
        type: 'external',
        value: '/charts',
        selected: true,
      },
      {
        icon: 'home',
        text: 'Home',
        type: 'external',
        value: '/',
      },
      {
        icon: 'home',
        text: 'Home',
        type: 'external',
        value: '/',
      },
      {
        icon: 'charts',
        text: 'Charts',
        type: 'external',
        value: '/charts',
        selected: true,
      },
      {
        icon: 'home',
        text: 'Home',
        type: 'external',
        value: '/',
      },
      {
        icon: 'home',
        text: 'Home',
        type: 'external',
        value: '/',
      },
      {
        icon: 'charts',
        text: 'Charts',
        type: 'external',
        value: '/charts',
        selected: true,
      },
      {
        icon: 'home',
        text: 'Home',
        type: 'external',
        value: '/',
      },
    ],
    opened: true,
  },
};
DefaultWithBackButton.args = args;

export const WithReactRenderProps = Template.bind({});
const Logo = () => {
  return (
    <img
      src="https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/PC6RXcp/CvQpakEG2A0LHmpbHLw0H.logo.png"
      className="product-layout-sidebar__logo"
    />
  );
};
const Items = () => {
  return <div>Items comes here</div>;
};
WithReactRenderProps.args = {
  sidebar: {
    header: {
      logo: <Logo />,
      tooltip: 'Product',
      title: 'Product',
      href: '/',
    },
    items: <Items />,
  },
};

export const WithReactRenderPropsInSidebarHeader = Template.bind({});
const SidebarHeader = () => {
  return (
    <div className="product-layout-sidebar__header">
      <a href="/" className="product-layout-sidebar__header-link">
        <div className="product-layout-sidebar__logo">
          <img src="https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/PC6RXcp/CvQpakEG2A0LHmpbHLw0H.logo.png" />
        </div>
        <div className="product-layout-sidebar__title">Product</div>
      </a>
    </div>
  );
};
WithReactRenderPropsInSidebarHeader.args = {
  sidebar: {
    header: <SidebarHeader />,
    items: <Items />,
  },
};

export const WithBlocks = Template.bind({});
WithBlocks.args = {
  sidebar: {
    header: {
      logo: [
        {
          slug: 'Image',
          src: 'https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/wW3UZla/aEVZPvx3_Z1PbHefKQZTI.prismeai-2022.png',
        },
      ],
      tooltip: 'Product',
      title: [
        {
          slug: 'RichText',
          src: 'Product',
        },
      ],
      href: '/',
    },
    items: [
      {
        slug: 'RichText',
        content: 'Items comes here',
      },
    ],
  },
};
