import Trigger, { TriggerDisplay } from './Trigger';
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
    <Trigger
      id="a"
      data={{}}
      type="trigger"
      selected={false}
      isConnectable={false}
    />
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it('should edit', () => {
  useAutomationBuilder().editTrigger = jest.fn();
  const root = renderer.create(
    <Trigger
      id="a"
      data={{}}
      type="trigger"
      selected={false}
      isConnectable={false}
    />
  );

  act(() => {
    root.root.findByType(Block).props.onEdit();
  });
  expect(useAutomationBuilder().editTrigger).toHaveBeenCalled();
});

it('should copy endpoint', () => {
  const root = renderer.create(
    <TriggerDisplay value={{ endpoint: 'true' }} endpoint="http://endpoint" />
  );
  const e = { preventDefault: jest.fn(), stopPropagation: jest.fn() };
  (window.navigator.clipboard as any) = {
    writeText: jest.fn(),
  };

  root.root.findByType(Trans).props.components.a.props.onClick(e);
  expect(e.preventDefault).toHaveBeenCalled();
  expect(e.stopPropagation).toHaveBeenCalled();
  expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(
    'http://endpoint'
  );
});
