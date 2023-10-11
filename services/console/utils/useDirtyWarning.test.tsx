import { useState } from 'react';
import renderer, { act } from 'react-test-renderer';
import useDirtyWarning from './useDirtyWarning';
// @ts-ignore
import { mock } from 'next/router';
import { Modal } from 'antd';

jest.mock('next/router', () => {
  const listeners: Function[] = [];
  const mock = {
    listeners,
    events: {
      on: jest.fn((event: string, fn: Function) => listeners.push(fn)),
      off: jest.fn((event: string, fn: Function) => {
        const i = listeners.indexOf(fn);
        listeners.splice(i, 1);
      }),
    },
  };
  return {
    mock,
    useRouter: () => mock,
  };
});

jest.mock('antd', () => {
  const Modal = {
    confirm: jest.fn(),
  };
  return {
    Modal,
  };
});

interface Item {
  id: string;
}

let context: any;
let setValue: any;
const T = ({ item }: { item: Item }) => {
  const [value, _setValue] = useState(item);
  setValue = _setValue;
  context = useDirtyWarning(item, value);

  return null;
};

it('should get a warning', () => {
  const item = { id: '42' };
  const root = renderer.create(<T item={item} />);
  const confirm = Modal.confirm as jest.Mock;

  act(() => {});

  expect(context[0]).toBe(false);

  act(() => {
    mock.listeners.forEach((fn: any) => fn(''));
  });

  expect(confirm).not.toHaveBeenCalled();

  act(() => {
    setValue({ id: '43' });
  });
  expect(context[0]).toBe(true);
  let expected: any;
  act(() => {
    try {
      mock.listeners.forEach((fn: any) => fn(''));
    } catch (e) {
      expected = e;
    }
  });
  expect(expected).toBe('wait for warning');

  expect(confirm).toHaveBeenCalled();
  confirm.mockClear();

  root.update(<T item={{ id: '45' }} />);

  act(() => {});

  expect(context[0]).toBe(false);
});
