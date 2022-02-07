import Conditions from './Conditions';
import renderer, { act } from 'react-test-renderer';
import { useUpdateNodeInternals } from 'react-flow-renderer';

jest.mock('./context', () => {
  const mock = {
    getApp: () => ({
      name: 'App',
      icon: '/icon.svg',
    }),
  };
  return {
    useAutomationBuilder: () => mock,
  };
});

jest.mock('./Block', () => () => null);

jest.mock('react-flow-renderer', () => {
  const mock = jest.fn();
  return {
    Handle: () => <div>Handle</div>,
    Position: {
      Bottom: 0,
    },
    useUpdateNodeInternals: () => mock,
  };
});

it('should render', () => {
  const root = renderer.create(
    <Conditions
      id="a"
      data={{}}
      type="conditions"
      selected={false}
      isConnectable={false}
    />
  );
  expect(root.toJSON()).toMatchSnapshot();

  act(() => {
    root.update(
      <Conditions
        id="b"
        data={{}}
        type="conditions"
        selected={false}
        isConnectable={false}
      />
    );
  });

  expect(useUpdateNodeInternals()).toHaveBeenCalledWith('b');
});
