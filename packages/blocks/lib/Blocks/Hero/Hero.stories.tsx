import { Story } from '@storybook/react';
import { useEffect, useState } from 'react';
import { BlockProvider, BlocksProvider } from '../../Provider';
import Hero from './Hero';

export default {
  title: 'Blocks/Hero',
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
    >
      <Hero />
    </BlockProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  defaultConfig: {
    title: 'Hero title',
    lead: 'A very short introduction/summary of the page.',
    img: 'https://design-system.w3.org/dist/assets/svg/illustration-2.svg',
    backgroundColor: '#f8f8fb',
    content: [
      {
        slug: 'RichText',
        content: '<p>Hello <strong>World</strong></p>',
      },
    ],
  },
};
