import { FC } from 'react';
import renderer from 'react-test-renderer';
import { BlockProvider, BlocksProvider } from '../Provider';
import RichText from './RichText';

const Link: FC = ({ children }) => <a>{children}</a>;
const Loading = () => <div />;

it('should rneder', () => {
  const content = {
    en: `# Title
## Subtitle

Some content with <a href="https://prisme.ai">HTML</a>
`,
  };
  const root = renderer.create(
    <BlocksProvider components={{ Link, Loading }} externals={{}}>
      <BlockProvider config={{ content }}>
        <RichText />
      </BlockProvider>
    </BlocksProvider>
  );
  expect(root.toJSON()).toMatchSnapshot();
});
