import { Permissions } from '@prisme.ai/permissions';
import { WorkspaceSubscriber } from '../../../cache';
import { SubjectType } from '../../../permissions';

export type Subscriber = Omit<WorkspaceSubscriber, 'permissions'> & {
  permissions: Permissions<SubjectType>;
  unsubscribe?: () => void;
  local?: boolean; // If true, means the corresponding socket is connected to current instance
  oldSocketId?: string; // When reconnecting to a previous socketId, Joined event sets oldSocketId to the temporary & new socketId & socketId to the reconnected previous socketId
};

export type LocalSubscriber = Omit<Subscriber, 'local' | 'unsubscribe'> &
  Required<Pick<Subscriber, 'local' | 'unsubscribe' | 'permissions'>>;

export type WorkspaceId = string;
export type UserId = string;

export type WorkspaceSubscribers = {
  all: Subscriber[];
  userIds: Record<UserId, Subscriber[]>;
};
