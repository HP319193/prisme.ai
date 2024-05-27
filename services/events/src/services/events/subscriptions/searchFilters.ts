import { PrismeEvent } from '@prisme.ai/broker';
import { SearchOptions } from '../store';

import { extractObjectsByPath } from '../../../utils';

export const searchFilters: {
  [k in keyof Required<SearchOptions>]: (
    event: PrismeEvent,
    opts: SearchOptions[k],
    ctx: { socketId?: string }
  ) => boolean;
} = {
  text: (event, value) => {
    return !value || JSON.stringify(event).includes(value);
  },
  types: (event, allowedTypes) => {
    return !allowedTypes || allowedTypes.includes(event.type);
  },
  beforeDate: (event, date) =>
    !date || new Date(event.createdAt).getTime() < new Date(date).getTime(),
  afterDate: (event, date) =>
    !date || new Date(event.createdAt).getTime() > new Date(date).getTime(),
  appInstanceDepth: (event, depth) =>
    typeof depth === 'number' && event.source?.appInstanceDepth
      ? event.source?.appInstanceDepth <= depth
      : true,
  payloadQuery: function matchQuery(
    event,
    query,
    ctx?: { socketId?: string }
  ): boolean {
    if (!query) {
      return true;
    }
    if (Array.isArray(query)) {
      return query.some((query) => matchQuery(event, query, ctx));
    }
    const { currentSocket: currentSocketOnly = true } = event?.target || {};
    // By default, events coming from a socket are not sent to others sockets listening to the same session
    if (
      'source.sessionId' in query &&
      !('source.socketId' in query) &&
      ctx?.socketId &&
      event?.source?.socketId &&
      currentSocketOnly &&
      event?.source?.socketId !== ctx?.socketId
    ) {
      return false; // Do not send
    }

    return Object.entries(query)
      .map(([k, expected]) => {
        const found = extractObjectsByPath(event, k);
        if (Array.isArray(expected)) {
          return expected.includes(found);
        }
        if (!expected) {
          return !found;
        }
        if (
          typeof found !== 'string' ||
          typeof expected !== 'string' ||
          (expected[expected.length - 1] !== '*' && expected[0] !== '*')
        ) {
          return found === expected;
        }
        // Only support beginning OR ending wildcard for the moment
        return expected[0] === '*'
          ? found.endsWith(expected.slice(1))
          : found.startsWith(expected.slice(0, -1));
      })
      .every(Boolean);
  },

  // Noop
  beforeId: () => true,
  page: () => true,
  limit: () => true,
  sort: () => true,
};
