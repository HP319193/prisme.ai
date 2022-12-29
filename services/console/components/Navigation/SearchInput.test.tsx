import renderer from 'react-test-renderer';
import SearchInput from './SearchInput';

it('should render', () => {
  const root = renderer.create(
    <SearchInput value="foo" onChange={console.log} />
  );
  expect(root.toJSON()).toMatchSnapshot();
});
