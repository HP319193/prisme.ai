import { FC } from 'react';
import renderer from 'react-test-renderer';
import { BlockProvider, BlocksProvider } from '../Provider';
import RichText from './RichText';

jest.mock('../utils/generateId', () => {
  return function generateId() {
    return 'unique-id';
  };
});

const Link: FC = ({ children }) => <a>{children}</a>;
const Loading = () => <div />;
const DownIcon = () => <div />;
const SchemaForm = () => <div />;

it('should render', () => {
  const content = {
    en: `# Title
## Subtitle

Some content with <a href="https://prisme.ai">HTML</a>
`,
  };
  const root = renderer.create(
    <BlocksProvider
      components={{ Link, Loading, DownIcon, SchemaForm }}
      externals={{}}
    >
      <BlockProvider config={{ content }}>
        <RichText />
      </BlockProvider>
    </BlocksProvider>
  );
  expect(root.toJSON()).toMatchSnapshot();
});
