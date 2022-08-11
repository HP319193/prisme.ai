import { createContext, FC, useContext } from 'react';
import { Event, Events, EventsFilters, Workspace } from '@prisme.ai/sdk';

export type Pagination = {
  page: PrismeaiAPI.EventsLongpolling.Parameters.Page;
  limit: PrismeaiAPI.EventsLongpolling.Parameters.Limit;
};
export type EventsByDay = Map<number, Set<Event<Date>>>;
export interface WorkspaceContext {
  workspace: Workspace;
  loading: boolean;
  filters: EventsFilters;
  updateFilters: (newFilters: EventsFilters) => void;
  save: (workspace: Workspace) => void;
  saveSource: (newSource: Workspace) => void;
  events: EventsByDay | 'loading';
  nextEvents: () => void;
  readEvents: Set<string>;
  readEvent: (eventId: string) => void;
  share?: {
    label: string;
    component: FC;
  };
  setShare: (share: WorkspaceContext['share']) => void;
  getAppConfig: (appInstance: string) => any;
  saveAppConfig: (appInstance: string, config: any) => void;
  installApp: (
    workspaceId: PrismeaiAPI.InstallAppInstance.PathParameters['workspaceId'],
    body: PrismeaiAPI.InstallAppInstance.RequestBody
  ) => Promise<Prismeai.AppInstance | null>;
  createAutomation: (
    automation: Prismeai.Automation
  ) => Promise<(Prismeai.Automation & { slug: string }) | null>;
  updateAutomation: (
    slug: string,
    automation: Prismeai.Automation
  ) => Promise<(Prismeai.Automation & { slug: string }) | null>;
  deleteAutomation: (slug: string) => Promise<Prismeai.Automation | null>;
  socket?: Events;
}

export const workspaceProviderContext = createContext<WorkspaceContext>({
  workspace: {} as Workspace,
  loading: false,
  filters: {} as EventsFilters,
  updateFilters: () => {},
  save() {},
  saveSource() {},
  events: 'loading',
  nextEvents() {},
  readEvents: new Set(),
  readEvent() {},
  setShare() {},
  getAppConfig() {},
  saveAppConfig() {},
  installApp: () => ({} as any),
  createAutomation: async () => ({} as Prismeai.Automation & { slug: string }),
  updateAutomation: async () => ({} as Prismeai.Automation & { slug: string }),
  deleteAutomation: async () => ({} as Prismeai.Automation),
});

export const useWorkspace = () => useContext(workspaceProviderContext);

export default workspaceProviderContext;
