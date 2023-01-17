import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { FC, LinkHTMLAttributes, useState } from 'react';
import { BlockProvider, BlocksProvider } from '../Provider';
import RichText from './RichText';
import { tw } from 'twind';
import { PreviewInStory } from './PreviewInStory';

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
const DownIcon = () => null;
const Template: Story<any> = ({ defaultConfig }) => {
  const [config, setConfig] = useState<any>(defaultConfig);
  const [appConfig, setAppConfig] = useState<any>();

  return (
    <div className={tw`flex flex-1 flex-col justify-between`}>
      <BlocksProvider components={{ Link, Loading, DownIcon }} externals={{}}>
        <BlockProvider
          config={config}
          onConfigUpdate={setConfig}
          appConfig={appConfig}
          onAppConfigUpdate={setAppConfig}
        >
          <RichText />
          {RichText.Preview && <PreviewInStory Preview={RichText.Preview} />}
        </BlockProvider>
      </BlocksProvider>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  defaultConfig: {
    content: `
<h1>HTML</h1>
<p>Hello <a href="https://prisme.ai">World</a></p>

# Markdown

This is some __markdown__ content with [link](https://prisme.ai).
`,
  },
};

export const OneTag = Template.bind({});
OneTag.args = {
  defaultConfig: {
    content: `# Just a title`,
  },
};

export const NestedDivs = Template.bind({});
NestedDivs.args = {
  defaultConfig: {
    content: `<div class="contacts" prout-truc="chose">
                    <div class="contactElement">
                      Hello 
                    </div>
                    </div>
`,
  },
};

export const WithScript = Template.bind({});
WithScript.args = {
  defaultConfig: {
    content: `<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.3/jquery.min.js"></script>
<script>alert(jQuery)</script>
`,
    allowScripts: true,
  },
};

export const WithLinks = Template.bind({});
WithLinks.args = {
  defaultConfig: {
    content: `<a href="https://prisme.ai">Prisme.ai</a>
<a href="https://prisme.ai" target="_blank">Prisme.ai too</a>
`,
  },
};
