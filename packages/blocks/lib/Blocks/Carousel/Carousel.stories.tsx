import { Story } from '@storybook/react';
import { BlockProvider, BlocksProvider } from '../../Provider';
import Carousel from './Carousel';
import { BlockLoader } from '../../BlockLoader';

export default {
  title: 'Blocks/Carousel',
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
        <Carousel />
      </BlockProvider>
    </BlocksProvider>
  );
};

export const Default = Template.bind({});
const demoBlock = (k: string) => ({
  slug: 'RichText',
  content: `<p>Hello <strong>World ${k}</strong></p>`,
  css: `:block {
    width: 300px;
  }
  `,
});
Default.args = {
  blocks: Array.from(new Array(100), (v, k) => demoBlock(`${k}`)),
  autoscroll: {
    active: true,
    speed: undefined,
  },
  displayIndicators: false,
};

export const WithIndicators = Template.bind({});
WithIndicators.args = {
  blocks: Array.from(new Array(6), (v, k) => demoBlock(`${k}`)),
  autoscroll: {
    active: false,
  },
  displayIndicators: true,
};
