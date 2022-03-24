import { EventsFilters } from '@prisme.ai/types/additional';

export const filterEmpty = (filters: EventsFilters) => {
  return !(
    filters.text ||
    filters.beforeDate ||
    filters.afterDate ||
    Array.from(Object.values(filters.query || {})).length > 0
  );
};
