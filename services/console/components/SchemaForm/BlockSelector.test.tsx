import renderer from 'react-test-renderer';
import BlockSelector from './BlockSelector';

jest.mock('react-final-form', () => {
  const mock = {
    input: {
      value: '',
      onChange: jest.fn(),
    },
    meta: {},
  };
  return {
    useField: () => mock,
  };
});

jest.mock('../PageBuilder/useBlocks', () => {
  const mock = { variants: [] };
  return () => mock;
});

jest.mock('../PageBuilder/Panel/EditSchema/getEditSchema', () => {
  return () => ({});
});

it('should render', () => {
  const root = renderer.create(<BlockSelector name="foo" schema={{}} />);
  expect(root.toJSON()).toMatchSnapshot();
});
