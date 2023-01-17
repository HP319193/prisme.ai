import { Events } from '@prisme.ai/sdk';
import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { useEffect, useState } from 'react';
import { BlockProvider } from '../Provider';
import Form from './Form';

export default {
  title: 'Blocks/Form',
};

const Template: Story<any> = ({ defaultConfig }) => {
  const [config, setConfig] = useState<any>(defaultConfig);
  const [appConfig, setAppConfig] = useState<any>();
  const events = {
    emit: (type: string) => {
      if (type === config.onSubmit) {
        setConfig((prev: any) => ({ ...prev, disabledSubmit: true }));
        setTimeout(() => {
          setConfig((prev: any) => ({ ...prev, disabledSubmit: false }));
        }, 500);
      }

      action('emit')();
    },
  } as Events;

  useEffect(() => {
    setConfig(defaultConfig);
  }, [defaultConfig]);

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
    onSubmit: 'submited',
  },
};
