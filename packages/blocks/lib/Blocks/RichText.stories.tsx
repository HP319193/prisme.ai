import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { FC, LinkHTMLAttributes, useState } from 'react';
import { BlockProvider, BlocksProvider } from '../Provider';
import RichText from './RichText';

export default {
  title: 'Blocks/RichText',
};

const Link: FC = ({
  children,
  href,
}: LinkHTMLAttributes<HTMLAnchorElement>) => {
  return <button onClick={action(`navigate to ${href}`)}>{children}</button>;
};

const Loading = () => {
  return <div>wait for it</div>;
};
const Template: Story<any> = ({ defaultConfig }) => {
  const [config, setConfig] = useState<any>(defaultConfig);
  const [appConfig, setAppConfig] = useState<any>();

  return (
    <BlocksProvider components={{ Link, Loading }} externals={{}}>
      <BlockProvider
        config={config}
        onConfigUpdate={setConfig}
        appConfig={appConfig}
        onAppConfigUpdate={setAppConfig}
      >
        <RichText />
      </BlockProvider>
    </BlocksProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  defaultConfig: {
    content: `<div>
<h1>HTML</h1>
<p>Hello <a href="https://prisme.ai">World</a></p>

# Markdown

This is some __markdown__ content with [link](https://prisme.ai).
</div>`,
  },
};
