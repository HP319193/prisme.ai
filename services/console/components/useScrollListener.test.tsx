import useScrollListener from './useScrollListener';
import renderer, { act } from 'react-test-renderer';

it('should scroll', () => {
  let scrollListener: any;
  const Test = () => {
    scrollListener = useScrollListener();
    return null;
  };
  const listeners: Function[] = [];
  const element: any = {
    addEventListener: jest.fn((event, listener: any) =>
      listeners.push(listener)
    ),
    removeEventListener: jest.fn(),
    scrollHeight: 200,
    offsetHeight: 100,
    scrollTop: 0,
  };

  const root = renderer.create(<Test />);
  const off = scrollListener.ref(element);
  expect(element.addEventListener).toHaveBeenCalled();
  expect(listeners.length).toBe(1);
  expect(scrollListener.top).toBe(false);
  expect(scrollListener.bottom).toBe(false);

  act(() => {
    listeners[0]({ target: element });
  });
  expect(scrollListener.top).toBe(true);
  expect(scrollListener.bottom).toBe(false);

  element.scrollTop = 99;
  act(() => {
    listeners[0]({ target: element });
  });
  expect(scrollListener.top).toBe(false);
  expect(scrollListener.bottom).toBe(false);

  element.scrollTop = 100;
  act(() => {
    listeners[0]({ target: element });
  });
  expect(scrollListener.top).toBe(false);
  expect(scrollListener.bottom).toBe(true);

  off();
  expect(element.removeEventListener).toHaveBeenCalled();
});
