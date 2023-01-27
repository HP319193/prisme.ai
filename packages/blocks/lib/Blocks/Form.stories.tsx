import { Events } from '@prisme.ai/sdk';
import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BlockProvider } from '../Provider';
import Form from './Form';

export default {
  title: 'Blocks/Form',
};

const Template: Story<any> = (config) => {
  const [localConfig, setLocalConfig] = useState<any>(config);
  const onSubmit = useRef(config.onSubmit);
  const events = useMemo(
    () =>
      ({
        emit: (type: string, payload: any) => {
          if (type === onSubmit.current) {
            console.log('wesh');
            setLocalConfig({ disabledSubmit: true });
            setTimeout(() => {
              setLocalConfig({ disabledSubmit: false });
            }, 500);
          }

          action('emit')(type, payload);
        },
      } as Events),
    []
  );

  return (
    <BlockProvider config={{ ...config, ...localConfig }} events={events}>
      <Form />
    </BlockProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
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
};
