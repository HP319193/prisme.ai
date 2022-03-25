import '@prisme.ai/types';

export interface Workspace extends Prismeai.Workspace {
  id: string;
}

export interface Event<DateType extends Date | string>
  extends Omit<Prismeai.PrismeEvent, 'createdAt'> {
  createdAt: DateType;
}

export type EventsFilters = {
  afterDate?: PrismeaiAPI.EventsLongpolling.Parameters.AfterDate;
  beforeDate?: PrismeaiAPI.EventsLongpolling.Parameters.BeforeDate;
  text?: PrismeaiAPI.EventsLongpolling.Parameters.Text;
  query?: PrismeaiAPI.EventsLongpolling.Parameters.Query;
};
