import { createContext, useContext } from 'react';
import { Event, Workspace } from '@prisme.ai/sdk';
import { ValidationError } from '../../utils/yaml';

export type EventsByDay = Map<number, Set<Event<Date>>>;
export interface WorkspaceContext {
  workspace: Workspace;
  loading: boolean;
  save: () => void;
  saving: boolean;
  events: EventsByDay | 'loading';
  nextEvents: () => void;
  readEvents: Set<string>;
  readEvent: (eventId: string) => void;
  displaySource: (status: boolean) => void;
  sourceDisplayed: boolean;
  invalid: false | ValidationError[];
  setInvalid: (invalid: WorkspaceContext['invalid']) => void;
  newSource?: Workspace;
  setNewSource: (fn: WorkspaceContext['newSource']) => void;
}

export const workspaceContext = createContext<WorkspaceContext>({
  workspace: {} as Workspace,
  loading: false,
  save() {},
  saving: false,
  events: 'loading',
  nextEvents() {},
  readEvents: new Set(),
  readEvent() {},
  displaySource() {},
  sourceDisplayed: false,
  invalid: false,
  setInvalid() {},
  setNewSource() {},
});

export const useWorkspace = () => useContext(workspaceContext);

export default workspaceContext;
