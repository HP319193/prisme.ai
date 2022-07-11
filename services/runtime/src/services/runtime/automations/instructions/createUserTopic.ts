import { Broker } from '@prisme.ai/broker';
import { Cache } from '../../../../cache';
import { EventType } from '../../../../eda';
import { PrismeError } from '../../../../errors';
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
    throw new PrismeError(`Topic ${topic.topic} already exists`, {
      topic: topic.topic,
    });
  }
  return await broker.send<Prismeai.CreatedUserTopic['payload']>(
    EventType.CreatedUserTopic,
    { topic },
    appContext
  );
}
