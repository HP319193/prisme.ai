import { createContext, FC, useContext } from 'react';
import { Event, EventsFilters, Workspace } from '@prisme.ai/sdk';
import { ValidationError } from '../../utils/yaml';

export type Pagination = {
  page: PrismeaiAPI.EventsLongpolling.Parameters.Page;
  limit: PrismeaiAPI.EventsLongpolling.Parameters.Limit;
};
export type EventsByDay = Map<number, Set<Event<Date>>>;
export interface WorkspaceContext {
  displaySource: (status: boolean) => void;
  sourceDisplayed: boolean;
  invalid: false | ValidationError[];
  setInvalid: (invalid: WorkspaceContext['invalid']) => void;
  newSource?: Workspace;
  setNewSource: (fn: WorkspaceContext['newSource']) => void;
  fullSidebar: boolean;
  setFullSidebar: (s: boolean) => void;

  // To move into a WorkspaceProvider
  workspace: Workspace;
  loading: boolean;
  filters: EventsFilters;
  updateFilters: (newFilters: EventsFilters) => void;
  save: (workspace: Workspace) => void;
  saveSource: () => void;
  saving: boolean;
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
  createAutomation: (
    automation: Prismeai.Automation
  ) => Promise<(Prismeai.Automation & { slug: string }) | null>;
  updateAutomation: (
    slug: string,
    automation: Prismeai.Automation
  ) => Promise<(Prismeai.Automation & { slug: string }) | null>;
  deleteAutomation: (slug: string) => Promise<Prismeai.Automation | null>;
}

export const workspaceContext = createContext<WorkspaceContext>({
  displaySource() {},
  sourceDisplayed: false,
  invalid: false,
  setInvalid() {},
  setNewSource() {},
  fullSidebar: false,
  setFullSidebar() {},
  //
  workspace: {} as Workspace,
  loading: false,
  filters: {} as EventsFilters,
  updateFilters: () => {},
  save() {},
  saveSource() {},
  saving: false,
  events: 'loading',
  nextEvents() {},
  readEvents: new Set(),
  readEvent() {},
  setShare() {},
  getAppConfig() {},
  saveAppConfig() {},
  createAutomation: async () => ({} as Prismeai.Automation & { slug: string }),
  updateAutomation: async () => ({} as Prismeai.Automation & { slug: string }),
  deleteAutomation: async () => ({} as Prismeai.Automation),
});

export const useWorkspace = () => useContext(workspaceContext);

export default workspaceContext;
