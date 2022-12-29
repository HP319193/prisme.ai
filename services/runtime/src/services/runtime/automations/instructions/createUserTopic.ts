import { Broker } from '@prisme.ai/broker';
import { Cache } from '../../../../cache';
import { EventType } from '../../../../eda';
import { AppContext } from '../../../workspaces';
import { ContextsManager } from '../../contexts';

export async function createUserTopic(
  topic: Prismeai.CreateUserTopic['createUserTopic'],
  broker: Broker,
  ctx: ContextsManager,
  cache: Cache,
  appContext?: AppContext
) {
  const created = await cache.createUserTopic(ctx.workspaceId, topic.topic);
  if (created == 0) {
    return true;
  }
  return await broker.send<Prismeai.CreatedUserTopic['payload']>(
    EventType.CreatedUserTopic,
    topic,
    appContext
  );
}
