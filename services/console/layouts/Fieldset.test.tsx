import Fieldset from './Fieldset';
import renderer from 'react-test-renderer';

it('should render', () => {
  const root = renderer.create(<Fieldset legend="foo">bar</Fieldset>);
  expect(root.toJSON()).toMatchSnapshot();
});
