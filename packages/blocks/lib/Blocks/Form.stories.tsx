import { Events } from '@prisme.ai/sdk';
import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { useState } from 'react';
import { BlockProvider } from '../Provider';
import Form from './Form';

export default {
  title: 'Blocks/Form',
};

const Template: Story<any> = ({ defaultConfig }) => {
  const [config, setConfig] = useState<any>(defaultConfig);
  const [appConfig, setAppConfig] = useState<any>();
  const events = {
    emit: action('emit'),
  } as Events;

  return (
    <BlockProvider
      config={config}
      onConfigUpdate={setConfig}
      appConfig={appConfig}
      onAppConfigUpdate={setAppConfig}
      events={events}
    >
      <Form />
    </BlockProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  defaultConfig: {
    title: 'Some form',
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
        },
      },
    },
    onChange: 'valueChanged',
  },
};
