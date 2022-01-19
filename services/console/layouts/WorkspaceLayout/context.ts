import { createContext, useContext } from "react";
import Events from "../../api/events";
import { Event, Workspace } from "../../api/types";

export type EventsByDay = Map<number, Set<Event<Date>>>;
export interface WorkspaceContext {
  workspace: Workspace;
  loading: boolean;
  events: EventsByDay | 'loading';
  nextEvents: () => void;
}

export const workspaceContext = createContext<WorkspaceContext>({
  workspace: {} as Workspace,
  loading: false,
  events: 'loading',
  nextEvents() { }
});

export const useWorkspace = () => useContext(workspaceContext);

export default workspaceContext;
