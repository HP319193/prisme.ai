import { createContext, useContext } from "react";
import { Event, Workspace } from "../../api/types";
import { ValidationError } from "../../utils/yaml";

export type EventsByDay = Map<number, Set<Event<Date>>>;
export interface WorkspaceContext {
  workspace: Workspace;
  loading: boolean;
  events: EventsByDay | 'loading';
  nextEvents: () => void;
  displaySource: boolean;
  invalid: false | ValidationError[];
  setInvalid: (invalid: WorkspaceContext["invalid"]) => void;
  dirty: boolean;
  setDirty: (dirty: WorkspaceContext["dirty"]) => void;
  newSource?: Workspace;
  setNewSource: (fn: WorkspaceContext["newSource"]) => void;
}

export const workspaceContext = createContext<WorkspaceContext>({
  workspace: {} as Workspace,
  loading: false,
  events: 'loading',
  nextEvents() { },
  displaySource: false,
  invalid: false,
  setInvalid() { },
  dirty: false,
  setDirty() { },
  setNewSource() { },
});

export const useWorkspace = () => useContext(workspaceContext);

export default workspaceContext;
