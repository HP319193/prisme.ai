import { EventsContext } from './EventsProvider';

export const eventsContextValue: EventsContext = {
  events: new Set(),
  fetchEvents: jest.fn(),
  loading: false,
  fetchNextEvents: jest.fn(),
  filters: {},
  hasMore: true,
  isRead: jest.fn(() => false),
  read: jest.fn(),
  isVirgin: false,
  setFilters: jest.fn(),
};

export default eventsContextValue;
