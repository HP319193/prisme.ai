import { EventsFilters } from '../layouts/WorkspaceLayout';

export const filterEmpty = (filters: EventsFilters) => {
  return !(
    filters.text ||
    filters.beforeDate ||
    filters.afterDate ||
    Array.from(Object.values(filters.query || {})).length > 0
  );
};
