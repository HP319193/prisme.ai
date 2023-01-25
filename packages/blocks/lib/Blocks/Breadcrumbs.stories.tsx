import { Story } from '@storybook/react';
import { FC } from 'react';
import { BlockProvider, BlocksProvider } from '../Provider';
import Breadcrumbs from './Breadcrumbs';

export default {
  title: 'Blocks/Breadcrumbs',
};

const Link: FC<{ href: string }> = ({ href, children }) => {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        history.pushState({}, '', href);
      }}
    >
      {children}
    </a>
  );
};

const Template: Story<any> = (props) => (
  <BlocksProvider
    components={{
      Link,
      Loading: () => null,
      DownIcon: () => null,
      SchemaForm: () => null,
    }}
    externals={{}}
    utils={{
      BlockLoader: ({ name, ...config }) => <div>Block {name}</div>,
    }}
  >
    <BlockProvider config={props}>
      <Breadcrumbs {...props} Link={Link} />
    </BlockProvider>
  </BlocksProvider>
);

export const Default = Template.bind({});
Default.args = {
  links: [
    {
      href: '/',
      label: 'Root',
    },
    {
      href: '/foo',
      label: 'Foo',
    },
    {
      href: '/foo/bar',
      label: 'Bar',
    },
  ],
};
