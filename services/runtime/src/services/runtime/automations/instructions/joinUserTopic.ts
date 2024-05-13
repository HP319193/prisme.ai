import { Broker } from '@prisme.ai/broker';
import { Cache } from '../../../../cache';
import { EventType } from '../../../../eda';
import { PrismeError } from '../../../../errors';
import { AppContext } from '../../../workspaces';
import { ContextsManager } from '../../contexts';

export async function joinUserTopic(
  join: Prismeai.JoinUserTopic['joinUserTopic'],
  broker: Broker,
  ctx: ContextsManager,
  cache: Cache,
  appContext?: AppContext
) {
  if (!join?.userIds?.length && ctx.session?.userId) {
    join.userIds = [ctx.session?.userId];
  }

  if (!join.topic || !join.userIds?.length) {
    throw new PrismeError(
      'Invalid joinUserTopic instruction : missing topic name or userId',
      join
    );
  }

  if (join.create === false) {
    const exists = await cache.checkUserTopicExists(
      ctx.workspaceId,
      join.topic
    );
    if (!exists) {
      throw new PrismeError(
        `Cannot join topic ${join.topic} as it does not exist`,
        {
          topic: join.topic,
        }
      );
    }
  }
  return await Promise.all(
    (join.userIds || []).map(async (userId) => {
      return await broker.send<Prismeai.JoinedUserTopic['payload']>(
        EventType.JoinedUserTopic,
        {
          topic: join.topic,
          user: {
            id: userId,
          },
        },
        appContext
      );
    })
  );
}
