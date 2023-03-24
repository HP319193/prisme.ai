import { Feed } from '@prisme.ai/design-system';
import renderer, { act } from 'react-test-renderer';
import EventsList from './EventsList';

jest.mock('../../utils/dates', () => {
  const dateFormat = jest.fn(
    (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  );
  return {
    useDateFormat: () => dateFormat,
  };
});

it('should render', () => {
  const events = new Set([
    {
      id: '4',
      type: 'event a',
      createdAt: new Date('2022-01-02T08:02'),
      source: {
        host: {
          service: 'osef',
        },
        correlationId: 'osef',
      },
      size: 0,
    },
    {
      id: '3',
      type: 'event c',
      createdAt: new Date('2022-01-01T10:01'),
      source: {
        host: {
          service: 'osef',
        },
        correlationId: 'osef',
      },
      size: 0,
    },
    {
      id: '2',
      type: 'event b',
      createdAt: new Date('2022-01-01T10:00'),
      source: {
        host: {
          service: 'osef',
        },
        correlationId: 'osef',
      },
      size: 0,
    },
    {
      id: '1',
      type: 'event a',
      createdAt: new Date('2022-01-01T00:00'),
      source: {
        host: {
          service: 'osef',
        },
        correlationId: 'osef',
      },
      size: 0,
    },
  ]);
  const read = jest.fn();
  const isRead = jest.fn(() => false);
  const root = renderer.create(
    <EventsList
      events={events}
      read={read}
      isRead={isRead}
      workspaceName="Foo"
    />
  );

  const sections = root.root.findByType(Feed).props.sections;
  expect(sections.length).toBe(2);
  expect(sections[0].title).toBe('2022-0-2');
  expect(sections[1].title).toBe('2022-0-1');

  const content1 = renderer.create(sections[0].content);
  expect(content1.root.props.items.length).toBe(1);

  const content2 = renderer.create(sections[1].content);
  expect(content2.root.props.items.length).toBe(3);

  content2.root.props.onChange(['2']);
  expect(read).toHaveBeenCalledWith('2');
});
