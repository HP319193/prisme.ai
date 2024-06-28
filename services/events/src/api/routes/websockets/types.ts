import { SearchOptions } from '../../../services/events/store';

export const WORKSPACE_NSP_PATTERN = /^\/v2\/workspaces\/([\w-_]+)\/events$/;
export const getWorkspaceNsp = (workspaceId: string) =>
  `/v2/workspaces/${workspaceId}/events`;

export interface SocketCtx {
  workspaceId: string;
  userId: string;
  sessionId: string;
  socketId: string;
  reuseSocketId?: string;
  userIp: string;
  filters: SearchOptions;
  apiKey?: string;
  authData?: Record<string, any>;
}
