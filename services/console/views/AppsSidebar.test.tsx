import AppsSidebar from './AppsSidebar';
import renderer from 'react-test-renderer';

jest.mock('../utils/useYaml', () => {
  const toJSON = jest.fn();
  const toYaml = jest.fn();
  const useYaml = jest.fn(() => ({
    toJSON,
    toYaml,
  }));
  return useYaml;
});

it('should render', () => {
  const root = renderer.create(<AppsSidebar />);
  expect(root.toJSON()).toMatchSnapshot();
});
