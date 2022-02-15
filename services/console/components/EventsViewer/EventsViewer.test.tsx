import EventsViewer from './EventsViewer';
import renderer, { act } from 'react-test-renderer';
import { useWorkspace } from '../../layouts/WorkspaceLayout';
import { Event } from '../../api/types';

jest.mock('../../api/events', () => {
  class Events {
    static listeners: any[] = [];
    all(listener: any) {
      Events.listeners.push(listener);
      return () => {
        Events.listeners.splice(Events.listeners.indexOf(listener, 1));
      };
    }
  }
  return Events;
});

jest.mock('../../layouts/WorkspaceLayout', () => {
  const mock = {
    events: 'loading',
    readEvents: new Set(),
  };
  return {
    useWorkspace: () => mock,
  };
});

jest.mock('../../utils/dates', () => {
  const mock = jest.fn();
  return {
    useDateFormat: () => mock,
  };
});

jest.mock('next/router', () => {
  const mock = { push: jest.fn() };
  return {
    useRouter: () => mock,
  };
});

const now = Date.now;
afterEach(() => {
  Date.now = now;
});

it('should render loading', () => {
  const root = renderer.create(<EventsViewer />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should render empty', () => {
  useWorkspace().events = new Map();
  const root = renderer.create(<EventsViewer />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should render events', async () => {
  useWorkspace().events = new Map([
    [
      1325376000000,
      new Set([
        { id: '1', createdAt: new Date('2012-01-01 16:12') } as Event<Date>,
        { id: '2', createdAt: new Date('2012-01-01 12:12') } as Event<Date>,
        { id: '3', createdAt: new Date('2012-01-01 01:12') } as Event<Date>,
      ]),
    ],
    [
      1325548800000,
      new Set([{ id: '4', createdAt: new Date('2012-01-03') } as Event<Date>]),
    ],
    [
      1325462400000,
      new Set([{ id: '5', createdAt: new Date('2012-01-02') } as Event<Date>]),
    ],
  ]);
  const root = renderer.create(<EventsViewer />);

  await act(async () => {
    await true;
  });
  expect(root.toJSON()).toMatchSnapshot();
});
