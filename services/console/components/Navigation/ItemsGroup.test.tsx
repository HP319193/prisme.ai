import renderer from 'react-test-renderer';
import ItemsGroup from './ItemsGroup';

it('should render', () => {
  const root = renderer.create(
    <ItemsGroup open title="Foo">
      <div>Bar</div>
    </ItemsGroup>
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it('should render closed', () => {
  const root = renderer.create(
    <ItemsGroup open={false} title="Foo">
      <div>Bar</div>
    </ItemsGroup>
  );
  expect(root.toJSON()).toMatchSnapshot();
});
