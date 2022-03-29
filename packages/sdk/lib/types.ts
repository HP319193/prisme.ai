import '@prisme.ai/types';

export interface Workspace extends Prismeai.Workspace {
  id: string;
}

export interface Event<DateType extends Date | string>
  extends Omit<Prismeai.PrismeEvent, 'createdAt'> {
  createdAt: DateType;
}

export interface ApiError extends Error {
  details: Record<string, string>;
}
