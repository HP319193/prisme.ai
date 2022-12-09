import {
  createContext,
  ReactNode,
  useEffect,
  useCallback,
  useState,
  useRef,
} from 'react';
import api, { Event, Events } from '../../utils/api';
import Storage from '../../utils/Storage';
import { useContext } from '../../utils/useContext';

const READ_KEY = 'readEvents';
const PER_PAGE = 50;

export interface EventsContext {
  events: Set<Event<Date>>;
  loading: boolean;
  fetchEvents: (
    filters?: EventsContext['filters']
  ) => Promise<Set<Event<Date>>>;
  fetchNextEvents: () => Promise<Set<Event<Date>>>;
  hasMore: boolean;
  filters: Record<string, any>;
  setFilters: (filters: EventsContext['filters']) => void;
  isRead: (id: string) => boolean;
  read: (id: string) => void;
  isVirgin: boolean;
}

export const eventsContext = createContext<EventsContext | undefined>(
  undefined
);

export const useEvents = () => useContext<EventsContext>(eventsContext);

interface EventsProviderProps {
  workspaceId: string;
  children: ReactNode;
}

export const EventsProvider = ({
  workspaceId,
  children,
}: EventsProviderProps) => {
  const [events, setEvents] = useState<EventsContext['events']>(new Set());
  const [loading, setLoading] = useState<EventsContext['loading']>(true);
  const [filters, setFilters] = useState<EventsContext['filters']>({});
  const [isVirgin, setIsVirgin] = useState(false);
  const [eventsRead, setEventsRead] = useState<Set<string>>(
    new Set(Storage.get(`${READ_KEY}-${workspaceId}`))
  );
  const eventsSocket = useRef<Events>();

  const lastPage = useRef(0);
  const hasMore = useRef(true);
  const fetching = useRef(false);
  const fetchEvents: EventsContext['fetchEvents'] = useCallback(
    async (filters = {}) => {
      fetching.current = true;
      const withLimit = {
        limit: PER_PAGE,
        page: lastPage.current++,
        ...filters,
      };
      const events = await api.getEvents(workspaceId, withLimit);
      hasMore.current = events.length === withLimit.limit;
      fetching.current = false;
      return new Set(events);
    },
    [workspaceId]
  );

  const fetchNextEvents: EventsContext['fetchNextEvents'] = useCallback(async () => {
    try {
      if (fetching.current) {
        throw new Error();
      }

      const next = await fetchEvents(filters);

      if (next.size === 0) {
        throw new Error();
      }
      setEvents(
        (events) => new Set([...Array.from(events), ...Array.from(next)])
      );
      return next;
    } catch {
      return new Set();
    }
  }, [fetchEvents, fetching, filters]);

  const isRead: EventsContext['isRead'] = useCallback(
    (id) => eventsRead.has(id),
    [eventsRead]
  );
  const read: EventsContext['read'] = useCallback((id) => {
    setEventsRead((prev) => new Set([...Array.from(prev), id]));
  }, []);

  useEffect(() => {
    if (eventsRead.size === 0) return;
    Storage.set(`${READ_KEY}-${workspaceId}`, Array.from(eventsRead));
  }, [eventsRead, workspaceId]);

  // Fetch first page on init or when filters changes
  useEffect(() => {
    const initEvents = async () => {
      console.log('WESH');
      setLoading(true);
      lastPage.current = 0;
      const events = await fetchEvents(filters);
      setIsVirgin(events.size < 2 && Object.keys(filters).length === 0);
      setEvents(events);
      setLoading(false);
    };
    // Delay in case of filters coming in quasi same time
    const t = setTimeout(initEvents, 500);
    return () => {
      clearTimeout(t);
    };
  }, [fetchEvents, filters]);

  // Init decicated websocket
  useEffect(() => {
    const initSocket = async () => {
      eventsSocket.current = await api.streamEvents(workspaceId, filters);
      eventsSocket.current.all((type, event) => {
        setEvents((prev) => {
          const newEvent: Event<Date> = {
            ...event,
            createdAt: new Date(event.createdAt),
          };
          return new Set([newEvent, ...Array.from(prev)]);
        });
      });
    };
    initSocket();

    return () => {
      eventsSocket.current && eventsSocket.current.destroy();
    };
  }, [workspaceId, filters]);

  return (
    <eventsContext.Provider
      value={{
        events,
        loading,
        fetchEvents,
        fetchNextEvents,
        hasMore: hasMore.current,
        filters,
        setFilters,
        isRead,
        read,
        isVirgin,
      }}
    >
      {children}
    </eventsContext.Provider>
  );
};
