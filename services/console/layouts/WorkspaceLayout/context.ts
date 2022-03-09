import { createContext, FC, useContext } from 'react';
import { Event, Workspace } from '@prisme.ai/sdk';
import { ValidationError } from '../../utils/yaml';

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
  save: () => void;
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
  save() {},
  saving: false,
  events: 'loading',
  nextEvents() {},
  readEvents: new Set(),
  readEvent() {},
  setShare() {},
});

export const useWorkspace = () => useContext(workspaceContext);

export default workspaceContext;
