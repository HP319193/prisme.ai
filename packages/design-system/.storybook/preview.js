import '../styles/prismeai-theme.less';
import '../styles/tailwind.css';

import { addDecorator } from '@storybook/react';
import { withPropsTable } from 'storybook-addon-react-docgen';
import './style.css';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  previewTabs: {
    'storybook/docs/panel': { index: -1 },
  },
};

addDecorator(withPropsTable);
