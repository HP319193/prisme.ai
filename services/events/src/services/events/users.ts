import { Cache } from '../../cache';

export interface WorkspaceUser {
  id: string;
  sessionId: string;
  topics: string[];
  authData?: Prismeai.User['authData'];
}

export async function getWorkspaceUser(
  workspaceId: string,
  user: Omit<WorkspaceUser, 'topics'>,
  cache: Cache
): Promise<WorkspaceUser> {
  return {
    ...user,
    topics: await cache.listUserTopics(workspaceId, user.id),
  };
}
