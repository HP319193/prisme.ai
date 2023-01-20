import renderer from 'react-test-renderer';
import { BlocksProvider } from '../Provider';
import { BlocksList } from './BlocksList';

it('should render', () => {
  const root = renderer.create(
    <BlocksProvider
      components={{
        Link: (props) => <a {...props} />,
        Loading: () => null,
        DownIcon: () => null,
        SchemaForm: () => null,
      }}
      externals={{}}
      utils={{
        BlockLoader: ({ name, ...config }) => <div>Block {name}</div>,
      }}
    >
      <BlocksList
        blocks={[
          {
            slug: 'Header',
            title: 'The title',
          },
          {
            slug: 'RichText',
            content: 'The content',
          },
        ]}
      />
    </BlocksProvider>
  );

  expect(root.toJSON()).toMatchSnapshot();
});
