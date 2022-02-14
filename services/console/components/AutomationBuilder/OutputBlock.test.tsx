import OutputBlock from './OutputBlock';
import renderer, { act } from 'react-test-renderer';
import { useAutomationBuilder } from './context';
import Block from './Block';
import { Trans } from 'next-i18next';

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
  return {
    Handle: () => <div>Handle</div>,
    Position: {
      Bottom: 0,
    },
  };
});

it('should render', () => {
  const root = renderer.create(
    <OutputBlock
      id="a"
      data={{}}
      type="outputValue"
      selected={false}
      isConnectable={false}
    />
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it('should edit', () => {
  useAutomationBuilder().editOutput = jest.fn();
  const root = renderer.create(
    <OutputBlock
      id="a"
      data={{}}
      type="outputValue"
      selected={false}
      isConnectable={false}
    />
  );

  act(() => {
    root.root.findByType(Block).props.onEdit();
  });
  expect(useAutomationBuilder().editOutput).toHaveBeenCalled();
});
