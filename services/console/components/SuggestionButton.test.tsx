import renderer from 'react-test-renderer';
import SuggestionButton from './SuggestionButton';

it('should render', () => {
  const root = renderer.create(
    <SuggestionButton title="foo" text="bar" color="red" />
  );
  expect(root.toJSON()).toMatchSnapshot();
});
